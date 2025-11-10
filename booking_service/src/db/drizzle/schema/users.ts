import { pgTable, bigint, text, index } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const usersTable = pgTable(
	"users",
	{
		id: bigintAsText("id").primaryKey(),
		name: text("name"),
		email: text("email").unique(),
		phone: text("phone").notNull().unique(),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
	},
	(table) => [index("idx_users_phone").on(table.phone)]
);
