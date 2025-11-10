import express from "express";
import { VenuesController } from "../controllers/index.controller.js";

const router = express.Router();

// api/venues/*
router.post("/", VenuesController.createVenue);
router.get("/:venueId", VenuesController.getVenueById);

export default router;
