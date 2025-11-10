import { eventsMapper } from "../db/cassandraClient.js";
import type { Event } from "../models/index.model.js";

export class EventsDAO {
	static async createEvent(data: Event): Promise<Event | null> {
		try {
			const result = await eventsMapper.insert(data);
			return result.wasApplied() ? data : null;
		} catch (error) {
			throw error;
		}
	}

	static async getAllEvents(): Promise<Event[]> {
		try {
			const result = await eventsMapper.find({}, { orderBy: { event_id: "desc" } });
			return result.toArray();
		} catch (error) {
			throw error;
		}
	}

	static async getEventById(eventId: string): Promise<Event | null> {
		try {
			const result = await eventsMapper.get({ event_id: eventId });
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async updateEvent(eventId: string, data: Partial<Event>): Promise<boolean> {
		try {
			const result = await eventsMapper.update({
				...data,
				event_id: eventId,
				updated_at: new Date(),
			});
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	static async deleteEvent(eventId: string): Promise<boolean> {
		try {
			const result = await eventsMapper.remove({ event_id: eventId });
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}
}
