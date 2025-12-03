// dao
import { SeatsDAO, ShowsDAO } from "../dao/index.dao.js";

// types
import type { Seat } from "../models/index.model.js";

// db connection
import { db } from "../db/drizzle/index.js";

// utils
import { ServiceError } from "../utils/error.util.js";
import { acquireSeatLocks, releaseSeatLocks, verifySeatLocks } from "../utils/seatLock.util.js";

// grpc client (for propagating booked seats to event service)
import { EventGrpcClient } from "../grpc/clients/event.grpc.client.js";

export class SeatsService {
	static async lockSeats(showId: string, seatIds: string[], userId: string) {
		try {
			// 0. Check if show exists (optional but good)
			const show = await ShowsDAO.getShowById(showId);
			if (!show) throw new ServiceError("SHOW_NOT_FOUND");

			// 1. Pull SQL final truth to avoid ghost locks, Prevent locking if SQL shows seat already booked and check for malicious seats
			const allSeats = await SeatsDAO.getAvailableSeatsByIds(seatIds, showId);
			if (allSeats.length !== seatIds.length) {
				console.log(
					"Seats not available\n",
					seatIds.filter((s) => !allSeats.find((ss) => ss.id === s))
				);
				throw new ServiceError("SEAT_NOT_AVAILABLE");
			}

			// 2. Lock in Redis atomically
			const ok = await acquireSeatLocks(showId, seatIds, userId);
			return { success: ok };
		} catch (error) {
			throw error;
		}
	}

	static async confirmSeats(showId: string, seatIds: string[], userId: string) {
		try {
			return await db.transaction(async (txn) => {
				// 1. Ensure user still owns Redis locks
				const ok = await verifySeatLocks(showId, seatIds, userId);
				if (!ok) throw new ServiceError("SEAT_LOCK_EXPIRED");

				// 2. Final SQL conflict check
				const sqlSeats = await SeatsDAO.getAvailableSeatsByIds(seatIds, showId);

				if (sqlSeats.length !== seatIds.length) {
					throw new ServiceError("SEAT_NOT_AVAILABLE");
				}

				// 3. Final SQL booking (atomic)
				const bookedSeats = await SeatsDAO.bookSeatsBatch(seatIds, txn);
				if (bookedSeats.length !== seatIds.length) {
					throw new ServiceError("SEAT_CONFIRMATION_FAILED");
				}

				// 4. Update Event Service (ES sync, Cassandra, etc)
				await EventGrpcClient.updateSeatsStatus(showId, seatIds, "booked");

				// 5. Cleanup redis locks
				await releaseSeatLocks(showId, seatIds);
				return { booked: seatIds };
			});
		} catch (error) {
			throw error;
		}
	}

	static async unlockSeats(showId: string, seatIds: string[]) {
		try {
			await releaseSeatLocks(showId, seatIds);
			return { unlocked: seatIds };
		} catch (error) {
			throw error;
		}
	}

	static async checkAvailability(showId: string) {
		try {
			const seats = await SeatsDAO.getSeatsByShow(showId);
			return seats;
		} catch (error) {
			throw error;
		}
	}
}
