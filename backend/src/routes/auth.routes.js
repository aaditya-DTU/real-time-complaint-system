import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);

export default router;
