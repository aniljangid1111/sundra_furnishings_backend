import { z } from "zod";

// Create supplier validation schema
export const createSupplierSchema = z.object({
  supplierCode: z.string().min(2, "Supplier code must be at least 2 characters").toUpperCase().trim(),
  supplierType: z.enum(["BUSINESS", "INDIVIDUAL"]).optional().default("BUSINESS"),
  companyName: z.string().min(2, "Company name is required").trim(),
  contactPerson: z.string().min(2, "Contact person is required").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z.string().min(5, "Valid phone number is required").trim(),
  alternatePhone: z.string().optional().default(""),
  taxId: z.string().optional().default(""),
  paymentTerms: z.string().optional().default("Net 30"),
  openingBalance: z.number().default(0),
  addressLine1: z.string().min(2, "Address line 1 is required").trim(),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(2, "City is required").trim(),
  state: z.string().min(2, "State is required").trim(),
  postalCode: z.string().min(2, "Postal code is required").trim(),
  country: z.string().optional().default("United States"),
  notes: z.string().optional().default(""),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

// Update supplier validation schema
export const updateSupplierSchema = z.object({
  supplierCode: z.string().min(2).toUpperCase().trim().optional(),
  supplierType: z.enum(["BUSINESS", "INDIVIDUAL"]).optional(),
  companyName: z.string().min(2).trim().optional(),
  contactPerson: z.string().min(2).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().min(5).trim().optional(),
  alternatePhone: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  openingBalance: z.number().optional(),
  addressLine1: z.string().min(2).trim().optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2).trim().optional(),
  state: z.string().min(2).trim().optional(),
  postalCode: z.string().min(2).trim().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

