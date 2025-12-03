import { db } from "../db/drizzle/index.js"; // your drizzle client instance
import { outboxTable } from "../db/drizzle/index.js";
import { sql, eq, and } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class OutboxDAO {
	static async addEvent(
		data: {
			eventType: string;
			aggregateId: string;
			payload: any;
		},
		txn?: NodePgDatabase
	) {
		const executor = txn ?? db;

		return executor.insert(outboxTable).values({
			id: generateSnowflake(),
			...data,
		});
	}

	static async getPendingEvents(limit = 20) {
		return db.select().from(outboxTable).where(eq(outboxTable.processed, false)).limit(limit);
	}

	static async markProcessed(id: string) {
		return db
			.update(outboxTable)
			.set({
				processed: true,
				processedAt: new Date(),
			})
			.where(eq(outboxTable.id, id));
	}

	static async incrementRetry(id: string) {
		return db
			.update(outboxTable)
			.set({
				retryCount: sql`${outboxTable.retryCount}::int + 1`,
			})
			.where(eq(outboxTable.id, id));
	}

	static async getEventById(id: string) {
		const rows = await db.select().from(outboxTable).where(eq(outboxTable.id, id));

		return rows[0] ?? null;
	}

	static async deleteEvent(id: string) {
		return db.delete(outboxTable).where(eq(outboxTable.id, id));
	}
}
