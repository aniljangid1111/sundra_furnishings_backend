import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createImportSchema,
  updateImportSchema,
} from "../validations/import.validation";
import {
  getAllImports,
  getImportById,
  createImportShipment,
  updateImportShipment,
  deleteImportShipment,
} from "../services/import.service";

// @route   GET /api/imports
// @desc    Retrieve all overseas container shipments with date filters, pagination, and KPI summary
// @access  Public
export const getImports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      warehouseId,
      search,
      timeRange,
      startDate,
      endDate,
    } = req.query;

    const pagination = getPaginationParams(req.query);

    const result = await getAllImports(
      {
        status: status ? String(status) : undefined,
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
      message: "Import shipments fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.shipments,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/imports/:id
// @desc    Retrieve a single import shipment by ID
// @access  Public
export const getImport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import shipment ID",
      });
    }

    const shipment = await getImportById(id);

    res.status(200).json({
      success: true,
      message: "Import shipment fetched successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/imports
// @desc    Create a new container import shipment with landed cost allocation
// @access  Private (Requires Bearer Token)
export const addImport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createImportSchema.parse(req.body);
    const shipment = await createImportShipment(validatedData);

    res.status(201).json({
      success: true,
      message: "Import shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/imports/:id
// @desc    Update import shipment details or additional landed cost expense heads
// @access  Private (Requires Bearer Token)
export const editImport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import shipment ID",
      });
    }

    const validatedData = updateImportSchema.parse(req.body);
    const shipment = await updateImportShipment(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Import shipment updated successfully",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/imports/:id
// @desc    Delete an import shipment
// @access  Private (Requires Bearer Token)
export const removeImport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import shipment ID",
      });
    }

    const result = await deleteImportShipment(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error) {
    next(error);
  }
};

