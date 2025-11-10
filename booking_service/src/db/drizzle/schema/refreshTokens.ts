import { pgTable, text, bigint, boolean, index } from "drizzle-orm/pg-core";
import { bigintAsText } from "../../../utils/drizzle.util.js";

export const refreshTokensTable = pgTable(
	"refresh_tokens",
	{
		tokenHash: text("token_hash").primaryKey(), // store hash of token
		userId: bigintAsText("user_id").notNull(),
		expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		replacedBy: text("replaced_by"), // tokenHash of new token if rotated
		revoked: boolean("revoked").notNull().default(false),
		ip: text("ip"),
		userAgent: text("user_agent"),
	},
	(table) => [index("idx_refresh_tokens_user_id").on(table.userId)]
);
