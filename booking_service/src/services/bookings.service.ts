import { BookingsDAO, SeatsDAO, ShowsDAO, OutboxDAO } from "../dao/index.dao.js";
import { EventsService } from "./index.service.js";
import { verifySeatLocks, acquireSeatLocks, releaseSeatLocks } from "../utils/seatLock.util.js";
import { EventGrpcClient } from "../grpc/clients/event.grpc.client.js";
import { db } from "../db/drizzle/index.js";
import { ServiceError } from "../utils/error.util.js";

export class BookingsService {
	private static async calculateTotalAmount(seatIds: string[]) {
		try {
			const seats = await SeatsDAO.getSeatsByIds(seatIds);
			if (!seats || seats.length !== seatIds.length) throw new ServiceError("SEAT_NOT_FOUND");
			const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
			return totalAmount;
		} catch (error) {
			throw error;
		}
	}

	static async createBooking(payload: any) {
		try {
			const { bookingKey, showId, seatIds, userId } = payload;
			const totalAmount = await this.calculateTotalAmount(seatIds);

			// 1️⃣ Fetch booking by idempotency key
			const booking = await BookingsDAO.getBookingByIdempotencyKey(bookingKey);

			// 2️⃣ If valid booking exists → check if its locks are still valid
			if (booking && booking.status === "pending") {
				const lockValid = await verifySeatLocks(showId, seatIds, userId);
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
			const lockAcquired = await acquireSeatLocks(showId, seatIds, userId);
			if (!lockAcquired) {
				throw new Error("Seats are already locked or unavailable.");
			}

			const newBooking = await BookingsDAO.createBooking({
				showId,
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

	static async confirmBookingAndSeats(payload: any) {
		try {
			const { bookingId, paymentId, userId, amount } = payload;
			const booking = await BookingsDAO.getBookingById(bookingId);
			if (!booking) return; // swallow → consumer retries or DLQ later

			const { showId, seatIds, status } = booking;
			// Idempotency Guard #1: Already confirmed → do nothing
			if (status === "confirmed") return booking;

			// Safety: booking expired or cancelled → ignore
			if (status !== "pending") return;

			// Validate seat locks are still held (optional)
			const lockValid = await verifySeatLocks(showId, seatIds, userId);
			if (!lockValid) {
				// IF lock expired but payment succeeded → this is rare but possible
				// business rule: either auto-fail or auto-assign alternative seats
				await db.transaction(async (txn) => {
					await BookingsDAO.updateBookingStatus(bookingId, "failed", txn);

					// produce event for refund (outbox)
					await OutboxDAO.addEvent(
						{
							eventType: "payment_refund_requested",
							aggregateId: paymentId,
							payload: { bookingId, userId, amount },
						},
						txn
					);
				});

				return;
			}

			await db.transaction(async (txn) => {
				// 1. Final SQL conflict check
				const sqlSeats = await SeatsDAO.getAvailableSeatsByIds(seatIds, showId, txn);
				if (sqlSeats.length !== seatIds.length) {
					throw new ServiceError("SEAT_NOT_AVAILABLE");
				}

				// 2. Final SQL booking (atomic)
				const bookedSeats = await SeatsDAO.bookSeatsBatch(seatIds, txn);
				if (bookedSeats.length !== seatIds.length) {
					throw new ServiceError("SEAT_CONFIRMATION_FAILED");
				}

				// 🧾 Update booking to confirmed
				await BookingsDAO.updateBookingStatus(bookingId, "confirmed", txn);

				// (Optional) Sync to Cassandra / Search / Analytics
				await OutboxDAO.addEvent(
					{
						eventType: "booking_confirmed",
						aggregateId: bookingId,
						payload: {
							bookingId,
							userId,
							seatIds: seatIds,
							showId: showId,
							paymentId,
							amount,
						},
					},
					txn
				);
			});

			// Cleanup redis locks
			await releaseSeatLocks(showId, seatIds);

			return { ...booking, status: "success" };
		} catch (error) {
			throw error;
		}
	}

	static async handlePaymentFailure(payload: any) {
		try {
			const { bookingId, paymentId, userId } = payload;

			// Fetch booking
			const booking = await BookingsDAO.getBookingById(bookingId);
			if (!booking) return; // allow retry, or DLQ later

			const { status, showId, seatIds } = booking;

			// Idempotency Guard #2 — confirmed bookings must NOT revert
			if (status === "confirmed") {
				// At this point, booking succeeded but provider later sent failed event.
				// Usually treat as anomaly, store audit log, maybe refund logic.
				await OutboxDAO.addEvent({
					eventType: "payment_failure_after_confirmation",
					aggregateId: paymentId,
					payload: { bookingId, userId },
				});
				return booking;
			}

			// ---- Booking state must be pending to transition to failed ----
			if (status !== "pending") return booking;

			// ---- Execute failure in DB transaction ----
			await db.transaction(async (txn) => {
				// Update booking status to failed
				await BookingsDAO.updateBookingStatus(bookingId, "failed", txn);

				// Write outbox event for downstream consumers
				await OutboxDAO.addEvent(
					{
						eventType: "booking_failed",
						aggregateId: bookingId,
						payload: {
							bookingId,
							userId,
							showId,
							seatIds,
							paymentId,
						},
					},
					txn
				);
			});

			// ---- Non-transactional cleanup (safe to retry or ignore if repeated) ----

			// Seat lock cleanup (only if seat was locked by the user)
			await releaseSeatLocks(showId, seatIds);

			return { ...booking, status: "failed" };
		} catch (err) {
			throw err;
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
			throw error;
		}
	}

	static async getBookingsByUserId(userId: string) {
		try {
			const bookings = await BookingsDAO.getBookingsByUserId(userId);
			return bookings;
		} catch (error) {
			throw error;
		}
	}

	static async getSeatLayoutByShowId(showId: string) {
		try {
			const seatLayout = await EventGrpcClient.getSeatLayout(showId);
			return seatLayout;
		} catch (error) {
			throw error;
		}
	}
}
