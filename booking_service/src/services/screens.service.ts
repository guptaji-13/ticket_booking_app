import { ScreensDAO } from "../dao/index.dao.js";
import { ServiceError } from "../utils/error.util.js";
import type { Screen } from "../models/index.model.js";

export class ScreensService {
	static async createScreen(payload: Omit<Screen, "id" | "createdAt" | "updatedAt">) {
		try {
			const now = Date.now();
			const screenRecord = await ScreensDAO.createScreen({
				...payload,
				createdAt: now,
				updatedAt: now,
			});
			if (!screenRecord) throw new ServiceError("INTERNAL_ERROR");
			return screenRecord;
		} catch (error) {
			throw error;
		}
	}

	static async getScreenById(screenId: string) {
		try {
			const screen = await ScreensDAO.getScreenById(screenId);
			if (!screen) throw new ServiceError("SCREEN_NOT_FOUND");
			return screen;
		} catch (error) {
			throw error;
		}
	}

	static async updateScreen(screenId: string, data: Partial<Screen>) {
		try {
			const existing = await ScreensDAO.getScreenById(screenId);
			if (!existing) throw new ServiceError("SCREEN_NOT_FOUND");
			// If the same update is retried → return gracefully (idempotency)
			const isSame = Object.keys(data).every(
				(key) => (existing as any)[key] === (data as any)[key]
			);
			if (isSame) return existing;
			const updated = await ScreensDAO.updateScreen(screenId, data);
			if (!updated) throw new ServiceError("INTERNAL_ERROR");
			return updated;
		} catch (error) {
			throw error;
		}
	}

	static async deleteScreen(screenId: string) {
		try {
			const existing = await ScreensDAO.getScreenById(screenId);
			if (!existing) throw new ServiceError("SCREEN_NOT_FOUND");
			await ScreensDAO.deleteScreen(screenId);
			return;
		} catch (error) {
			throw error;
		}
	}
}
