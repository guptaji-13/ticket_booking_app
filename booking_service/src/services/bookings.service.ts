import { BookingsDAO } from "../dao/index.dao.js";
import { logger } from "../utils/logger.util.js";
import { EventsService } from "./index.service.js";
import { verifySeatLocks, acquireSeatLocks, releaseSeatLocks } from "../utils/seatLock.util.js";
import { EventGrpcClient } from "../grpc/clients/event.grpc.client.js";

export class BookingsService {
	static async createBooking(payload: any) {
		try {
			const { bookingKey, eventId, seatIds, userId } = payload;
			const totalAmount = await EventsService.calculateTotalAmount(eventId, seatIds);

			// 1️⃣ Fetch booking by idempotency key
			const booking = await BookingsDAO.getBookingByIdempotencyKey(bookingKey);

			// 2️⃣ If valid booking exists → check if its locks are still valid
			if (booking && booking.status === "pending") {
				const lockValid = await verifySeatLocks(eventId, seatIds, userId);
				if (lockValid) {
					// ✅ Locks still held — valid retry, return same booking
					return booking;
				} else {
					// 🚨 Locks expired — mark booking as "failed"
					await BookingsDAO.updateBookingStatus(booking.id, "failed");

					// Allow user to retry (fresh locks)
					throw new Error("Your previous booking session expired. Please try again.");
				}
			}

			// 3️⃣ Booking doesn’t exist — proceed with fresh lock + creation
			const lockAcquired = await acquireSeatLocks(eventId, seatIds, userId);
			if (!lockAcquired) {
				throw new Error("Seats are already locked or unavailable.");
			}

			const newBooking = await BookingsDAO.createBooking({
				eventId,
				userId,
				seatIds,
				idempotencyKey: bookingKey,
				totalAmount,
				status: "pending",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
			if (!newBooking) {
				throw new Error("Failed to create booking.");
			}
			return newBooking;
		} catch (error) {
			throw error;
		}
	}

	static async getBookingById(bookingId: string) {
		try {
			const booking = await BookingsDAO.getBookingById(bookingId);
			if (!booking) {
				throw new Error("Booking not found");
			}
			return booking;
		} catch (error) {
			logger.error("Error in getBookingById:", error);
			throw error;
		}
	}

	static async getBookingsByUserId(userId: string) {
		try {
			const bookings = await BookingsDAO.getBookingsByUserId(userId);
			return bookings;
		} catch (error) {
			logger.error("Error in getBookingsByUserId:", error);
			throw error;
		}
	}

	static async getSeatLayoutByEventId(eventId: string) {
		try {
			const seatLayout = await EventGrpcClient.getSeatLayout(eventId);
			return seatLayout;
		} catch (error) {
			logger.error("Error in getBookingsByUserId:", error);
			throw error;
		}
	}
}
