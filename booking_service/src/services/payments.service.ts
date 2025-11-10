// dao
import { PaymentsDAO, BookingsDAO } from "../dao/index.dao.js";

// types
import type { Payment } from "../models/index.model.js";

// db connection
import { db } from "../db/drizzle/index.js";

// utils
import { ServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";
import * as RazorpayHelper from "../utils/razorpay.util.js";
import { releaseSeatLocks } from "../utils/seatLock.util.js";

// grpc client
import { EventGrpcClient } from "../grpc/clients/event.grpc.client.js";

export class PaymentsService {
	static async initiatePayment(payload: any, userId: string) {
		try {
			const date = Date.now();
			const { bookingId, provider } = payload;
			const booking = await BookingsDAO.getBookingById(bookingId);
			if (!booking) {
				throw new ServiceError("Booking not found", 404);
			}
			const amount = booking.totalAmount;
			// Create payment idempotency key
			const paymentKey = `PAY-${userId}-${date}`;
			// initiate payment via provider
			let txnDetails = null;
			if (provider === "razorpay") {
				txnDetails = await RazorpayHelper.initiateRazorpayPayment(amount, paymentKey);
			}
			if (txnDetails?.status === "pending") {
				const payment = await PaymentsDAO.createPayment({
					bookingId,
					idempotencyKey: paymentKey,
					provider,
					amount,
					status: "pending",
					createdAt: date,
					updatedAt: date,
					responseData: txnDetails,
				});
				return payment;
			} else {
				throw new ServiceError("Failed to initiate payment", 500);
			}
		} catch (error) {
			logger.error("Error in initiatePayment:", error);
			throw error;
		}
	}

	static async checkPaymentStatus(paymentId: string) {
		try {
			const payment = await PaymentsDAO.getPaymentById(paymentId);
			if (!payment) {
				throw new ServiceError("Payment not found", 404);
			}
			if (payment.status !== "pending") {
				logger.info("Payment already finalized with status:", payment.status);
				return payment;
			}
			let status: Payment["status"] = payment.status;
			let responseData = null;
			if (payment.provider === "razorpay") {
				const razorpayStatus = await RazorpayHelper.fetchRazorpayPaymentStatus(
					payment.idempotencyKey
				);
				status = razorpayStatus.status;
				responseData = razorpayStatus.responseData;
			}
			if (status !== payment.status) {
				await db.transaction(async (txn) => {
					try {
						let data: Partial<Payment> = {};
						data.status = status;
						if (responseData) data.responseData = responseData;
						await PaymentsDAO.updatePayment(payment.id, data, txn);
						const updatedBooking = await BookingsDAO.updateBookingStatus(
							payment.bookingId,
							status,
							txn
						);
						if (!updatedBooking) {
							throw new ServiceError("Associated booking not found", 404);
						}
						if (status === "success") {
							await EventGrpcClient.updateSeatsStatus(
								updatedBooking.eventId,
								updatedBooking.seatIds,
								"booked"
							);
						}
						await releaseSeatLocks(
							updatedBooking.eventId,
							updatedBooking.seatIds,
							updatedBooking.userId
						);
					} catch (error) {
						txn.rollback();
						logger.error("Error in transaction:", error);
						throw new ServiceError("Transaction failed", 500);
					}
				});
			}
			return { ...payment, status };
		} catch (error) {
			logger.error("Error in checkPaymentStatus:", error);
			throw error;
		}
	}

	static async updatePaymentStatus(paymentId: string, status: string) {
		try {
			const payment = await PaymentsDAO.updatePayment(paymentId, { status: status as any });
			if (!payment) {
				throw new ServiceError("Payment not found", 404);
			}
			return payment;
		} catch (error) {
			logger.error("Error in updatePaymentStatus:", error);
			throw error;
		}
	}
}
