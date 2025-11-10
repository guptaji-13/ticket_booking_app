import { randomUUID } from "crypto";

// In production, use Redis or a separate DB table.
// For now, simulate with an in-memory Map.
const idempotencyCache = new Map<string, any>();

export async function checkIdempotency(key: string) {
	return idempotencyCache.get(key);
}

export async function saveIdempotencyResult(key: string, result: any) {
	idempotencyCache.set(key, result);
}

export function generateIdempotencyKey(): string {
	return randomUUID();
}
