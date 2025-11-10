import { venueMapper } from "../db/cassandraClient.js";
import type { Venue } from "../models/index.model.js";
import { jsonToBase64, base64ToJson } from "../utils/base64Convertor.util.js";

export class VenuesDAO {
	static async createVenue(data: Venue): Promise<Venue | null> {
		try {
			const compressed = data?.metadata ? jsonToBase64(data.metadata) : null;
			const result = await venueMapper.insert({ ...data, metadata: compressed });
			return result.wasApplied() ? data : null;
		} catch (error) {
			throw error;
		}
	}

	static async getAllVenues(): Promise<Venue[]> {
		try {
			const result = await venueMapper.find({}, { orderBy: { venue_id: "asc" } });
			const venues = result.toArray();
			for (const venue of venues) {
				if (venue?.metadata) {
					venue.metadata = base64ToJson(venue.metadata);
				}
			}
			return venues;
		} catch (error) {
			throw error;
		}
	}

	static async getVenueById(venueId: string): Promise<Venue | null> {
		try {
			const result = await venueMapper.get({ venue_id: venueId });
			if (result?.metadata) {
				result.metadata = base64ToJson(result.metadata);
			}

			return result;
		} catch (error) {
			throw error;
		}
	}

	static async updateVenue(venueId: string, data: Partial<Venue>): Promise<boolean> {
		try {
			const compressed = data?.metadata ? jsonToBase64(data.metadata) : null;
			const updateModel: Record<string, any> = {
				venue_id: venueId,
				...data,
				updated_at: new Date(),
			};
			if (compressed) updateModel.metadata = compressed;
			const result = await venueMapper.update(updateModel);
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	static async deleteVenue(venueId: string): Promise<boolean> {
		try {
			const result = await venueMapper.remove({ venue_id: venueId });
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}
}
