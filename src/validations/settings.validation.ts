import { z } from "zod";

// Tax slab validation schema
export const taxSlabSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tax slab name is required"),
  rate: z.number().min(0, "Tax rate cannot be negative"),
  isDefault: z.boolean().default(false),
  taxCode: z.string().optional(),
  description: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

// Payment term validation schema
export const paymentTermSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Payment term name is required"),
  days: z.number().int().min(0, "Payment days must be positive"),
  description: z.string().optional().default(""),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Update settings request validation schema
export const updateSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required").optional(),
  corporateName: z.string().optional(),
  ein: z.string().optional(),
  salesTaxPermit: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid billing email address").optional(),
  logoUrl: z.string().nullable().optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  taxCalculationMode: z.enum(["EXCLUSIVE", "INCLUSIVE"]).optional(),
  taxLabel: z.string().optional(),
  taxSlabs: z.array(taxSlabSchema).optional(),
  paymentTerms: z.array(paymentTermSchema).optional(),
});

