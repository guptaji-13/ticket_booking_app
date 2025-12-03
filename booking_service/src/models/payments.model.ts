export interface Payment {
	id: string;
	bookingId: string;
	userId: string;
	idempotencyKey: string;
	provider: string;
	amount: number;
	status: "initiated" | "pending" | "success" | "failed";
	createdAt: number;
	updatedAt: number;
	responseData?: Record<string, any> | null;
}
