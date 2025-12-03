import { db } from "../db/drizzle/index.js";
import { eq, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { generateSnowflake } from "../utils/snowflake.util.js";

import { screensTable } from "../db/drizzle/index.js";
import type { Screen } from "../models/index.model.js";

export class ScreensDAO {
	/**
	 * Create a new screen under a venue
	 */
	static async createScreen(screen: Omit<Screen, "id">): Promise<Screen | null> {
		try {
			const result = (await db
				.insert(screensTable)
				.values({
					id: generateSnowflake(),
					...screen,
				})
				.returning()) as Screen[];

			return result[0] || null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get screen by ID
	 */
	static async getScreenById(screenId: string): Promise<Screen | null> {
		const result = (await db
			.select()
			.from(screensTable)
			.where(eq(screensTable.id, screenId))
			.limit(1)) as Screen[];

		return result[0] || null;
	}

	/**
	 * Get all screens under a venue
	 */
	static async getScreensByVenueId(venueId: string): Promise<Screen[]> {
		const result = (await db
			.select()
			.from(screensTable)
			.where(eq(screensTable.venueId, venueId))
			.orderBy(desc(screensTable.createdAt))) as Screen[];

		return result;
	}

	/**
	 * Update screen metadata / seatLayout / other fields
	 */
	static async updateScreen(
		screenId: string,
		data: Partial<Omit<Screen, "id" | "createdAt">>,
		txn: NodePgDatabase | null = null
	): Promise<Screen | null> {
		const now = Date.now();

		const result = (await (txn || db)
			.update(screensTable)
			.set({
				...data,
				updatedAt: now,
			})
			.where(eq(screensTable.id, screenId))
			.returning()) as Screen[];

		return result[0] || null;
	}

	/**
	 * Delete a screen (hard delete)
	 */
	static async deleteScreen(
		screenId: string,
		txn: NodePgDatabase | null = null
	): Promise<boolean> {
		await (txn || db).delete(screensTable).where(eq(screensTable.id, screenId));
		return true;
	}
}
