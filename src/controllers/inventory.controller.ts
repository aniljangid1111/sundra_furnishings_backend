import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import { adjustStockSchema } from "../validations/inventory.validation";
import {
  getInventorySummary,
  getInventoryAlerts,
  getStockLedger,
  adjustStock,
} from "../services/inventory.service";

// @route   GET /api/inventory
// @desc    Retrieve live inventory breakdown with filters, pagination, and KPI summary
// @access  Public
export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { warehouseId, categoryId, status, stockStatus, search } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getInventorySummary(
      {
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        status: status ? String(status) : undefined,
        stockStatus: stockStatus ? String(stockStatus) : undefined,
        search: search ? String(search) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Inventory summary fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/inventory/alerts
// @desc    Retrieve low-stock and out-of-stock items requiring replenishment
// @access  Public
export const getAlerts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const alerts = await getInventoryAlerts();

    res.status(200).json({
      success: true,
      message: "Inventory alerts fetched successfully",
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/inventory/ledger
// @desc    Retrieve stock movement audit ledger history with date filtering and pagination
// @access  Public
export const getLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      productId,
      warehouseId,
      movementType,
      search,
      timeRange,
      startDate,
      endDate,
    } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getStockLedger(
      {
        productId: productId ? Number(productId) : undefined,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        movementType: movementType ? String(movementType) : undefined,
        search: search ? String(search) : undefined,
        timeRange: timeRange ? String(timeRange) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Stock ledger movements fetched successfully",
      pagination: result.pagination,
      data: result.ledger,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/inventory/adjustments
// @desc    Manually adjust product inventory stock with audit ledger logging
// @access  Private (Requires Bearer Token)
export const postAdjustment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = adjustStockSchema.parse(req.body);
    const result = await adjustStock(validatedData);

    res.status(200).json({
      success: true,
      message: "Inventory stock adjusted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

