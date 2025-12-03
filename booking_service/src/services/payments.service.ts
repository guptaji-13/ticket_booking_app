// dao
import { PaymentsDAO, BookingsDAO, OutboxDAO } from "../dao/index.dao.js";

// types
import type { Payment } from "../models/index.model.js";

// utils
import { ServiceError } from "../utils/error.util.js";
import * as RazorpayHelper from "../utils/razorpay.util.js";

// constants
import { RedisKeys } from "../constants/redisKeys.js";

export class PaymentsService {
	static async initiatePayment(payload: any, userId: string) {
		try {
			const date = Date.now();
			const { bookingId, provider } = payload;
			const booking = await BookingsDAO.getBookingById(bookingId);
			if (!booking) {
				throw new ServiceError("BOOKING_NOT_FOUND");
			}
			const amount = booking.totalAmount;

			// Idempotency key
			const paymentKey = `pay_${Date.now()}_${Math.random().toString(16).slice(2)}`;

			// INSERT payment row BEFORE calling Razorpay. This ensures your system NEVER loses payment state.
			const payment = await PaymentsDAO.createPayment({
				bookingId,
				idempotencyKey: paymentKey,
				userId,
				provider,
				amount,
				status: "initiated",
				createdAt: date,
				updatedAt: date,
			});
			if (!payment) {
				throw new ServiceError("PAYMENT_CREATION_FAILED");
			}

			// Call provider using idempotency key as receipt/metadata
			let res = null;
			if (provider === "razorpay") {
				res = await RazorpayHelper.initiateRazorpayPayment(amount, paymentKey);
			}
			if (!res || res.status != "pending") {
				await PaymentsDAO.updatePayment(payment.id, {
					status: "failed",
					responseData: res?.responseData ?? null,
					updatedAt: Date.now(),
				});
				throw new ServiceError("PAYMENT_INITIATION_FAILED");
			}

			// If this fails, reconciliation worker WILL FIX IT LATER
			const updatedPayment = await PaymentsDAO.updatePayment(payment.id, {
				status: res.status,
				responseData: res?.responseData ?? null,
				updatedAt: Date.now(),
			});
			return updatedPayment;
		} catch (error) {
			throw error;
		}
	}

	static async checkPaymentStatus(paymentId: string) {
		try {
			const payment = await PaymentsDAO.getPaymentById(paymentId);
			if (!payment) {
				throw new ServiceError("PAYMENT_NOT_FOUND");
			}

			// If already processed, return directly (idempotent)
			if (payment.status === "success" || payment.status === "failed") {
				return payment;
			}

			// Fetch provider status
			let providerStatus = payment.status as Payment["status"];
			let providerData = payment.responseData ?? null;

			if (payment.provider === "razorpay") {
				const res = await RazorpayHelper.fetchRazorpayPaymentStatus(payment.idempotencyKey);
				if (res?.status) providerStatus = res.status;
				if (res?.responseData) providerData = res.responseData;
			}

			// If status unchanged → do nothing
			if (providerStatus === payment.status) {
				return payment;
			}

			// 1️⃣ Update payment status (MUST NOT rollback if worker fails later)
			await PaymentsDAO.updatePayment(payment.id, {
				status: providerStatus,
				responseData: providerData,
				updatedAt: Date.now(),
			});

			const booking = await BookingsDAO.getBookingById(payment.bookingId);
			if (!booking) {
				throw new ServiceError("BOOKING_NOT_FOUND");
			}
			// 2️⃣ Insert outbox event WHEN status becomes SUCCESS
			if (providerStatus === "success") {
				await OutboxDAO.addEvent({
					eventType: "payment_confirmed",
					aggregateId: payment.id,
					payload: {
						paymentId: payment.id,
						bookingId: payment.bookingId,
						userId: payment.userId,
						amount: payment.amount,
						provider: payment.provider,
						timestamp: Date.now(),
					},
				});
			}

			// 3️⃣ If payment failed → Update payment status
			if (providerStatus === "failed") {
				await PaymentsDAO.updatePayment(payment.id, {
					status: providerStatus,
					responseData: providerData,
					updatedAt: Date.now(),
				});
				await OutboxDAO.addEvent({
					eventType: "payment_failed",
					aggregateId: payment.id,
					payload: {
						paymentId: payment.id,
						bookingId: payment.bookingId,
						userId: payment.userId,
						amount: payment.amount,
						provider: payment.provider,
						timestamp: Date.now(),
					},
				});
			}

			return {
				...payment,
				status: providerStatus,
				responseData: providerData,
			};
		} catch (error) {
			throw error;
		}
	}
}
