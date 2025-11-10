import { v7 as uuidv7 } from "uuid";

import { EventsDAO } from "../dao/index.dao.js";

export class EventsService {
	static async createEvent(data: any) {
		try {
			const { description, title, category, language, durationMinutes, metadata } = data;
			const newEvent = await EventsDAO.createEvent({
				event_id: uuidv7(),
				title,
				category,
				description,
				language,
				duration_minutes: durationMinutes,
				metadata,
				created_at: new Date(),
				updated_at: new Date(),
			});
			return newEvent;
		} catch (error) {
			throw error;
		}
	}

	static async getEventById(eventId: string) {
		try {
			const result = await EventsDAO.getEventById(eventId);
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async updateEvent(eventId: string, data: any) {
		try {
			const result = await EventsDAO.updateEvent(eventId, data);
			return result;
		} catch (error) {
			throw error;
		}
	}
}
