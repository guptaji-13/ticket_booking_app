import { showsMapper } from "../db/cassandraClient.js";
import type { Show } from "../models/index.model.js";

export class ShowsDAO {
	static async createShow(data: Show): Promise<Show | null> {
		try {
			const result = await showsMapper.insert(data);
			return result.wasApplied() ? data : null;
		} catch (error) {
			throw error;
		}
	}

	static async getAllShows(): Promise<Show[]> {
		try {
			const result = await showsMapper.find({}, { orderBy: { show_id: "desc" } });
			return result.toArray();
		} catch (error) {
			throw error;
		}
	}

	static async getShowById(showId: string): Promise<Show | null> {
		try {
			const result = await showsMapper.get({ show_id: showId });
			return result;
		} catch (error) {
			throw error;
		}
	}

	static async updateShowStatus(showId: string, data: Partial<Show>): Promise<boolean> {
		try {
			const result = await showsMapper.update({
				show_id: showId,
				...data,
				last_updated: new Date(),
			});
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}

	static async deleteShow(showId: string): Promise<boolean> {
		try {
			const result = await showsMapper.remove({ show_id: showId });
			return result.wasApplied();
		} catch (error) {
			throw error;
		}
	}
}
