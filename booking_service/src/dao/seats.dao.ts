import { db } from "../db/drizzle/index.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { seatsTable } from "../db/drizzle/index.js";
import type { Seat } from "../models/index.model.js";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class SeatsDAO {
	// Get all seats for a show
	static async getSeatsByShow(showId: string): Promise<Seat[]> {
		const result = (await db
			.select()
			.from(seatsTable)
			.where(eq(seatsTable.showId, showId))) as Seat[];

		return result;
	}

	// Get a single seat by ID
	static async getSeatById(seatId: string): Promise<Seat | null> {
		const result = (await db
			.select()
			.from(seatsTable)
			.where(eq(seatsTable.id, seatId))
			.limit(1)) as Seat[];

		return result[0] || null;
	}

	// Get seats by IDs
	static async getSeatsByIds(seatIds: string[]): Promise<Seat[]> {
		const result = (await db
			.select()
			.from(seatsTable)
			.where(inArray(seatsTable.id, seatIds))) as Seat[];
		return result;
	}

	static async createSeatInBulk(
		data: Omit<Seat, "id">[],
		txn: NodePgDatabase | null = null
	): Promise<Seat[]> {
		const seats: Seat[] = [];
		for (const seat of data) {
			seats.push({ id: generateSnowflake(), ...seat });
		}
		const result = (await (txn || db).insert(seatsTable).values(seats).returning()) as Seat[];
		return result;
	}

	// Get available seats by seat IDs
	static async getAvailableSeatsByIds(
		seatIds: string[],
		showId: string,
		txn: NodePgDatabase | null = null
	): Promise<Seat[]> {
		const result = (await (txn || db)
			.select()
			.from(seatsTable)
			.where(
				and(
					inArray(seatsTable.id, seatIds),
					eq(seatsTable.showId, showId), // to check malicious attempts
					eq(seatsTable.status, "available")
				)
			)) as Seat[];
		return result;
	}

	// Book multiple seats atomically
	static async bookSeatsBatch(
		seatIds: string[],
		txn: NodePgDatabase | null = null
	): Promise<Seat[]> {
		const now = Date.now();

		const result = (await (txn || db)
			.update(seatsTable)
			.set({ status: "booked", updatedAt: now })
			.where(and(inArray(seatsTable.id, seatIds), eq(seatsTable.status, "available")))
			.returning()) as Seat[];

		return result;
	}
}
