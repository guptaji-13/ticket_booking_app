import express from "express";
import { AuthController } from "../controllers/index.controller.js";

const router = express.Router();

// api/auth/*
router.get("/login/request-otp", AuthController.requestOtp);
router.post("/login/otp-verify", AuthController.verifyOtp);
router.get("/refresh", AuthController.createAccessTokenFromRefreshToken);
router.get("/logout", AuthController.logout);

export default router;
