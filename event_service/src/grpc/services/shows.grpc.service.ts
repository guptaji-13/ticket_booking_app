import { ShowsService } from "../../services/shows.service.js";
import { jsonToBase64 } from "../../utils/base64Convertor.util.js";

export const showsGrpcService = {
	async GetSeatLayout(call: any, callback: any) {
		try {
			const { showId } = call.request;
			const layout = await ShowsService.getSeatsLayoutByShowId(showId);
			const compressed = jsonToBase64(layout.seat_snapshot);
			callback(null, { showId, layoutJson: compressed });
		} catch (err) {
			callback(err, null);
		}
	},

	async CheckSeatAvailability(call: any, callback: any) {
		try {
			const { showId, seatIds } = call.request;
			const seats = await ShowsService.getSeatsStatusForShow(showId, seatIds);
			callback(null, { showId, seats });
		} catch (err) {
			callback(err, null);
		}
	},

	async ReserveSeats(call: any, callback: any) {
		try {
			const { showId, seatIds, ttl } = call.request;
			const success = await ShowsService.reserveSeats(showId, seatIds, ttl);
			callback(null, { success });
		} catch (err) {
			callback(err, null);
		}
	},

	async UpdateSeatStatus(call: any, callback: any) {
		try {
			const { showId, updates } = call.request;
			const success = await ShowsService.updateSeatsStatusForShow(showId, updates);
			callback(null, { success });
		} catch (err) {
			callback(err, null);
		}
	},
};
