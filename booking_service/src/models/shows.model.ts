export interface Show {
	id: string;
	eventId: string;
	venueId: string;
	screenId: string;
	seatLayout: any;
	status: "scheduled" | "airing" | "cancelled" | "completed";
	startTimestamp: number;
	endTimestamp: number;
	createdAt: number;
	updatedAt: number;
}

const seatLayoutExample = {
	sections: [
		{
			name: "premium",
			price: 300,
			rows: [{ row: "A", seatIds: ["show123_0", "show123_1", null, "show123_2"] }],
		},
	],
};
