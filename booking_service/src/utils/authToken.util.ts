import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RefreshTokensDAO } from "../dao/index.dao.js";
import { db } from "../db/drizzle/index.js";

const ACCESS_EXPIRES_IN = "30d";
const REFRESH_EXPIRES_DAYS = 30;

export function generateAccessToken(payload: Record<string, any>) {
	return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: ACCESS_EXPIRES_IN });
}

export function verifyAccessToken(token: string) {
	return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
}

export function generateRefreshTokenRaw() {
	// high-entropy random string
	return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token: string) {
	return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshExpiryDate() {
	const d = new Date();
	d.setDate(d.getDate() + REFRESH_EXPIRES_DAYS);
	return d.getTime();
}

// store hashed token with metadata
export async function persistRefreshToken(tokenData: any) {
	await RefreshTokensDAO.createRefreshToken(tokenData);
}

// get stored record by token hash
export async function findRefreshTokenByHash(tokenHash: string) {
	const token = await RefreshTokensDAO.getRefreshTokenByHash(tokenHash);
	return token;
}

// mark token revoked / replaced
export async function revokeRefreshToken(tokenHash: string, replacedBy?: string) {
	await RefreshTokensDAO.revokeRefreshToken(tokenHash, replacedBy);
}

// rotate token: mark current replacedBy -> create new DB entry for new hash
export async function rotateRefreshToken(
	oldHash: string,
	newHash: string,
	userId: string,
	ip?: string,
	userAgent?: string
) {
	const expiresAt = getRefreshExpiryDate();
	await db.transaction(async (txn) => {
		// mark old token replaced
		await RefreshTokensDAO.revokeRefreshToken(oldHash, newHash, txn);
		// insert new token
		await RefreshTokensDAO.createRefreshToken(
			{
				tokenHash: newHash,
				userId,
				expiresAt,
				createdAt: Date.now(),
				revoked: false,
				ip: ip || null,
				userAgent: userAgent || null,
			},
			txn
		);
	});
}
