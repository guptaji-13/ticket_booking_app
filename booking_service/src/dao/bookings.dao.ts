import { db } from "../db/drizzle/index.js";
import { eq, desc, sql } from "drizzle-orm";
import { bookingsTable } from "../db/drizzle/index.js";
import type { Booking } from "../models/index.model.js";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export class BookingsDAO {
	static async createBooking(booking: Omit<Booking, "id">): Promise<Booking | null> {
		try {
			const result = (await db
				.insert(bookingsTable)
				.values({
					id: sql`generate_snowflake_id(${1}, ${1})`,
					...booking,
				})
				.returning()) as Booking[];
			return result[0] || null;
		} catch (error) {
			throw error;
		}
	}

	static async getBookingById(bookingId: string): Promise<Booking | null> {
		const result = (await db
			.select()
			.from(bookingsTable)
			.where(eq(bookingsTable.id, bookingId))
			.limit(1)) as Booking[];
		return result[0] || null;
	}

	static async getBookingByIdempotencyKey(idempotencyKey: string): Promise<Booking | null> {
		const result = (await db
			.select()
			.from(bookingsTable)
			.where(eq(bookingsTable.idempotencyKey, idempotencyKey))
			.limit(1)) as Booking[];
		return result[0] || null;
	}

	static async getBookingsByUserId(userId: string): Promise<Booking[]> {
		const result = (await db
			.select()
			.from(bookingsTable)
			.where(eq(bookingsTable.userId, userId))
			.orderBy(desc(bookingsTable.createdAt))) as Booking[];
		return result;
	}

	static async updateBookingStatus(
		bookingId: string,
		status: Booking["status"],
		txn: NodePgDatabase | null = null
	): Promise<Booking | null> {
		const result = (await (txn || db)
			.update(bookingsTable)
			.set({ status, updatedAt: Date.now() })
			.where(eq(bookingsTable.id, bookingId))
			.returning()) as Booking[];
		return result[0] || null;
	}
}
