export interface Seat {
	id: string;
	name: string;
	section: string;
	price: number;
	showId: string;
	status: "booked" | "available";
	updatedAt: number;
}
