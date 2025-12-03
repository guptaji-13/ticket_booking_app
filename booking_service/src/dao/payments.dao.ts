import { db } from "../db/drizzle/index.js";
import { eq, desc, sql } from "drizzle-orm";
import { paymentsTable } from "../db/drizzle/index.js";
import type { Payment } from "../models/index.model.js";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class PaymentsDAO {
	static async createPayment(payment: Omit<Payment, "id">): Promise<Payment | null> {
		const result = (await db
			.insert(paymentsTable)
			.values({
				id: generateSnowflake(),
				...payment,
			})
			.returning()) as Payment[];
		return result[0] || null;
	}

	static async getPaymentById(paymentId: string): Promise<Payment | null> {
		const result = (await db
			.select()
			.from(paymentsTable)
			.where(eq(paymentsTable.id, paymentId))
			.limit(1)) as Payment[];
		return result[0] || null;
	}

	static async getPaymentByIdempotencyKey(idempotencyKey: string): Promise<Payment | null> {
		const result = (await db
			.select()
			.from(paymentsTable)
			.where(eq(paymentsTable.idempotencyKey, idempotencyKey))
			.limit(1)) as Payment[];
		return result[0] || null;
	}

	static async getPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
		const result = (await db
			.select()
			.from(paymentsTable)
			.where(eq(paymentsTable.bookingId, bookingId))
			.orderBy(desc(paymentsTable.createdAt))) as Payment[];
		return result;
	}

	static async updatePayment(
		paymentId: string,
		data: Partial<Payment>,
		txn: NodePgDatabase | null = null
	): Promise<Payment | null> {
		const result = (await (txn || db)
			.update(paymentsTable)
			.set({ ...data, updatedAt: Date.now() })
			.where(eq(paymentsTable.id, paymentId))
			.returning()) as Payment[];
		return result[0] || null;
	}
}
