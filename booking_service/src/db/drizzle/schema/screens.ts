import { pgTable, bigint, index, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";
import { venuesTable } from "./venues.js";

export const screensTable = pgTable(
	"screens",
	{
		id: bigintAsText("id").primaryKey(),
		venueId: bigintAsText("venue_id")
			.notNull()
			.references(() => venuesTable.id),
		seatLayout: jsonb("seat_layout").notNull(),
		metadata: jsonb("metadata"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	},
	(table) => [index("idx_screens_venue_id").on(table.venueId)]
);
