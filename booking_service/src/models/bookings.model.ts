export interface Booking {
	id: string;
	showId: string;
	userId: string;
	seatIds: string[]; // array of seat IDs
	status: "pending" | "confirmed" | "failed" | "expired" | "cancelled" | "refunded";
	idempotencyKey: string;
	totalAmount: number;
	createdAt: number;
	updatedAt: number;
}
