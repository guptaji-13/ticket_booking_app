import { ShowsService } from "../services/index.service.js";

export class ShowsController {
	static async createShow(req: any, res: any) {
		try {
			const newShow = await ShowsService.createShow(req.body);
			return res.status(200).json(newShow);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to create show" });
		}
	}

	static async getShowById(req: any, res: any) {
		try {
			const { showId } = req.params;
			const show = await ShowsService.getShowById(showId);
			return res.status(200).json(show);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to fetch show" });
		}
	}

	static async getSeatsLayoutByShowId(req: any, res: any) {
		try {
			const { showId } = req.params;
			const seats = await ShowsService.getSeatsLayoutByShowId(showId);
			return res.status(200).json(seats);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to fetch seats" });
		}
	}

	static async updateSeatsForShow(req: any, res: any) {
		try {
			const { showId } = req.params;
			const { snapshotJson } = req.body;
			const seats = await ShowsService.updateSeatsForShow(showId, snapshotJson);
			return res.status(200).json(seats);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to update seats" });
		}
	}

	static async reserveSeats(req: any, res: any) {
		try {
			const { showId } = req.params;
			const { seatIds, ttl } = req.body;
			const success = await ShowsService.reserveSeats(showId, seatIds, ttl);
			return res.status(200).json({ success });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to reserve seats" });
		}
	}
}
