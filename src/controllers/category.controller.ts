import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";

// @route   GET /api/categories
// @desc    Retrieve all product categories with product count, pagination, and KPI summary
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllCategories(
      {
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.categories,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/categories/:id
// @desc    Retrieve a single category by ID
// @access  Public
export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const category = await getCategoryById(id);

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/categories
// @desc    Create a new product category
// @access  Private (Requires Bearer Token)
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await createCategory(validatedData);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/categories/:id
// @desc    Update an existing category
// @access  Private (Requires Bearer Token)
export const editCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await updateCategory(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Requires Bearer Token)
export const removeCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
