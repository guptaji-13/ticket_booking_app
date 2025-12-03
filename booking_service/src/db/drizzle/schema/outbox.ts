import { pgTable, index, integer, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const outboxTable = pgTable(
	"outbox",
	{
		id: bigintAsText("id").primaryKey(),
		eventType: varchar("event_type", { length: 100 }).notNull(), // e.g. "SEAT_CONFIRMED", "BOOKING_CREATED", "PAYMENT_COMPLETED"
		aggregateId: varchar("aggregate_id", { length: 255 }).notNull(), // e.g. bookingId, paymentId
		payload: jsonb("payload").notNull(), // JSON payload with full event data
		retryCount: integer("retry_count").default(0), // Number of Kafka publish attempts
		processed: boolean("processed").default(false),
		createdAt: timestamp("created_at").defaultNow(),
		processedAt: timestamp("processed_at"),
	},
	(table) => [
		index("idx_outbox_processed").on(table.processed),
		index("idx_outbox_aggregate_id").on(table.aggregateId),
		index("idx_outbox_event_type").on(table.eventType),
	]
);
