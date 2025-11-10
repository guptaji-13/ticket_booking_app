import { PaymentsController } from "../controllers/index.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/initiate", authMiddleware, PaymentsController.initiatePayment);
router.get("/check", authMiddleware, PaymentsController.checkPaymentStatus);

export default router;
