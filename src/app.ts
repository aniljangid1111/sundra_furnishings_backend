import express from "express";
import cors from "cors";

import { router } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

export const app = express();

// Disable express ETag caching
app.set("etag", false);

// Global anti-caching middleware so database updates reflect immediately without stale cache
app.use((_req, res, next) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  });
  next();
});

const allowedOrigins =
  env.CORS_ORIGIN === "*"
    ? "*"
    : env.CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins === "*" ||
        (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin))
      ) {
        return callback(null, true);
      }
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root health & info endpoints (handles Vercel rewrite or direct hit)
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Sundara Furnishings ERP Backend API is live",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", router);

// Direct /health fallback
app.use(router);

app.use(notFound);
app.use(errorHandler);

export default app;
