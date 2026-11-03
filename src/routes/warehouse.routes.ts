import { Router } from "express";
import {
  getWarehouses,
  getWarehouse,
  addWarehouse,
  editWarehouse,
  removeWarehouse,
} from "../controllers/warehouse.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public: View all warehouses or single warehouse
router.get("/", getWarehouses);
router.get("/:id", getWarehouse);

// Protected: Create, Edit, Delete warehouses (Requires Bearer Token)
router.post("/", authenticate, addWarehouse);
router.put("/:id", authenticate, editWarehouse);
router.delete("/:id", authenticate, removeWarehouse);

export default router;

