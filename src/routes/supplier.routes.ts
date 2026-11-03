import { Router } from "express";
import {
  getSuppliers,
  getSupplier,
  addSupplier,
  editSupplier,
  removeSupplier,
} from "../controllers/supplier.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public: View all suppliers or single supplier
router.get("/", getSuppliers);
router.get("/:id", getSupplier);

// Protected: Create, Edit, Delete suppliers (Requires Bearer Token)
router.post("/", authenticate, addSupplier);
router.put("/:id", authenticate, editSupplier);
router.delete("/:id", authenticate, removeSupplier);

export default router;

