import express from "express";
import { UsersController } from "../controllers/index.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, UsersController.getProfile);
router.post("/update", authMiddleware, UsersController.updateUser);

export default router;
