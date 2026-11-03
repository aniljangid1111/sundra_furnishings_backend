import { Router } from "express";
import {
  getRoles,
  getRole,
  addRole,
  editRole,
  removeRole,
} from "../controllers/role.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public: View roles list and single role
router.get("/", authenticate, getRoles);
router.get("/:id", authenticate, getRole);

// Strict Admin Only: Only Administrators can create, edit, or delete roles
router.post("/", authenticate, requireAdmin, addRole);
router.put("/:id", authenticate, requireAdmin, editRole);
router.delete("/:id", authenticate, requireAdmin, removeRole);

export default router;
