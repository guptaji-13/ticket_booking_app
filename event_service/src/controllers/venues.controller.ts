import { VenueServices } from "../services/index.service.js";

export class VenuesController {
	static async createVenue(req: any, res: any) {
		try {
			const venue = await VenueServices.createVenue(req.body);
			return res.status(200).json(venue);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to create venue" });
		}
	}

	static async getVenueById(req: any, res: any) {
		const { venueId } = req.params;
		try {
			const venue = await VenueServices.getVenueById(venueId);
			return res.status(200).json(venue);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to fetch venues" });
		}
	}
}
