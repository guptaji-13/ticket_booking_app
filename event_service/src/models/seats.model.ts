export interface SeatAvailability {
	show_id: string;
	seat_id: string;
	status: "available" | "booked" | "locked";
	last_updated: Date;
}

export interface SeatSnapshot {
	show_id: string;
	seat_snapshot: any;
	updated_at: Date;
}

// snapshot example
// const a = [
//     [
//         {}, {a1: 'booked'}, ...
//     ],
//     [
//         {}, {b1: 'available'}, ...
//     ]
// ]
