import { UsersDAO } from "../dao/index.dao.js";

export class UsersService {
	static async getUserById(userId: string) {
		try {
			const user = await UsersDAO.getUserById(userId);
			return user;
		} catch (error) {
			throw error;
		}
	}

	static async getUserByPhone(phone: string) {
		try {
			const user = await UsersDAO.getUserByPhone(phone);
			return user;
		} catch (error) {
			throw error;
		}
	}

	static async createUser(userData: any) {
		try {
			const newUser = await UsersDAO.createUser({ ...userData, createdAt: Date.now() });
			if (!newUser) {
				throw new Error("Failed to create user");
			}
			return newUser;
		} catch (error) {
			throw error;
		}
	}

	static async updateUser(userId: string, updateData: any) {
		try {
			const updatedUser = await UsersDAO.updateUsers(updateData, userId);
			if (!updatedUser) {
				throw new Error("Failed to update user");
			}
			return updatedUser;
		} catch (error) {
			throw error;
		}
	}
}
