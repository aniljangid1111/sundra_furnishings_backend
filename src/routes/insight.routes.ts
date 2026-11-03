import { Router } from "express";
import { getInsights, getReport } from "../controllers/insight.controller";

const router = Router();

// Insights & Analytics Overview
router.get("/insights", getInsights);

// Reports Generation
router.get("/reports/:type", getReport);

export default router;

