import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  getDashboardInsights,
  getFinancialReports,
} from "../services/insight.service";

// @route   GET /api/insights
// @desc    Retrieve live dashboard KPI metrics, trends, channel share, and top products
// @access  Public
export const getInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { timeRange, startDate, endDate } = req.query;

    const data = await getDashboardInsights({
      timeRange: timeRange ? String(timeRange) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Dashboard business insights fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/reports/:type
// @desc    Retrieve structured business reports (sales, purchases, profit-loss, inventory, tax) with pagination
// @access  Public
export const getReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = String(req.params.type);
    const pagination = getPaginationParams(req.query);
    const result = await getFinancialReports(type, req.query, pagination);

    res.status(200).json({
      success: true,
      message: `${type.toUpperCase()} report generated successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

