import { UsersService } from "../services/index.service.js";

export class UsersController {
	static async getProfile(req: any, res: any) {
		try {
			const userId = req.user.id;
			const user = await UsersService.getUserById(userId);
			if (!user) throw Error("User not found");
			console.log(user);
			return res.status(200).json(user);
		} catch (error) {
			console.error("Error fetching profile: ", error);
			return res.status(500).json({ error: "Failed to fetch profile" });
		}
	}
	static async updateUser(req: any, res: any) {
		try {
			const userId = req.user.id;
			const { name, email } = req.body;
			const updatedUser = await UsersService.updateUser(userId, { name, email });
			return res.json(updatedUser);
		} catch (error) {
			console.error("Error updating user:", error);
			return res.status(500).json({ error: "Failed to update user" });
		}
	}
}
