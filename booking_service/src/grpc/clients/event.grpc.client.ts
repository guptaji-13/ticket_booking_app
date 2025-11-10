import eventClient from "../eventClient.js";
import { base64ToJson } from "../../utils/base64Convertor.util.js";

export class EventGrpcClient {
	static async getSeatLayout(showId: string) {
		return new Promise((resolve, reject) => {
			eventClient.GetSeatLayout({ showId }, (err: any, response: any) => {
				if (err) return reject(err);
				const json = base64ToJson(response.layoutJson);
				response.layoutJson = json;
				resolve(response);
			});
		});
	}

	static async verifySeats(showId: string, seatIds: string[]) {
		return new Promise((resolve, reject) => {
			eventClient.CheckSeatAvailability({ showId, seatIds }, (err: any, response: any) => {
				if (err) return reject(err);
				resolve(response);
			});
		});
	}

	static async reserveSeats(showId: string, seatIds: string[], ttl: number) {
		return new Promise((resolve, reject) => {
			eventClient.ReserveSeats({ showId, seatIds, ttl }, (err: any, response: any) => {
				if (err) return reject(err);
				resolve(response);
			});
		});
	}

	static async updateSeatsStatus(showId: string, seatIds: string[], status: string) {
		return new Promise((resolve, reject) => {
			const updates = [];
			for (const seatId of seatIds) {
				updates.push({ seatId, status });
			}
			eventClient.UpdateSeatStatus({ showId, updates }, (err: any, response: any) => {
				if (err) return reject(err);
				resolve(response);
			});
		});
	}
}
