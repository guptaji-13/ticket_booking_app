import { db } from "../db/drizzle/index.js";
import { eq, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { venuesTable } from "../db/drizzle/index.js";
import type { Venue } from "../models/index.model.js";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class VenuesDAO {
	/**
	 * Create a new venue
	 */
	static async createVenue(venue: Omit<Venue, "id">): Promise<Venue | null> {
		try {
			const result = (await db
				.insert(venuesTable)
				.values({
					id: generateSnowflake(),
					...venue,
				})
				.returning()) as Venue[];

			return result[0] || null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get venue by ID
	 */
	static async getVenueById(venueId: string): Promise<Venue | null> {
		const result = (await db
			.select()
			.from(venuesTable)
			.where(eq(venuesTable.id, venueId))
			.limit(1)) as Venue[];

		return result[0] || null;
	}

	/**
	 * Get venues by city
	 */
	static async getVenuesByCity(city: string): Promise<Venue[]> {
		const result = (await db
			.select()
			.from(venuesTable)
			.where(eq(venuesTable.city, city))
			.orderBy(desc(venuesTable.createdAt))) as Venue[];

		return result;
	}

	/**
	 * Update a venue
	 */
	static async updateVenue(
		venueId: string,
		data: Partial<Omit<Venue, "id" | "createdAt">>,
		txn: NodePgDatabase | null = null
	): Promise<Venue | null> {
		const now = Date.now();

		const result = (await (txn || db)
			.update(venuesTable)
			.set({
				...data,
				updatedAt: now,
			})
			.where(eq(venuesTable.id, venueId))
			.returning()) as Venue[];

		return result[0] || null;
	}

	/**
	 * Delete a venue (hard delete)
	 */
	static async deleteVenue(venueId: string, txn: NodePgDatabase | null = null): Promise<boolean> {
		await (txn || db).delete(venuesTable).where(eq(venuesTable.id, venueId));
		return true;
	}
}
