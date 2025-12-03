export interface Screen {
	id: string;
	venueId: string;
	seatLayout: any;
	metadata: any;
	createdAt: number;
	updatedAt: number;
}

const seatLayoutExample = {
	sections: [
		{
			name: "premium",
			rows: [{ row: "A", seats: ["A1", "A2", "A3", null, "A4", "A5", "A6"] }],
		},
	],
};
