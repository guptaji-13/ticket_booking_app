export interface Event {
	event_id: string;
	title: string;
	category: string;
	description?: string;
	language?: string;
	duration_minutes?: number;
	metadata?: Record<string, string>;
	created_at?: Date;
	updated_at?: Date;
}
