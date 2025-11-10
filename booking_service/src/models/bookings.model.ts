export interface Booking {
	id: string;
	eventId: string;
	userId: string;
	seatIds: string[]; // array of seat IDs
	status: "pending" | "success" | "failed";
	idempotencyKey: string;
	totalAmount: number;
	createdAt: number;
	updatedAt: number;
}
