export interface Payment {
	id: string;
	bookingId: string;
	idempotencyKey: string;
	provider: string;
	amount: number;
	status: "pending" | "success" | "failed";
	createdAt: number;
	updatedAt: number;
	responseData?: Record<string, any>;
}
