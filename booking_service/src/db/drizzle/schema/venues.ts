import { pgTable, bigint, text, index, jsonb } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const venuesTable = pgTable(
	"venues",
	{
		id: bigintAsText("id").primaryKey(),
		name: text("name"),
		city: text("city"),
		address: text("address"),
		metadata: jsonb("metadata"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	},
	(table) => [index("idx_venues_city").on(table.city)]
);
