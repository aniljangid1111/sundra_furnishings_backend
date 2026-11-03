import { z } from "zod";

// Create category validation schema
export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").trim(),
  code: z.string().min(2, "Category code must be at least 2 characters").toUpperCase().trim(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

// Update category validation schema
export const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").trim().optional(),
  code: z.string().min(2, "Category code must be at least 2 characters").toUpperCase().trim().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

