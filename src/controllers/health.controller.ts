import { Request, Response } from "express";
import { prisma } from "../database/prisma";

// @route   GET /api/health
// @desc    Check API and database health status
// @access  Public
export const healthCheck = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      db: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      db: "not connected",
      message: "Database server is unreachable or offline.",
    });
  }
};
