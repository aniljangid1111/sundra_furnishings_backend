import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public auth endpoints
router.post("/register", register);
router.post("/login", login);

// Protected auth endpoints (Requires Bearer Token)
router.get("/me", authenticate, getMe);

export default router;
