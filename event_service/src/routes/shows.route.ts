import express from "express";
import { ShowsController } from "../controllers/index.controller.js";

const router = express.Router();

// api/shows/*
router.post("/", ShowsController.createShow);
router.get("/:showId", ShowsController.getShowById);
router.get("/:showId/seats", ShowsController.getSeatsLayoutByShowId);
router.put("/:showId/seats", ShowsController.updateSeatsForShow);
router.put("/:showId/reserve", ShowsController.reserveSeats);

export default router;
