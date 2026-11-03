import { z } from "zod";

// Manual stock adjustment schema
export const adjustStockSchema = z.object({
  productId: z.number().int().positive("Valid Product ID is required"),
  warehouseId: z.number().int().positive().optional().default(1),
  action: z.enum(["ADD", "DEDUCT", "SET"]),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  reason: z.string().optional(),
  referenceDocument: z.string().optional(),
});

