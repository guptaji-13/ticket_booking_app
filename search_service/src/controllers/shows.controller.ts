import type { Request, Response } from "express";
import { ShowsService } from "../services/shows.service.js";

export class ShowsController {
	static async health(_req: Request, res: Response) {
		return res.status(200).json({ ok: true });
	}

	static async indexShow(req: Request, res: Response) {
		try {
			await ShowsService.indexShow(req.body);
			return res.status(200).json({ ok: true });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to index show" });
		}
	}

	static async bulkIndex(req: Request, res: Response) {
		try {
			await ShowsService.bulkIndex(req.body?.docs || []);
			return res.status(200).json({ ok: true, count: (req.body?.docs || []).length });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to index show" });
		}
	}

	static async deleteShow(req: Request, res: Response) {
		try {
			const showId = req.params.showId;
			if (!showId) throw Error("show id is required");
			await ShowsService.deleteShow(showId);
			return res.status(200).json({ ok: true });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to delete show" });
		}
	}

	static async searchShows(req: Request, res: Response) {
		try {
			const {
				q,
				city,
				category,
				language,
				minPrice,
				maxPrice,
				from,
				size,
				sortBy,
				sortOrder,
			} = req.query;

			const params = {
				...(q ? { q: String(q) } : {}),
				...(city ? { city: String(city) } : {}),
				...(category ? { category: String(category) } : {}),
				...(language ? { language: String(language) } : {}),
				...(minPrice ? { minPrice: Number(minPrice) } : {}),
				...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
				from: from ? Number(from) : 0,
				size: size ? Number(size) : 20,
				sortBy: (sortBy as "start_timestamp" | "price_min") ?? "start_timestamp",
				sortOrder: (sortOrder as "asc" | "desc") ?? "asc",
			};

			const results = await ShowsService.searchShows(params);
			return res.status(200).json({ results });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to search show" });
		}
	}

	static async listEventsByCity(req: Request, res: Response) {
		try {
			const { city, from, size } = req.query as any;
			if (!city) return res.status(400).json({ error: "city is required" });
			const results = await ShowsService.listEventsByCity(
				city,
				Number(from || 0),
				Number(size || 20)
			);
			return res.status(200).json({ results });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to fetch events" });
		}
	}

	static async updateEventFields(req: Request, res: Response) {
		try {
			const { eventId } = req.params;
			if (!eventId) throw Error("event id is required");
			await ShowsService.updateEventFields(eventId, req.body || {});
			return res.status(200).json({ ok: true });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: "Failed to update event" });
		}
	}
}
