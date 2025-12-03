import { AuthService, UsersService } from "../services/index.service.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ServiceError } from "../utils/error.util.js";

export class AuthController {
	static async requestOtp(req: any, res: any) {
		try {
			const { phone } = req.query;
			await AuthService.requestOtp(phone);
			return ApiResponse.success(res, { phone }, "OTP sent");
		} catch (error) {
			console.error("Error in requestOtp:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to send OTP", error);
		}
	}

	static async verifyOtp(req: any, res: any) {
		try {
			const { phone, otp } = req.body;
			const isValid = await AuthService.verifyOtp(phone, otp);
			if (!isValid) {
				return res.status(401).json({ message: "Invalid OTP" });
			}
			let newUser = false;
			let user = await UsersService.getUserByPhone(phone);
			if (!user) {
				user = await UsersService.createUser({ phone });
				newUser = true;
			}

			const tokens = await AuthService.createTokensForUser(
				user,
				req.ip,
				req.headers["user-agent"] || ""
			);
			res.cookie("refresh_token", tokens.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				expires: new Date(Number(tokens.refreshExpiresAt)),
			});
			res.setHeader("Access-Control-Allow-Credentials", "true");
			return ApiResponse.success(
				res,
				{ accessToken: tokens.accessToken, user, newUser },
				"OTP verified"
			);
		} catch (error) {
			console.error("Error in verifyOtp:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to verify OTP", error);
		}
	}

	static async createAccessTokenFromRefreshToken(req: any, res: any) {
		try {
			const raw = req.cookies.refresh_token || req.headers["x-refresh-token"];
			if (!raw) return res.status(401).json({ message: "Missing refresh token" });

			const tokens = await AuthService.handleRefreshToken(
				raw,
				req.ip,
				req.headers["user-agent"]
			);
			// set rotated refresh token as cookie
			res.cookie("refresh_token", tokens.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				expires: new Date(Number(tokens.refreshExpiresAt)),
			});
			res.setHeader("Access-Control-Allow-Credentials", "true");
			return ApiResponse.success(res, { accessToken: tokens.accessToken });
		} catch (error) {
			// on any error, clear cookie
			res.clearCookie("refresh_token", { path: "/auth/refresh" });
			console.error("Error in createAccessTokenFromRefreshToken:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to refresh access token", error);
		}
	}

	static async logout(req: any, res: any) {
		try {
			const rawToken = req.cookies.refresh_token;
			if (rawToken) {
				await AuthService.revokeRefreshToken(rawToken);
			}
			res.clearCookie("refresh_token", { path: "/auth/refresh" });
			return ApiResponse.success(res, null, "Logged out");
		} catch (error) {
			console.error("Error in logout:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Logout failed", error);
		}
	}
}
