import { z } from "zod";

// Create product validation schema
export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").trim(),
  sku: z.string().min(2, "Product SKU must be at least 2 characters").toUpperCase().trim(),
  categoryId: z.number().int().positive().optional().nullable(),
  uom: z.string().optional().default("PCS"),
  costPrice: z.number().min(0, "Cost price cannot be negative").default(0),
  sellingPrice: z.number().min(0, "Selling price cannot be negative").default(0),
  stock: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(10),
  taxRate: z.number().min(0).max(100).default(8.25),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  imageUrl: z.string().nullable().optional(),
  salesChannels: z.array(z.string()).optional().default([]),
});

// Update product validation schema
export const updateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").trim().optional(),
  sku: z.string().min(2, "Product SKU must be at least 2 characters").toUpperCase().trim().optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  uom: z.string().optional(),
  costPrice: z.number().min(0, "Cost price cannot be negative").optional(),
  sellingPrice: z.number().min(0, "Selling price cannot be negative").optional(),
  stock: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  imageUrl: z.string().nullable().optional(),
  salesChannels: z.array(z.string()).optional(),
});

