import { AuthService, UsersService } from "../services/index.service.js";

export class AuthController {
	static async requestOtp(req: any, res: any) {
		try {
			const { phone } = req.query;
			await AuthService.requestOtp(phone);
			return res.json({ message: "OTP sent successfully" });
		} catch (error) {
			return res.status(500).json({ message: "Internal server error" });
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
			return res.status(200).json({ accessToken: tokens.accessToken, user, newUser });
		} catch (error) {
			console.error("Error in verifyOtp:", error);
			return res
				.status(500)
				.json({ message: "Internal server error", reason: (error as Error).message });
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
			return res.json({ accessToken: tokens.accessToken });
		} catch (err) {
			// on any error, clear cookie
			res.clearCookie("refresh_token", { path: "/auth/refresh" });
			return res.status(401).json({ message: (err as Error).message || "Invalid refresh" });
		}
	}

	static async logout(req: any, res: any) {
		try {
			const rawToken = req.cookies.refresh_token;
			if (rawToken) {
				await AuthService.revokeRefreshToken(rawToken);
			}
			res.clearCookie("refresh_token", { path: "/auth/refresh" });
			res.json({ ok: true });
		} catch (err) {
			res.status(500).json({ message: "Logout failed" });
		}
	}
}
