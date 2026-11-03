import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "../validations/purchase.validation";
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../services/purchase.service";

// @route   GET /api/purchases
// @desc    Retrieve all purchase orders with date filters, pagination, and KPI summary
// @access  Public
export const getPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      supplierId,
      warehouseId,
      search,
      timeRange,
      startDate,
      endDate,
    } = req.query;

    const pagination = getPaginationParams(req.query);

    const result = await getAllPurchases(
      {
        status: status ? String(status) : undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
        search: search ? String(search) : undefined,
        timeRange: timeRange ? String(timeRange) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Purchase orders fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.purchases,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/purchases/:id
// @desc    Retrieve a single purchase order by ID
// @access  Public
export const getPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const purchase = await getPurchaseById(id);

    res.status(200).json({
      success: true,
      message: "Purchase order fetched successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/purchases
// @desc    Create a new purchase order (Increments stock if status is RECEIVED)
// @access  Private (Requires Bearer Token)
export const addPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createPurchaseSchema.parse(req.body);
    const purchase = await createPurchase(validatedData);

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/purchases/:id
// @desc    Update purchase order status or details
// @access  Private (Requires Bearer Token)
export const editPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updatePurchaseSchema.parse(req.body);
    const purchase = await updatePurchase(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/purchases/:id
// @desc    Delete a purchase order
// @access  Private (Requires Bearer Token)
export const removePurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deletePurchase(id);

    res.status(200).json({
      success: true,
      message: "Purchase order deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

