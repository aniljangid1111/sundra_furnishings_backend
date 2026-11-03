import { z } from "zod";

// Create warehouse validation schema
export const createWarehouseSchema = z.object({
  warehouseCode: z.string().min(2, "Warehouse code must be at least 2 characters").toUpperCase().trim(),
  name: z.string().min(2, "Warehouse name must be at least 2 characters").trim(),
  address: z.string().min(2, "Address is required").trim(),
  city: z.string().min(2, "City is required").trim(),
  state: z.string().min(2, "State is required").trim(),
  postalCode: z.string().min(2, "Postal code is required").trim(),
  country: z.string().optional().default("United States"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  notes: z.string().optional().default(""),
});

// Update warehouse validation schema
export const updateWarehouseSchema = z.object({
  warehouseCode: z.string().min(2).toUpperCase().trim().optional(),
  name: z.string().min(2).trim().optional(),
  address: z.string().min(2).trim().optional(),
  city: z.string().min(2).trim().optional(),
  state: z.string().min(2).trim().optional(),
  postalCode: z.string().min(2).trim().optional(),
  country: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  notes: z.string().optional(),
});

