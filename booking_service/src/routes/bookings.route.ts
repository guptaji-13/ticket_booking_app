import { BookingsController } from "../controllers/index.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/seats/:showId", authMiddleware, BookingsController.getSeatLayoutByShowId);
router.post("/reserve", authMiddleware, BookingsController.initiateBooking);
router.get("/my-bookings", authMiddleware, BookingsController.getUserBookings);
router.get("/my-bookings/:id", authMiddleware, BookingsController.getBookingById);

export default router;
