import { pgTable, pgEnum, bigint, text, integer, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const bookingStatus = pgEnum("booking_status", ["pending", "success", "failed"]);

export const bookingsTable = pgTable("bookings", {
	id: bigintAsText("id").primaryKey(),
	userId: bigintAsText("user_id").notNull(),
	eventId: text("event_id").notNull(), // from Cassandra
	seatIds: jsonb("seat_ids").notNull(), // array of seat IDs (from Cassandra)
	status: bookingStatus("status").default("pending"),
	idempotencyKey: text("idempotency_key").notNull().unique(),
	totalAmount: integer("total_amount").notNull(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
