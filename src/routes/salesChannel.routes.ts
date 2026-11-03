import { Router } from "express";
import {
  getSalesChannels,
  getSalesChannel,
  addSalesChannel,
  editSalesChannel,
  removeSalesChannel,
} from "../controllers/salesChannel.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes: View sales channels
router.get("/", getSalesChannels);
router.get("/:id", getSalesChannel);

// Protected routes (Admin Only): Create, Edit, Delete
router.post("/", authenticate, requireAdmin, addSalesChannel);
router.put("/:id", authenticate, requireAdmin, editSalesChannel);
router.delete("/:id", authenticate, requireAdmin, removeSalesChannel);

export default router;

