import { BookingsService } from "../services/index.service.js";

export class BookingsController {
	static async initiateBooking(req: any, res: any) {
		try {
			const userId = req.user.id;
			const { bookingKey, eventId, seatIds } = req.body;
			const booking = await BookingsService.createBooking({
				userId,
				bookingKey,
				eventId,
				seatIds,
			});
			return res.status(201).json(booking);
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	static async getUserBookings(req: any, res: any) {
		try {
			const userId = req.user.id;
			const bookings = await BookingsService.getBookingsByUserId(userId);
			return res.json(bookings);
		} catch (error) {
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	static async getBookingById(req: any, res: any) {
		try {
			const bookingId = req.params.id;
			const booking = await BookingsService.getBookingById(bookingId);
			return res.json(booking);
		} catch (error) {
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	static async getSeatLayoutByEventId(req: any, res: any) {
		try {
			const eventId = req.params.eventId;
			const seatLayout = await BookingsService.getSeatLayoutByEventId(eventId);
			return res.json(seatLayout);
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
}
