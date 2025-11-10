import { v7 as uuidv7 } from "uuid";

import { VenuesDAO } from "../dao/index.dao.js";

export class VenueServices {
	static async createVenue(data: any) {
		try {
			const { name, city, address, totalScreens, metadata } = data;
			const newVenue = await VenuesDAO.createVenue({
				venue_id: uuidv7(),
				name,
				city,
				address,
				total_screens: totalScreens,
				metadata,
				created_at: new Date(),
				updated_at: new Date(),
			});
			return newVenue;
		} catch (error) {
			throw error;
		}
	}

	static async getAllVenues() {
		try {
			const result = await VenuesDAO.getAllVenues();
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async getVenueById(venueId: string) {
		try {
			const result = await VenuesDAO.getVenueById(venueId);
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async updateVenue(venueId: string, data: any) {
		try {
			const result = await VenuesDAO.updateVenue(venueId, data);
			return result;
		} catch (error) {
			throw error;
		}
	}
}
