import { esClient } from "../db/elasticSearchClient.js";
import { SHOWS_INDEX } from "../db/index/mappings.js";
import type { Show } from "../models/shows.model.js";

export class ShowsDAO {
	static async ensureIndex(mapping: object): Promise<void> {
		try {
			const exists = await esClient.indices.exists({ index: SHOWS_INDEX });
			if (!exists) {
				await esClient.indices.create({
					index: SHOWS_INDEX,
					...mapping,
				});
			}
		} catch (error) {
			throw error;
		}
	}

	static async indexShow(doc: Show) {
		try {
			await esClient.index({
				index: SHOWS_INDEX,
				id: doc.show_id,
				document: doc,
				refresh: "wait_for",
			});
		} catch (error) {
			throw error;
		}
	}

	static async deleteShow(showId: string) {
		try {
			await esClient.delete({
				index: SHOWS_INDEX,
				id: showId,
				// ignore: [404],
				refresh: "wait_for",
			});
		} catch (error) {
			throw error;
		}
	}

	static async bulkIndex(docs: Show[]) {
		try {
			if (!docs.length) return;
			const body = docs.flatMap((d) => [
				{ index: { _index: SHOWS_INDEX, _id: d.show_id } },
				d,
			]);
			const res = await esClient.bulk({ refresh: "wait_for", operations: body });
			if (res.errors) {
				const items = res.items?.filter((i) => (i as any).index?.error);
				throw new Error(`Bulk index had errors: ${JSON.stringify(items?.slice(0, 3))}`);
			}
		} catch (error) {
			throw error;
		}
	}

	/** list shows (not collapsed) with simple filters */
	static async searchShows(params: {
		q?: string;
		city?: string;
		category?: string;
		language?: string;
		minPrice?: number;
		maxPrice?: number;
		from?: number;
		size?: number;
		sortBy?: "start_timestamp" | "price_min";
		sortOrder?: "asc" | "desc";
	}) {
		try {
			const {
				q,
				city,
				category,
				language,
				minPrice,
				maxPrice,
				from = 0,
				size = 20,
				sortBy = "start_timestamp",
				sortOrder = "asc",
			} = params;

			const must: any[] = [];
			const filter: any[] = [];

			if (q)
				must.push({
					multi_match: {
						query: q,
						fields: ["event_title^3", "event_description", "event_metadata.artists"],
					},
				});
			if (city) filter.push({ term: { venue_city: city.toLowerCase() } });
			if (category) filter.push({ term: { event_category: category } });
			if (language) filter.push({ term: { show_language: language } });
			if (minPrice != null || maxPrice != null) {
				const range: any = {};
				if (minPrice != null) range.gte = minPrice;
				if (maxPrice != null) range.lte = maxPrice;
				filter.push({ range: { price_min: range } });
			}

			const query = { bool: { must: must.length ? must : [{ match_all: {} }], filter } };

			const res = await esClient.search({
				index: SHOWS_INDEX,
				from,
				size,
				query,
				sort: [{ [sortBy]: sortOrder }],
			});

			return res.hits.hits.map((h) => h._source);
		} catch (error) {
			throw error;
		}
	}

	/** list distinct events in a city using collapse */
	static async listEventsByCity(city: string, from = 0, size = 20) {
		try {
			const res = await esClient.search({
				index: SHOWS_INDEX,
				from,
				size,
				query: { term: { venue_city: city.toLowerCase() } },
				collapse: { field: "event_id" },
				sort: [{ start_timestamp: "asc" }],
			});
			return res.hits.hits.map((h) => h._source);
		} catch (error) {
			throw error;
		}
	}

	/** update all shows for an event (e.g., event_title change) */
	static async updateEventFields(eventId: string, partial: Partial<Show>) {
		try {
			const scriptParts: string[] = [];
			const params: Record<string, any> = {};

			Object.entries(partial).forEach(([k, v]) => {
				scriptParts.push(`ctx._source['${k}']=params['${k}'];`);
				params[k] = v;
			});

			await esClient.updateByQuery({
				index: SHOWS_INDEX,
				conflicts: "proceed",
				refresh: true,
				query: { term: { event_id: eventId } },
				script: { source: scriptParts.join(" "), lang: "painless", params },
			});
		} catch (error) {
			throw error;
		}
	}
}
