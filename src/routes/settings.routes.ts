import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadLogoMiddleware } from "../middleware/upload.middleware";

const router = Router();

// Public: Retrieve business settings and tax configuration
router.get("/", getSettings);

// Protected: Update company profile, policies, and/or upload logo directly
router.put("/", authenticate, uploadLogoMiddleware, updateSettings);

export default router;
