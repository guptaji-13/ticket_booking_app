import { db } from "../db/drizzle/index.js";
import { eq, desc, sql } from "drizzle-orm";
import { refreshTokensTable } from "../db/drizzle/index.js";
import type { RefreshToken } from "../models/index.model.js";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export class RefreshTokensDAO {
	static async createRefreshToken(
		token: RefreshToken,
		txn: NodePgDatabase | null = null
	): Promise<RefreshToken | null> {
		const result = (await (txn || db)
			.insert(refreshTokensTable)
			.values(token)
			.returning()) as RefreshToken[];
		return result[0] || null;
	}

	static async getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
		const result = (await db
			.select()
			.from(refreshTokensTable)
			.where(eq(refreshTokensTable.tokenHash, tokenHash))
			.limit(1)) as RefreshToken[];
		return result[0] || null;
	}

	static async revokeRefreshToken(
		tokenHash: string,
		replacedBy?: string,
		txn: NodePgDatabase | null = null
	): Promise<RefreshToken | null> {
		const result = (await (txn || db)
			.update(refreshTokensTable)
			.set({ revoked: true, replacedBy: replacedBy ?? null })
			.where(eq(refreshTokensTable.tokenHash, tokenHash))
			.returning()) as RefreshToken[];
		return result[0] || null;
	}

	static async revokeAllTokensForUser(
		userId: string,
		txn: NodePgDatabase | null = null
	): Promise<void> {
		await (txn || db)
			.update(refreshTokensTable)
			.set({ revoked: true })
			.where(eq(refreshTokensTable.userId, userId));
	}
}
