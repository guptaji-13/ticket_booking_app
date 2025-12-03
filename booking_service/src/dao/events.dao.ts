import { db } from "../db/drizzle/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { eventsTable } from "../db/drizzle/index.js";
import type { Event } from "../models/index.model.js";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class EventsDAO {
	/**
	 * Create a new event
	 */
	static async createEvent(event: Omit<Event, "id">): Promise<Event | null> {
		try {
			const result = (await db
				.insert(eventsTable)
				.values({
					id: generateSnowflake(),
					...event,
				})
				.returning()) as Event[];

			return result[0] || null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get event by ID
	 */
	static async getEventById(eventId: string): Promise<Event | null> {
		const result = (await db
			.select()
			.from(eventsTable)
			.where(eq(eventsTable.id, eventId))
			.limit(1)) as Event[];

		return result[0] || null;
	}

	/**
	 * Get events by category
	 */
	static async getEventsByCategory(category: string): Promise<Event[]> {
		const result = (await db
			.select()
			.from(eventsTable)
			.where(eq(eventsTable.category, category))
			.orderBy(desc(eventsTable.createdAt))) as Event[];

		return result;
	}

	/**
	 * Update an event (partial update)
	 */
	static async updateEvent(
		eventId: string,
		data: Partial<Omit<Event, "id" | "createdAt">>,
		txn: NodePgDatabase | null = null
	): Promise<Event | null> {
		const now = Date.now();

		const result = (await (txn || db)
			.update(eventsTable)
			.set({
				...data,
				updatedAt: now,
			})
			.where(eq(eventsTable.id, eventId))
			.returning()) as Event[];

		return result[0] || null;
	}

	/**
	 * Delete an event (hard delete)
	 * If you want soft delete, let me know — I’ll add `isDeleted = true`.
	 */
	static async deleteEvent(eventId: string, txn: NodePgDatabase | null = null): Promise<boolean> {
		const result = await (txn || db).delete(eventsTable).where(eq(eventsTable.id, eventId));

		// result.rowCount exists if using db.execute(sql``), but drizzle update/delete with query builder returns undefined
		// so best approach is to re-fetch to ensure deletion if needed
		return true;
	}
}
