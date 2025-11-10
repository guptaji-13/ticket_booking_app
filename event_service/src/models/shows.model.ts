export interface Show {
	show_id: string;
	event_id: string;
	venue_id: string;
	screen_details: Record<string, any>;
	show_timestamp: Date;
	status: "scheduled" | "cancelled" | "completed";
	last_updated?: Date;
}

const seatSnapshot = {
	priceMap: {
		economy: 100,
		premium: 200,
		recliner: 300,
	},
	rows: [
		{
			row: "A",
			priceCategory: "economy",
			layout: [
				{
					id: "5467647-62437569-4235787",
					name: "A1",
				},
				{
					id: "4576895-437589-hjsgf784657",
					name: "A2",
				},
				null,
				{
					id: "7567565-5346736-5363634",
					name: "A3",
				},
			],
		},
		null,
		{
			row: "B",
			priceCategory: "premium",
			layout: [
				{
					id: "5467647-62437569-4235788",
					name: "B1",
				},
				{
					id: "4576895-437589-hjsgf784658",
					name: "B2",
				},
				null,
				{
					id: "7567565-5346736-5363638",
					name: "B3",
				},
			],
		},
		{
			row: "C",
			priceCategory: "recliner",
			layout: [
				{
					id: "5467647-62437569-4235789",
					name: "C1",
				},
				{
					id: "4576895-437589-hjsgf784659",
					name: "C2",
				},
				null,
				{
					id: "7567565-5346736-5363639",
					name: "C3",
				},
			],
		},
	],
};
