import { pgTable, pgEnum, bigint, index, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";
import { eventsTable } from "./events.js";
import { venuesTable } from "./venues.js";
import { screensTable } from "./screens.js";

export const showStatus = pgEnum("show_status", ["scheduled", "airing", "cancelled", "completed"]);

export const showsTable = pgTable(
	"shows",
	{
		id: bigintAsText("id").primaryKey(),
		eventId: bigintAsText("event_id")
			.notNull()
			.references(() => eventsTable.id),
		venueId: bigintAsText("venue_id")
			.notNull()
			.references(() => venuesTable.id),
		screenId: bigintAsText("screen_id")
			.notNull()
			.references(() => screensTable.id),
		seatLayout: jsonb("seat_layout").notNull(),
		status: showStatus("status").default("scheduled"),
		startTimestamp: bigint("start_timestamp", { mode: "number" }).notNull(),
		endTimestamp: bigint("end_timestamp", { mode: "number" }).notNull(),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	},
	(table) => [
		index("idx_shows_event_id").on(table.eventId),
		index("idx_shows_venue_id").on(table.venueId),
	]
);
