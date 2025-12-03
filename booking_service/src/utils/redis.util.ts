import { Redis } from "ioredis";
import type { Redis as RedisType } from "ioredis";
import { logger } from "./logger.util.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export class RedisClient {
	private static instance: RedisType;

	static getClient(): RedisType {
		if (!this.instance) {
			this.instance = new Redis(REDIS_URL);

			this.instance.on("connect", () => logger.info("✅ Redis connected"));
			this.instance.on("error", (err) => logger.error("❌ Redis error:", err));
		}
		return this.instance;
	}

	// Get a value
	static async get(key: string): Promise<string | null> {
		const client = this.getClient();
		return client.get(key);
	}

	// Set a value (with optional expiry in seconds)
	static async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		const client = this.getClient();
		if (ttlSeconds) {
			await client.set(key, value, "EX", ttlSeconds);
		} else {
			await client.set(key, value);
		}
	}

	// Delete a key
	static async del(key: string): Promise<void> {
		const client = this.getClient();
		await client.del(key);
	}

	// Check if key exists
	static async exists(key: string): Promise<boolean> {
		const client = this.getClient();
		const result = await client.exists(key);
		return result === 1;
	}

	static async delPattern(pattern: string): Promise<number> {
		const client = this.getClient();
		let cursor = "0";
		let deletedCount = 0;

		do {
			// SCAN for keys in batches to avoid blocking Redis
			const [newCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
			cursor = newCursor;
			if (keys.length > 0) {
				// Pipeline deletes for better performance
				const pipeline = client.pipeline();
				keys.forEach((key) => pipeline.del(key));

				const results = await pipeline.exec();
				// Count how many keys were deleted
				deletedCount += results?.filter(([err]) => !err)?.length ?? 0;
			}
		} while (cursor !== "0");
		return deletedCount;
	}

	static async acquireMultipleLocks(
		keys: string[],
		value: string,
		ttlSeconds: number
	): Promise<boolean> {
		const client = RedisClient.getClient();
		const script = `
			for i, key in ipairs(KEYS) do
				if redis.call("exists", key) == 1 then
					return 0
				end
			end
			for i, key in ipairs(KEYS) do
				redis.call("set", key, ARGV[1], "EX", ARGV[2])
			end
			return 1
		`;
		const result = await client.eval(script, keys.length, ...keys, value, ttlSeconds);
		return result === 1;
	}

	// Hast Set field
	static async hSet(hashKey: string, field: string, value: string): Promise<boolean> {
		const client = this.getClient();
		const result = await client.hsetnx(hashKey, field, value);
		return result === 1;
	}

	// Delete a field from a hash
	static async hDel(hashKey: string, field: string): Promise<void> {
		const client = this.getClient();
		await client.hdel(hashKey, field);
	}
}
