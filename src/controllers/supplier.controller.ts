import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../validations/supplier.validation";
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplier.service";

// @route   GET /api/suppliers
// @desc    Retrieve all suppliers and vendors with filters, pagination, and KPI summary
// @access  Public
export const getSuppliers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllSuppliers(
      {
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Suppliers fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/suppliers/:id
// @desc    Retrieve a single supplier by ID
// @access  Public
export const getSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const supplier = await getSupplierById(id);

    res.status(200).json({
      success: true,
      message: "Supplier fetched successfully",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/suppliers
// @desc    Create a new supplier / vendor
// @access  Private (Requires Bearer Token)
export const addSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createSupplierSchema.parse(req.body);
    const supplier = await createSupplier(validatedData);

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/suppliers/:id
// @desc    Update an existing supplier
// @access  Private (Requires Bearer Token)
export const editSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateSupplierSchema.parse(req.body);
    const supplier = await updateSupplier(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Private (Requires Bearer Token)
export const removeSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteSupplier(id);

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

