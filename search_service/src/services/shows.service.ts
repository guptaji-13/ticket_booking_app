import { ShowsDAO } from "../dao/shows.dao.js";
import type { Show } from "../models/shows.model.js";

export class ShowsService {
	static async indexShow(doc: Show) {
		try {
			// normalize some fields
			if (doc.venue_city) doc.venue_city = doc.venue_city.toLowerCase();
			await ShowsDAO.indexShow(doc);
		} catch (error) {
			throw error;
		}
	}

	static async bulkIndex(docs: Show[]) {
		try {
			docs.forEach((d) => {
				if (d.venue_city) d.venue_city = d.venue_city.toLowerCase();
			});
			await ShowsDAO.bulkIndex(docs);
		} catch (error) {
			throw error;
		}
	}

	static async deleteShow(showId: string) {
		try {
			await ShowsDAO.deleteShow(showId);
		} catch (error) {
			throw error;
		}
	}

	static async searchShows(params: Parameters<typeof ShowsDAO.searchShows>[0]) {
		try {
			if (params.city) params.city = params.city.toLowerCase();
			return ShowsDAO.searchShows(params);
		} catch (error) {
			throw error;
		}
	}

	static async listEventsByCity(city: string, from = 0, size = 20) {
		try {
			return ShowsDAO.listEventsByCity(city.toLowerCase(), from, size);
		} catch (error) {
			throw error;
		}
	}

	static async updateEventFields(eventId: string, partial: Partial<Show>) {
		try {
			return ShowsDAO.updateEventFields(eventId, partial);
		} catch (error) {
			throw error;
		}
	}
}
