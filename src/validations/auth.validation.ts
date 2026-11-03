import { z } from "zod";

// Schema for User Registration validation
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  mobile: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().optional().default("EMPLOYEE"),
});

// Schema for User Login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});
