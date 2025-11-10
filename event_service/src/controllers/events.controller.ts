import { EventsService } from "../services/index.service.js";

export class EventsController {
	static async createEvent(req: any, res: any) {
		try {
			const event = await EventsService.createEvent(req.body);
			return res.status(200).json(event);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to create event" });
		}
	}

	static async getEventsById(req: any, res: any) {
		const { id } = req.params;
		try {
			const event = await EventsService.getEventById(id);
			return res.status(200).json(event);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to fetch events" });
		}
	}
}
