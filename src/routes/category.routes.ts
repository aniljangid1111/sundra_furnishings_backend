import { Router } from "express";
import {
  getCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public: View all categories or single category
router.get("/", getCategories);
router.get("/:id", getCategory);

// Protected: Create, Edit, Delete categories (Requires Bearer Token)
router.post("/", authenticate, addCategory);
router.put("/:id", authenticate, editCategory);
router.delete("/:id", authenticate, removeCategory);

export default router;

