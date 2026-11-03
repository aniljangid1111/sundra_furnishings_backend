import { Router } from "express";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  resetPassword,
  removeUser,
} from "../controllers/user.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Authenticated users can view users list and details
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUser);

// Strict Admin Only: Only Administrators can create, edit, reset passwords, or delete users
router.post("/", authenticate, requireAdmin, addUser);
router.put("/:id", authenticate, requireAdmin, editUser);
router.post("/:id/reset-password", authenticate, requireAdmin, resetPassword);
router.delete("/:id", authenticate, requireAdmin, removeUser);

export default router;
