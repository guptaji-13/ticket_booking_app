import { UsersService } from "../services/index.service.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ServiceError } from "../utils/error.util.js";

export class UsersController {
	static async getProfile(req: any, res: any) {
		try {
			const userId = req.user.id;
			const user = await UsersService.getUserById(userId);
			if (!user) throw Error("User not found");

			return ApiResponse.success(res, user);
		} catch (error) {
			console.error("Error fetching profile: ", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to fetch profile", error);
		}
	}
	static async updateUser(req: any, res: any) {
		try {
			const userId = req.user.id;
			const { name, email } = req.body;
			const updatedUser = await UsersService.updateUser(userId, { name, email });
			return ApiResponse.success(res, updatedUser);
		} catch (error) {
			console.error("Error updating user:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to update user", error);
		}
	}
}
