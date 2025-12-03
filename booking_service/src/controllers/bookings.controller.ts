import { BookingsService } from "../services/index.service.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ServiceError } from "../utils/error.util.js";

export class BookingsController {
	static async initiateBooking(req: any, res: any) {
		try {
			const userId = req.user.id;
			const { bookingKey, showId, seatIds } = req.body;
			const booking = await BookingsService.createBooking({
				userId,
				bookingKey,
				showId,
				seatIds,
			});
			return ApiResponse.success(res, booking);
		} catch (error) {
			console.error("Error in initiateBooking:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to initiate booking", error);
		}
	}

	static async getUserBookings(req: any, res: any) {
		try {
			const userId = req.user.id;
			const bookings = await BookingsService.getBookingsByUserId(userId);
			return ApiResponse.success(res, bookings);
		} catch (error) {
			console.error("Error in getUserBookings:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to retrieve user bookings", error);
		}
	}

	static async getBookingById(req: any, res: any) {
		try {
			const bookingId = req.params.id;
			const booking = await BookingsService.getBookingById(bookingId);
			return ApiResponse.success(res, booking);
		} catch (error) {
			console.error("Error in getBookingById:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to retrieve booking", error);
		}
	}

	static async getSeatLayoutByShowId(req: any, res: any) {
		try {
			const showId = req.params.showId;
			const seatLayout = await BookingsService.getSeatLayoutByShowId(showId);
			return ApiResponse.success(res, seatLayout);
		} catch (error) {
			console.error("Error in getSeatLayoutByShowId:", error);
			if (error instanceof ServiceError) {
				return ApiResponse.errorFromCode(res, error.code, error);
			}
			return ApiResponse.error(res, "Failed to retrieve seat layout", error);
		}
	}
}
