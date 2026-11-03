import { Router } from "express";
import {
  getPurchases,
  getPurchase,
  addPurchase,
  editPurchase,
  removePurchase,
} from "../controllers/purchase.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public: View all purchase orders or single PO
router.get("/", getPurchases);
router.get("/:id", getPurchase);

// Protected: Create, Edit, Delete purchase orders (Requires Bearer Token)
router.post("/", authenticate, addPurchase);
router.put("/:id", authenticate, editPurchase);
router.delete("/:id", authenticate, removePurchase);

export default router;

