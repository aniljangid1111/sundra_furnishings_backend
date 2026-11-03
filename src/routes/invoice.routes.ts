import { Router } from "express";
import {
  getInvoices,
  getInvoice,
  addInvoice,
  editInvoice,
  removeInvoice,
} from "../controllers/invoice.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public: View all invoices or single invoice
router.get("/", getInvoices);
router.get("/:id", getInvoice);

// Protected: Create, Edit, Delete invoices (Requires Bearer Token)
router.post("/", authenticate, addInvoice);
router.put("/:id", authenticate, editInvoice);
router.delete("/:id", authenticate, removeInvoice);

export default router;

