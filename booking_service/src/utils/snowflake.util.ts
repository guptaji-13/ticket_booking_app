import { RedisClient } from "./redis.util.js";
import os from "os";

const CUSTOM_EPOCH = 1700000000000n; // (Nov 2023)

// Bit allocation
const WORKER_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;

const MAX_WORKER_ID = (1n << WORKER_ID_BITS) - 1n;
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n;

// Shifts
const WORKER_ID_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = WORKER_ID_BITS + SEQUENCE_BITS;

// Runtime state
let sequence = 0n;
let lastTimestamp = 0n;
let WORKER_ID = Number(process.env.WORKER_ID ?? -1);

const REDIS_KEY = "snowflake:worker_ids";

// Hash helper
function hash(str: string) {
	return [...str].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 0);
}

// Acquire worker ID
async function initWorkerId() {
	// If manually set → trust it
	if (WORKER_ID >= 0 && WORKER_ID <= Number(MAX_WORKER_ID)) {
		console.log(`🔢 Using ENV WORKER_ID: ${WORKER_ID}`);
		return;
	}

	try {
		// Find available worker ID
		for (let i = 0; i <= Number(MAX_WORKER_ID); i++) {
			const acquired = await RedisClient.hSet(REDIS_KEY, `${i}`, "1");
			if (acquired) {
				WORKER_ID = i;
				console.log(`🔑 Worker ID allocated via Redis: ${WORKER_ID}`);
				return;
			}
		}

		console.warn("⚠️ Worker ID pool exhausted. Using fallback.");
	} catch {
		console.warn("⚠️ Redis unavailable! Using fallback worker ID.");
	}

	WORKER_ID = Math.abs(hash(os.hostname())) % Number(MAX_WORKER_ID + 1n);
	console.warn(`⚠️ Worker ID fallback: ${WORKER_ID}`);
}

function waitForNextMs(ts: bigint) {
	while (BigInt(Date.now()) <= ts + CUSTOM_EPOCH) {}
}

export async function initSnowflake() {
	await initWorkerId();
}

// ID Generation
export function generateSnowflake(): string {
	const now = BigInt(Date.now());
	const timestamp = now - CUSTOM_EPOCH;

	if (timestamp < lastTimestamp) {
		console.error("⛔ Clock moved backwards! Waiting...");
		waitForNextMs(lastTimestamp);
	}

	if (timestamp === lastTimestamp) {
		sequence = (sequence + 1n) & MAX_SEQUENCE;
		if (sequence === 0n) {
			waitForNextMs(now);
		}
	} else {
		sequence = 0n;
	}

	lastTimestamp = timestamp;

	const id = (timestamp << TIMESTAMP_SHIFT) | (BigInt(WORKER_ID) << WORKER_ID_SHIFT) | sequence;

	return id.toString();
}

// Decoder
export function decodeSnowflake(idStr: string) {
	const id = BigInt(idStr);

	const timestamp = (id >> TIMESTAMP_SHIFT) + CUSTOM_EPOCH;
	const workerId = Number((id >> WORKER_ID_SHIFT) & MAX_WORKER_ID);
	const seq = Number(id & MAX_SEQUENCE);

	return {
		timestamp: new Date(Number(timestamp)),
		workerId,
		sequence: seq,
	};
}

export async function releaseWorkerId() {
	try {
		if (WORKER_ID < 0) {
			console.log("ℹ️ No Redis worker ID to release");
			return;
		}
		await RedisClient.hDel(REDIS_KEY, `${WORKER_ID}`);
	} catch (err) {
		console.error("❌ Failed to release worker ID:", err);
	}
}
