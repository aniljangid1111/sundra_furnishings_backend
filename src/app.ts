import express from "express";
import cors from "cors";

import { router } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

export const app = express();

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

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;
