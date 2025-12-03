import { pgTable, bigint, text, index, integer, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const eventsTable = pgTable(
	"events",
	{
		id: bigintAsText("id").primaryKey(),
		title: text("title"),
		category: text("category"),
		description: text("description"),
		durationMinutes: integer("duration_minutes"),
		metadata: jsonb("metadata"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	},
	(table) => [index("idx_events_category").on(table.category)]
);
