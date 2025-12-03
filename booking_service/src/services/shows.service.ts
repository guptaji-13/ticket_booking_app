import { ScreensDAO, SeatsDAO, ShowsDAO } from "../dao/index.dao.js";
import { db } from "../db/drizzle/index.js";
import { ServiceError } from "../utils/error.util.js";

export class ShowsService {
	static async generateSeatsForShow(
		showId: string,
		screenId: string,
		pricing: Record<string, number>
	) {
		try {
			const screen = await ScreensDAO.getScreenById(screenId);
			if (!screen?.seatLayout) {
				throw new ServiceError("SCREEN_NOT_FOUND");
			}

			const layout = screen.seatLayout;
			const timestamp = Date.now();

			// 1️⃣ Flatten all seats into rows for bulk insert
			const seatInserts: Array<any> = [];

			for (const section of layout.sections) {
				const sectionPrice = pricing[section.name];
				if (!sectionPrice) {
					throw new ServiceError("PRICE_MISSING_FOR_SECTION", {
						cause: section.name,
					});
				}

				for (const row of section.rows) {
					for (const seat of row.seats) {
						if (seat === null) continue;

						seatInserts.push({
							showId,
							name: seat.name,
							section: section.name,
							price: sectionPrice,
							status: "available",
							updatedAt: timestamp,
						});
					}
				}
			}

			await db.transaction(async (txn) => {
				try {
					// 2️⃣ Insert seats & return generated seat IDs
					const insertedSeats = await SeatsDAO.createSeatInBulk(seatInserts, txn);

					// Build lookup index for quick mapping
					const idIndex: Record<string, string> = {};
					for (const seat of insertedSeats) {
						idIndex[`${seat.section}_${seat.name}`] = seat.id;
					}

					// 3️⃣ Build show seatLayout
					const mappedLayout = {
						sections: layout.sections.map((section: any) => ({
							name: section.name,
							price: pricing[section.name],
							rows: section.rows.map((rowObj: any) => ({
								row: rowObj.row,
								seatIds: rowObj.seats.map((seat: string | null) =>
									seat ? idIndex[`${section.name}_${seat}`] : null
								),
							})),
						})),
					};

					// 4️⃣ Update show atomically
					await ShowsDAO.updateShow(showId, { seatLayout: mappedLayout }, txn);
				} catch (error) {
					throw error;
				}
			});
			return true;
		} catch (error) {
			throw error;
		}
	}
}
