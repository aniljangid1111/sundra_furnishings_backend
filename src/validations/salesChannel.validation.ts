import { z } from "zod";

// Create sales channel schema
export const createSalesChannelSchema = z.object({
  name: z.string().min(2, "Channel name must be at least 2 characters").trim(),
  code: z.string().min(2, "Channel code must be at least 2 characters").trim().toUpperCase().optional(),
  type: z.enum(["MARKETPLACE", "OWN_WEBSITE", "RETAIL"]).default("MARKETPLACE"),
  website: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// Update sales channel schema
export const updateSalesChannelSchema = createSalesChannelSchema.partial();

