import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

import authRoutes from "./routes/auth.routes";
import invoiceRoutes from "./routes/invoice.routes";
import dashboardRoutes from "./routes/dashboard.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin:
        env.CORS_ORIGIN === "*"
          ? true
          : env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/invoices", invoiceRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
