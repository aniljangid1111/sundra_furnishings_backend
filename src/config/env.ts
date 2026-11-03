import "dotenv/config";
import { z } from "zod";

// Schema for environment variables validation
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().default("sundara_billing_secure_jwt_secret_key_2026_us_standard"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().optional().default("*"),

  // Cloudinary credentials
  CLOUDINARY_CLOUD_NAME: z.string().default("nu6eolpm"),
  CLOUDINARY_API_KEY: z.string().default("861818668157252"),
  CLOUDINARY_API_SECRET: z.string().default("rkRQMqQLPTRpxgm0Yj1QFfkH3-k"),
  CLOUDINARY_FOLDER: z.string().default("sundara"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  console.error("❌ Invalid environment variables:", errors);
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error(`Missing required environment variables: ${JSON.stringify(errors)}`);
  }
  process.exit(1);
}

export const env = parsedEnv.data;
