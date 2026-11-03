import { Router } from "express";
import {
  getInventory,
  getAlerts,
  getLedger,
  postAdjustment,
} from "../controllers/inventory.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes: Inventory overview, Low stock alerts, Stock Ledger
router.get("/", getInventory);
router.get("/alerts", getAlerts);
router.get("/ledger", getLedger);

// Protected route: Stock adjustments (Requires Bearer Token)
router.post("/adjustments", authenticate, postAdjustment);

export default router;

