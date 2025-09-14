import "./configs/env";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./configs/index";
import { sequelize } from "./configs/database";
import authRouter from "./routers/auth.router";
import { setupLogging } from "./configs/logger";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
// Logging middleware
setupLogging(app);
// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/v1/health", async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: "ok",
      db: "ok",
      env: config.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "fail",
      db: "error",
      env: config.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use("/api/v1/auth", authRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((error: Error, _req: Request, res: Response, _next: any) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
