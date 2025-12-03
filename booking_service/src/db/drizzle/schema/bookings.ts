import { pgTable, pgEnum, bigint, text, integer, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const bookingStatus = pgEnum("booking_status", [
	"pending",
	"confirmed",
	"failed",
	"expired",
	"cancelled",
	"refunded",
]);

export const bookingsTable = pgTable("bookings", {
	id: bigintAsText("id").primaryKey(),
	userId: bigintAsText("user_id").notNull(),
	showId: bigintAsText("show_id").notNull(),
	seatIds: jsonb("seat_ids").notNull(),
	status: bookingStatus("status").default("pending"),
	idempotencyKey: text("idempotency_key").notNull().unique(),
	totalAmount: integer("total_amount").notNull(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
