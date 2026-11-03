import { Router } from "express";
import {
  getImports,
  getImport,
  addImport,
  editImport,
  removeImport,
} from "../controllers/import.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes: View imports list & single shipment
router.get("/", getImports);
router.get("/:id", getImport);

// Protected routes: Create, Edit, Delete import shipments (Requires Bearer Token)
router.post("/", authenticate, addImport);
router.put("/:id", authenticate, editImport);
router.delete("/:id", authenticate, removeImport);

export default router;

