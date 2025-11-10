export interface Show {
	// show
	show_id: string;
	screen_details?: { tags?: string[] };
	start_timestamp: string; // ISO
	show_status: "scheduled" | "airing" | "cancelled" | "completed" | "postponed";
	total_seat_count?: number;
	available_seat_count?: number;
	show_language?: string;
	price_max?: number;
	price_min?: number;
	// event
	event_id: string;
	event_title: string;
	event_category: string;
	event_description?: string;
	event_duration_minutes?: number;
	event_metadata?: {
		artists?: string[];
		genre?: string[];
		ratings?: { imdb?: number; rottenTomatoes?: number };
		languages?: string[];
		tags?: string[];
	};
	// venue
	venue_id: string;
	venue_name?: string;
	venue_city: string;
	venue_address?: string;
	venue_metadata: { tags?: string[] };
}
