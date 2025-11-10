import {
	seatAvailabilityMapper,
	seatSnapshotMapper,
	mapper,
	cassandraClient,
} from "../db/cassandraClient.js";
import type { SeatAvailability, SeatSnapshot } from "../models/index.model.js";
import { base64ToJson, jsonToBase64 } from "../utils/base64Convertor.util.js";

export class SeatsDAO {
	// ================== SEAT AVAILABILITY ==================
	static async getSeatAvailability(showId: string): Promise<SeatAvailability[]> {
		try {
			const result = await seatAvailabilityMapper.find({ show_id: showId });
			return result.toArray();
		} catch (error) {
			throw error;
		}
	}

	static async createSeat(data: SeatAvailability): Promise<SeatAvailability | null> {
		try {
			const result = await seatAvailabilityMapper.insert(data);
			return result.wasApplied() ? data : null;
		} catch (error) {
			throw error;
		}
	}

	static async bulkCreateSeat(data: SeatAvailability[]): Promise<boolean> {
		try {
			const changes = data.map((itm) => seatAvailabilityMapper.batching.insert(itm));
			const result = await mapper.batch(changes);
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	static async updateSeatStatus(
		showId: string,
		seatId: string,
		status: string
	): Promise<boolean> {
		try {
			const result = await seatAvailabilityMapper.update({
				show_id: showId,
				seat_id: seatId,
				status,
				last_updated: new Date(),
			});
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	static async updateSeatStatusWithTTL(
		showId: string,
		seatIds: string[],
		status: string,
		ttlSeconds?: number
	): Promise<boolean> {
		try {
			if (!seatIds.length) return true;

			const placeholders = seatIds.map(() => "?").join(", ");
			const query = `
				UPDATE seat_availability_by_show
				USING TTL ${ttlSeconds}
				SET status = ?, last_updated = ?
				WHERE show_id = ? AND seat_id IN (${placeholders})
			`;
			const params = [status, new Date(), showId, ...seatIds];
			const result = await cassandraClient.execute(query, params, { prepare: true });
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	// upsert
	static async bulkUpdateSeatStatus(
		showId: string,
		seatUpdates: { seatId: string; status: string }[]
	): Promise<boolean> {
		try {
			const changes = seatUpdates.map((itm) =>
				seatAvailabilityMapper.batching.update({
					show_id: showId,
					seat_id: itm.seatId,
					status: itm.status,
					last_updated: new Date(),
				})
			);
			const result = await mapper.batch(changes);
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	// ================== SNAPSHOT ==================
	static async getSeatSnapshot(showId: string): Promise<SeatSnapshot | null> {
		try {
			const result = await seatSnapshotMapper.get({ show_id: showId });
			if (result?.seat_snapshot) {
				const json = base64ToJson(result.seat_snapshot);
				result.seat_snapshot = json;
			}
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async refreshSeatSnapshot(
		showId: string,
		snapshotJson: any
	): Promise<SeatSnapshot | null> {
		try {
			const compressed = jsonToBase64(snapshotJson);
			const result = await seatSnapshotMapper.insert({
				show_id: showId,
				seat_snapshot: compressed,
				updated_at: new Date(),
			});
			return result.wasApplied()
				? {
						show_id: showId,
						seat_snapshot: snapshotJson,
						updated_at: new Date(),
				  }
				: null;
		} catch (error) {
			throw error;
		}
	}
}
