import { z } from "zod";

// Granular CRUD permissions for a system module
export const moduleCrudSchema = z.object({
  canView: z.boolean().default(false),
  canCreate: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
});

// Create role validation schema
export const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").trim(),
  code: z.string().min(2, "Role code must be at least 2 characters").trim().toUpperCase().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  modules: z.array(z.string()).default([]),
  permissions: z.record(z.string(), moduleCrudSchema).default({}),
});

// Update role validation schema
export const updateRoleSchema = createRoleSchema.partial();

