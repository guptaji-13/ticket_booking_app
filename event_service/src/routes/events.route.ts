import express from "express";
import { EventsController } from "../controllers/index.controller.js";

const router = express.Router();

// api/events/*
router.get("/details/:id", EventsController.getEventsById);
router.post("/", EventsController.createEvent);

export default router;
