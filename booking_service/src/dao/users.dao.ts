import { db } from "../db/drizzle/index.js";
import { eq, sql } from "drizzle-orm";
import { usersTable } from "../db/drizzle/index.js";
import type { User } from "../models/users.model.js";
import { generateSnowflake } from "../utils/snowflake.util.js";

export class UsersDAO {
	static async createUser(user: Omit<User, "id">): Promise<User | null> {
		try {
			const result = (await db
				.insert(usersTable)
				.values({
					id: generateSnowflake(),
					...user,
				})
				.returning()) as User[];
			return result[0] || null;
		} catch (error) {
			console.log("Error creating user:", error);
			throw error;
		}
	}

	static async getUserById(userId: string): Promise<User | null> {
		const result = (await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1)) as User[];
		return result[0] || null;
	}

	static async getUserByPhone(phone: string): Promise<User | null> {
		const result = (await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.phone, phone))
			.limit(1)) as User[];
		console.log(result[0]);
		return result[0] || null;
	}

	static async updateUsers(user: Partial<User>, userId: string): Promise<User | null> {
		const result = (await db
			.update(usersTable)
			.set(user)
			.where(eq(usersTable.id, userId))
			.returning()) as User[];
		return result[0] || null;
	}
}
