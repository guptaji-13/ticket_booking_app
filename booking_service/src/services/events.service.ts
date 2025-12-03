import { EventsDAO } from "../dao/index.dao.js";
import { ServiceError } from "../utils/error.util.js";
import type { Event } from "../models/index.model.js";

export class EventsService {
	static async createEvent(payload: Omit<Event, "id" | "createdAt" | "updatedAt">) {
		try {
			const now = Date.now();
			const eventRecord = await EventsDAO.createEvent({
				...payload,
				createdAt: now,
				updatedAt: now,
			});
			if (!eventRecord) throw new ServiceError("INTERNAL_ERROR");
			return eventRecord;
		} catch (error) {
			throw error;
		}
	}

	static async getEventById(eventId: string) {
		try {
			const event = await EventsDAO.getEventById(eventId);
			if (!event) throw new ServiceError("EVENT_NOT_FOUND");
			return event;
		} catch (error) {
			throw error;
		}
	}

	static async getEventsByCategory(category: string) {
		try {
			const events = await EventsDAO.getEventsByCategory(category);
			return events;
		} catch (error) {
			throw error;
		}
	}

	static async updateEvent(eventId: string, data: Partial<Event>) {
		try {
			const existing = await EventsDAO.getEventById(eventId);
			if (!existing) throw new ServiceError("EVENT_NOT_FOUND");

			// If the same update is retried → return gracefully (idempotency)
			const isSame = Object.keys(data).every(
				(key) => (existing as any)[key] === (data as any)[key]
			);
			if (isSame) return existing;

			const updated = await EventsDAO.updateEvent(eventId, data);
			if (!updated) throw new ServiceError("INTERNAL_ERROR");
			return updated;
		} catch (error) {
			throw error;
		}
	}

	static async deleteEvent(eventId: string) {
		try {
			const existing = await EventsDAO.getEventById(eventId);
			if (!existing) throw new ServiceError("EVENT_NOT_FOUND");
			await EventsDAO.deleteEvent(eventId);

			// In future this could emit deletion event → cache invalidation, search cleanup, etc.
			return { deleted: true };
		} catch (error) {
			throw error;
		}
	}
}
