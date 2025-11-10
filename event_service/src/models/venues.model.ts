export interface Venue {
	venue_id: string;
	name: string;
	city: string;
	address: string;
	total_screens: number;
	metadata?: Record<string, any>;
	created_at?: Date;
	updated_at?: Date;
}
