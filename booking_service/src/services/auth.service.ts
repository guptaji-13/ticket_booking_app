// services/auth.service.ts
import {
	generateAccessToken,
	generateRefreshTokenRaw,
	hashToken,
	getRefreshExpiryDate,
	persistRefreshToken,
	findRefreshTokenByHash,
	rotateRefreshToken,
	revokeRefreshToken,
} from "../utils/authToken.util.js";
import { sendOtpToPhone, verifyOtpForPhone } from "../utils/otp.util.js";
import { UsersDAO, RefreshTokensDAO } from "../dao/index.dao.js";

export class AuthService {
	static async requestOtp(phone: string) {
		await sendOtpToPhone(phone);
		return true;
	}

	static async verifyOtp(phone: string, otp: string) {
		return await verifyOtpForPhone(phone, otp);
	}

	static async createTokensForUser(
		user: { id: string; phone: string },
		ip?: string,
		userAgent?: string
	) {
		try {
			const accessToken = generateAccessToken({ id: user.id, phone: user.phone });
			const rawRefresh = generateRefreshTokenRaw();
			const refreshHash = hashToken(rawRefresh);
			const expiresAt = getRefreshExpiryDate();

			await persistRefreshToken({
				tokenHash: refreshHash,
				userId: user.id,
				expiresAt,
				createdAt: Date.now(),
				ip,
				userAgent,
			});

			return {
				accessToken,
				refreshToken: rawRefresh,
				refreshExpiresAt: expiresAt,
			};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Refresh token handler:
	 * - validate provided raw refresh token
	 * - if valid and not revoked: rotate and return new tokens
	 * - if token was replaced or revoked -> treat as compromise: revoke all for user
	 */
	static async handleRefreshToken(rawToken: string, ip?: string, userAgent?: string) {
		const tokenHash = hashToken(rawToken);
		const stored = await findRefreshTokenByHash(tokenHash);
		if (!stored) throw new Error("Invalid refresh token");

		if (stored.revoked) {
			// token reuse detection — revoke all tokens for this user
			await RefreshTokensDAO.revokeAllTokensForUser(stored.userId);
			throw new Error("Refresh token revoked - possible reuse detected");
		}

		if (stored.expiresAt <= Date.now()) {
			throw new Error("Refresh token expired");
		}

		// rotate: create new token and mark old replaced
		const rawNext = generateRefreshTokenRaw();
		const nextHash = hashToken(rawNext);
		await rotateRefreshToken(tokenHash, nextHash, stored.userId, ip, userAgent);

		const user = await UsersDAO.getUserById(stored.userId);
		if (!user) {
			throw new Error("User not found");
		}
		const accessToken = generateAccessToken({ sub: user.id, phone: user.phone });

		return {
			accessToken,
			refreshToken: rawNext,
			refreshExpiresAt: getRefreshExpiryDate(),
		};
	}

	static async revokeRefreshToken(rawToken: string) {
		try {
			const hash = hashToken(rawToken);
			await revokeRefreshToken(hash);
		} catch (error) {
			throw error;
		}
	}
}
