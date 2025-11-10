// Same as PostgreSQL (Nov 2023)
const CUSTOM_EPOCH = 1700000000000n;

// Bit allocations
const TIMESTAMP_BITS = 41n;
const SHARD_VERSION_BITS = 7n;
const SHARD_ID_BITS = 8n;
const COUNTER_BITS = 8n;

// Masks (e.g., 0xFF)
const COUNTER_MASK = (1n << COUNTER_BITS) - 1n;
const SHARD_ID_MASK = (1n << SHARD_ID_BITS) - 1n;
const SHARD_VERSION_MASK = (1n << SHARD_VERSION_BITS) - 1n;

// Shifts
const SHARD_ID_SHIFT = COUNTER_BITS; // 8
const SHARD_VERSION_SHIFT = SHARD_ID_BITS + COUNTER_BITS; // 16
const TIMESTAMP_SHIFT = SHARD_VERSION_BITS + SHARD_ID_BITS + COUNTER_BITS; // 23

// Sequence counter (local process)
let sequence = 0n;
let lastTimestamp = 0n;

export interface DecodedSnowflake {
	timestamp: Date;
	shardVersion: number;
	shardId: number;
	counter: number;
}

// Generate a Snowflake ID using the same 41/7/8/8 layout as in SQL
export function generateSnowflake(shardVersion: number, shardId: number): bigint {
	const nowMs = BigInt(Date.now());
	const timestamp = nowMs - CUSTOM_EPOCH;

	// Reset sequence if we're in a new millisecond
	if (timestamp === lastTimestamp) {
		sequence = (sequence + 1n) & COUNTER_MASK;
		if (sequence === 0n) {
			// Wait for next millisecond if overflow
			while (BigInt(Date.now()) <= nowMs) {}
		}
	} else {
		sequence = 0n;
	}

	lastTimestamp = timestamp;

	// Compose 64-bit Snowflake ID
	const id =
		(timestamp << TIMESTAMP_SHIFT) |
		(BigInt(shardVersion) << SHARD_VERSION_SHIFT) |
		(BigInt(shardId) << SHARD_ID_SHIFT) |
		sequence;

	return id;
}

// Decode a 64-bit Snowflake ID into its components
export function decodeSnowflake(raw_id: string): DecodedSnowflake {
	const id = BigInt(raw_id);
	const timestampPart = id >> TIMESTAMP_SHIFT;
	const shardVersionPart = (id >> SHARD_VERSION_SHIFT) & SHARD_VERSION_MASK;
	const shardIdPart = (id >> SHARD_ID_SHIFT) & SHARD_ID_MASK;
	const counterPart = id & COUNTER_MASK;

	const timestamp = new Date(Number(timestampPart + CUSTOM_EPOCH));

	return {
		timestamp,
		shardVersion: Number(shardVersionPart),
		shardId: Number(shardIdPart),
		counter: Number(counterPart),
	};
}
