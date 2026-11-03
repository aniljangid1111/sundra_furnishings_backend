import { Router } from "express";

import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import settingsRoutes from "./settings.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import warehouseRoutes from "./warehouse.routes";
import supplierRoutes from "./supplier.routes";
import purchaseRoutes from "./purchase.routes";
import invoiceRoutes from "./invoice.routes";
import roleRoutes from "./role.routes";
import userRoutes from "./user.routes";
import salesChannelRoutes from "./salesChannel.routes";
import inventoryRoutes from "./inventory.routes";
import importRoutes from "./import.routes";
import insightRoutes from "./insight.routes";

export const router = Router();

router.use(healthRoutes);
router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/sales-channels", salesChannelRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/imports", importRoutes);
router.use(insightRoutes);
