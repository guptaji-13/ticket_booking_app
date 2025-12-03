import { RedisClient } from "./redis.util.js";
import { EventGrpcClient } from "../grpc/clients/event.grpc.client.js";

export const verifySeatLocks = async (showId: string, seatIds: string[], userId: string) => {
	for (const seatId of seatIds) {
		const lockKey = `seat_lock:${showId}:${seatId}`;
		const isLocked = await RedisClient.get(lockKey);
		if (isLocked !== userId) {
			return false;
		}
	}
	return true;
};

export const acquireSeatLocks = async (showId: string, seatIds: string[], userId: string) => {
	// ✅ gRPC call to event service and add to Redis distributed lock
	const seatsStatus: any = await EventGrpcClient.verifySeats(showId, seatIds);
	let seatsAvailable = true;
	for (const seat of seatsStatus.seats) {
		if (seat.status != "available") {
			seatsAvailable = false;
		}
	}
	if (!seatsAvailable) return false;
	const keys = [];
	for (const seatId of seatIds) {
		const lockKey = `seat_lock:${showId}:${seatId}`;
		keys.push(lockKey);
	}
	const redisResponse = await RedisClient.acquireMultipleLocks(keys, userId, 300);
	if (redisResponse) EventGrpcClient.reserveSeats(showId, seatIds, 300);
	return redisResponse;
};

export const releaseSeatLocks = async (showId: string, seatIds: string[]) => {
	// ✅ Remove from Redis distributed lock
	for (const seatId of seatIds) {
		const lockKey = `seat_lock:${showId}:${seatId}`;
		await RedisClient.del(lockKey);
	}
};
