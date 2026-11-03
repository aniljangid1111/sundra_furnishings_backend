import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadProductImageMiddleware } from "../middleware/upload.middleware";

const router = Router();

// Public: View products catalogue or single product
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected: Create product with image upload to sundara/products
router.post("/", authenticate, uploadProductImageMiddleware, addProduct);

// Protected: Update product (Replaces image & deletes old from Cloudinary)
router.put("/:id", authenticate, uploadProductImageMiddleware, editProduct);

// Protected: Delete product (Cleans up image from Cloudinary)
router.delete("/:id", authenticate, removeProduct);

export default router;

