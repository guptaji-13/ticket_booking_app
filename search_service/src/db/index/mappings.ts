export const SHOWS_INDEX = "shows_search";

export const showsIndexMapping = {
	mappings: {
		properties: {
			show_id: { type: "keyword" },
			screen_details: {
				properties: {
					tags: { type: "keyword" },
				},
			},
			start_timestamp: { type: "date" },
			show_status: { type: "keyword" },
			total_seat_count: { type: "integer" },
			available_seat_count: { type: "integer" },
			show_language: { type: "keyword" },
			price_max: { type: "float" },
			price_min: { type: "float" },
			event_id: { type: "keyword" },
			event_title: {
				type: "text",
				fields: {
					keyword: { type: "keyword" },
				},
			},
			event_category: { type: "keyword" },
			event_description: {
				type: "text",
				fields: {
					keyword: { type: "keyword" },
				},
			},
			event_duration_minutes: { type: "integer" },
			event_metadata: {
				properties: {
					artists: {
						type: "text",
						fields: {
							keyword: { type: "keyword" },
						},
					},
					genre: { type: "keyword" },
					ratings: {
						properties: {
							imdb: { type: "float" },
							rottenTomatoes: { type: "integer" },
						},
					},
					languages: { type: "keyword" },
					tags: { type: "keyword" },
				},
			},
			venue_id: { type: "keyword" },
			venue_name: {
				type: "text",
				fields: {
					keyword: { type: "keyword" },
				},
			},
			venue_city: { type: "keyword" },
			venue_address: {
				type: "text",
				fields: {
					keyword: { type: "keyword" },
				},
			},
			venue_metadata: {
				properties: {
					tags: { type: "keyword" },
				},
			},
		},
	},
};
