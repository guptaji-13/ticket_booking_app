import { db } from "../db/drizzle/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { showsTable } from "../db/drizzle/index.js";
import type { Show } from "../models/index.model.js";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class ShowsDAO {
	/**
	 * Create a new show
	 */
	static async createShow(show: Omit<Show, "id">): Promise<Show | null> {
		try {
			const result = (await db
				.insert(showsTable)
				.values({
					id: generateSnowflake(),
					...show,
				})
				.returning()) as Show[];

			return result[0] || null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get show by ID
	 */
	static async getShowById(showId: string): Promise<Show | null> {
		const result = (await db
			.select()
			.from(showsTable)
			.where(eq(showsTable.id, showId))
			.limit(1)) as Show[];

		return result[0] || null;
	}

	/**
	 * Get shows by event ID
	 */
	static async getShowsByEvent(eventId: string): Promise<Show[]> {
		const result = (await db
			.select()
			.from(showsTable)
			.where(eq(showsTable.eventId, eventId))
			.orderBy(desc(showsTable.startTimestamp))) as Show[];

		return result;
	}

	/**
	 * Get shows by venue ID
	 */
	static async getShowsByVenue(venueId: string): Promise<Show[]> {
		const result = (await db
			.select()
			.from(showsTable)
			.where(eq(showsTable.venueId, venueId))
			.orderBy(desc(showsTable.startTimestamp))) as Show[];

		return result;
	}

	/**
	 * Update a show (partial update)
	 */
	static async updateShow(
		showId: string,
		data: Partial<Omit<Show, "id" | "createdAt">>,
		txn: NodePgDatabase | null = null
	): Promise<Show | null> {
		const now = Date.now();

		const result = (await (txn || db)
			.update(showsTable)
			.set({
				...data,
				updatedAt: now,
			})
			.where(eq(showsTable.id, showId))
			.returning()) as Show[];

		return result[0] || null;
	}

	/**
	 * Delete a show (hard delete)
	 */
	static async deleteShow(showId: string, txn: NodePgDatabase | null = null): Promise<boolean> {
		await (txn || db).delete(showsTable).where(eq(showsTable.id, showId));
		return true;
	}
}
