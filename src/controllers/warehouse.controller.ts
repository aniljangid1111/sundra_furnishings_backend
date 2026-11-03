import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "../validations/warehouse.validation";
import {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../services/warehouse.service";

// @route   GET /api/warehouses
// @desc    Retrieve all warehouse facilities with filters, pagination, and KPI summary
// @access  Public
export const getWarehouses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllWarehouses(
      {
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.warehouses,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/warehouses/:id
// @desc    Retrieve a single warehouse by ID
// @access  Public
export const getWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const warehouse = await getWarehouseById(id);

    res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/warehouses
// @desc    Create a new warehouse facility
// @access  Private (Requires Bearer Token)
export const addWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createWarehouseSchema.parse(req.body);
    const warehouse = await createWarehouse(validatedData);

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/warehouses/:id
// @desc    Update an existing warehouse
// @access  Private (Requires Bearer Token)
export const editWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateWarehouseSchema.parse(req.body);
    const warehouse = await updateWarehouse(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/warehouses/:id
// @desc    Delete a warehouse facility
// @access  Private (Requires Bearer Token)
export const removeWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteWarehouse(id);

    res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

