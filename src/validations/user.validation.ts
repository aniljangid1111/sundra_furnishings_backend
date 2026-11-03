import { z } from "zod";

// Create user account schema
export const createUserSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  mobile: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().optional().default("role-admin"),
  role: z.string().optional(), // Auto-resolved from roleId if omitted
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  avatarBg: z.string().optional(),
  requirePasswordChange: z.boolean().default(false),
});

// Update user account schema
export const updateUserSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").trim().optional(),
  email: z.string().email("Invalid email address").trim().toLowerCase().optional(),
  mobile: z.string().optional(),
  roleId: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  avatarBg: z.string().optional(),
  requirePasswordChange: z.boolean().optional(),
});

// Admin reset password schema
export const resetUserPasswordSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  requireChangeOnLogin: z.boolean().default(true).optional(),
});

