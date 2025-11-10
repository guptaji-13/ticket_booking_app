import { pgTable, pgEnum, bigint, text, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";
import { bookingsTable } from "./bookings.js";

export const paymentStatus = pgEnum("payment_status", ["pending", "success", "failed"]);

export const paymentsTable = pgTable("payments", {
	id: bigintAsText("id").primaryKey(),
	bookingId: bigintAsText("booking_id")
		.notNull()
		.references(() => bookingsTable.id),
	idempotencyKey: text("idempotency_key").notNull().unique(),
	provider: text("provider").notNull(),
	amount: doublePrecision("amount").notNull(),
	status: paymentStatus("status").default("pending"),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	responseData: jsonb("response_data"),
});
