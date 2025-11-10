import { ShowsDAO, SeatsDAO } from "../dao/index.dao.js";
import { v7 as uuidv7 } from "uuid";

export class ShowsService {
	static async createShow(data: any) {
		try {
			const { eventId, venueId, screenDetails, showTimestamp } = data;
			const newShow = await ShowsDAO.createShow({
				show_id: uuidv7(),
				event_id: eventId,
				venue_id: venueId,
				screen_details: screenDetails,
				show_timestamp: showTimestamp,
				status: "scheduled",
				last_updated: new Date(),
			});
			return newShow;
		} catch (error) {
			throw error;
		}
	}

	static async getShowById(showId: string) {
		try {
			const show = await ShowsDAO.getShowById(showId);
			if (!show) throw Error("Show not found");
			return show;
		} catch (error) {
			throw error;
		}
	}

	static async createSeat(data: any) {
		try {
			const { showId } = data;
			const newSeat = await SeatsDAO.createSeat({
				show_id: showId,
				seat_id: uuidv7(),
				status: "available",
				last_updated: new Date(),
			});
			return newSeat;
		} catch (error) {
			throw error;
		}
	}

	static async getSeatsStatusForShow(showId: string, seatIds: string[]) {
		try {
			const status: Record<string, string> = {};
			const seats = await SeatsDAO.getSeatAvailability(showId);
			for (const seat of seats) {
				status[seat.seat_id] = seat.status;
			}
			const response: Record<string, string>[] = [];
			for (const seat of seatIds) {
				response.push({
					seat_id: seat,
					status: status[seat] || "available",
				});
			}
			return response;
		} catch (error) {
			throw error;
		}
	}

	static async reserveSeats(showId: string, seatIds: string[], ttlSeconds: number) {
		try {
			const success = await SeatsDAO.updateSeatStatusWithTTL(
				showId,
				seatIds,
				"reserved",
				ttlSeconds
			);
			return success;
		} catch (error) {
			throw error;
		}
	}

	static async getSeatsLayoutByShowId(showId: string) {
		try {
			const seatSnapshot = await SeatsDAO.getSeatSnapshot(showId);
			const seats = await SeatsDAO.getSeatAvailability(showId);
			if (!seatSnapshot || !seats.length) throw Error("Seats not found");
			const status: Record<string, string> = {};
			for (const seat of seats) {
				status[seat.seat_id] = seat.status;
			}
			for (const row of seatSnapshot.seat_snapshot.rows) {
				if (!row) continue;
				for (const seat of row.layout) {
					if (!seat) continue;
					seat.status = status[seat.id];
				}
			}
			return seatSnapshot;
		} catch (error) {
			throw error;
		}
	}

	static async updateSeatsStatusForShow(
		showId: string,
		updates: { seatId: string; status: string }[]
	) {
		try {
			const success = await SeatsDAO.bulkUpdateSeatStatus(showId, updates);
			return success;
		} catch (error) {
			throw error;
		}
	}

	// makes all seats available (can only be used before booking starts for a show)
	static async updateSeatsForShow(showId: string, snapshotJson: any) {
		try {
			const seats = await SeatsDAO.refreshSeatSnapshot(showId, snapshotJson);
			const newSeats: any[] = [];
			for (const row of snapshotJson.rows) {
				if (!row) continue;
				for (const seat of row.layout) {
					if (!seat) continue;
					newSeats.push({
						seat_id: seat.id,
						show_id: showId,
						status: "available",
						last_updated: new Date(),
					});
				}
			}
			const success = await SeatsDAO.bulkCreateSeat(newSeats);
			console.log(success);
			return seats;
		} catch (error) {
			throw error;
		}
	}
}
