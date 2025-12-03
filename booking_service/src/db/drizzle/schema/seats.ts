import { pgTable, pgEnum, bigint, text, index, integer, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";
import { showsTable } from "./shows.js";

export const seatStatus = pgEnum("seat_status", ["booked", "available"]);

export const seatsTable = pgTable(
	"seats",
	{
		id: bigintAsText("id").primaryKey(),
		name: text("name").notNull(),
		showId: bigintAsText("show_id")
			.notNull()
			.references(() => showsTable.id),
		section: text("section").notNull(),
		price: integer("price").notNull(),
		status: seatStatus("status").default("available").notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	},
	(table) => [index("idx_seats_show_id").on(table.showId)]
);
