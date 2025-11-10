import { RedisClient } from "./redis.util.js";
import { EventGrpcClient } from "../grpc/clients/event.grpc.client.js";

export const verifySeatLocks = async (eventId: string, seatIds: string[], userId: string) => {
	for (const seatId of seatIds) {
		const lockKey = `seat_lock:${userId}:${eventId}:${seatId}`;
		const isLocked = await RedisClient.exists(lockKey);
		if (isLocked) {
			return false;
		}
	}
	return true;
};

export const acquireSeatLocks = async (eventId: string, seatIds: string[], userId: string) => {
	// ✅ gRPC call to event service and add to Redis distributed lock
	const seatsStatus: any = await EventGrpcClient.verifySeats(eventId, seatIds);
	let seatsAvailable = true;
	for (const seat of seatsStatus.seats) {
		if (seat.status != "available") {
			seatsAvailable = false;
		}
	}
	if (!seatsAvailable) return false;
	const keys = [];
	for (const seatId of seatIds) {
		const lockKey = `seat_lock:${userId}:${eventId}:${seatId}`;
		keys.push(lockKey);
	}
	const redisResponse = await RedisClient.acquireMultipleLocks(keys, 300);
	if (redisResponse) EventGrpcClient.reserveSeats(eventId, seatIds, 300);
	return redisResponse;
};

export const releaseSeatLocks = async (eventId: string, seatIds: string[], userId: string) => {
	// ✅ Remove from Redis distributed lock
	for (const seatId of seatIds) {
		const lockKey = `seat_lock:${userId}:${eventId}:${seatId}`;
		await RedisClient.del(lockKey);
	}
};
