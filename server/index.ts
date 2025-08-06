import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import crypto from "node:crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import { pool } from "./db";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty", options: { colorize: true } } : undefined,
});

// Masked preview of DATABASE_URL to validate env load (first 20 chars only)
if (process.env.DATABASE_URL) {
  const prev = process.env.DATABASE_URL.slice(0, 20);
  logger.info({ db: `${prev}...` }, "DATABASE_URL detected");
} else {
  logger.warn("DATABASE_URL not found in process.env; ensure server/.env or .env is configured");
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Correlation ID middleware
app.use((req, res, next) => {
  const headerId = req.headers["x-request-id"];
  const id = typeof headerId === "string" && headerId.trim() !== "" ? headerId : crypto.randomUUID();
  (req as any).requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// Structured logging
app.use(
  pinoHttp({
    logger,
    customProps: (req, res) => ({
      requestId: (req as any).requestId,
      route: req.url,
      statusCode: res.statusCode,
    }),
    customLogLevel: function (_req, res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

// Health endpoints
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/readyz", async (_req, res) => {
  try {
    // lightweight readiness check
    const r = await pool.query("select 1");
    res.status(200).json({ status: "ready", db: r.rowCount === 1 ? "ok" : "degraded" });
  } catch (e: any) {
    res.status(503).json({ status: "not_ready", error: e?.message ?? "db error" });
  }
});

// Register application routes
(async () => {
  const server = await registerRoutes(app);

  // Centralized error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = Number(err.status || err.statusCode || 500);
    const code = err.code || "INTERNAL_ERROR";
    const message = err.publicMessage || err.message || "Internal Server Error";
    const requestId = (req as any).requestId;

    // log full error with stack
    (req as any).log?.error({ err, requestId, code, status }, "request failed");

    res.status(status).json({
      code,
      message,
      requestId,
    });
  });

  // Vite/static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(
    {
      port,
      host: "localhost",
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
