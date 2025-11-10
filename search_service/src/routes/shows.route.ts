import express from "express";
// import { EventsController } from "../controllers/index.controller.js";

const router = express.Router();

// api/events/*
import { ShowsController } from "../controllers/shows.controller.js";

router.get("/health", ShowsController.health);

// indexing / admin-ish endpoints
router.post("/show", ShowsController.indexShow);
router.post("/show/bulk", ShowsController.bulkIndex);
router.delete("/show/:showId", ShowsController.deleteShow);
router.post("/event/:eventId", ShowsController.updateEventFields);

// query endpoints
router.get("/shows/search", ShowsController.searchShows);
router.get("/events", ShowsController.listEventsByCity);

export default router;
