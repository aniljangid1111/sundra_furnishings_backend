import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validations/role.validation";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../services/role.service";

// @route   GET /api/roles
// @desc    Retrieve all system roles with dynamic assigned user counts, pagination, and KPI summary
// @access  Public
export const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, search } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllRoles(
      {
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.roles,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/roles/:id
// @desc    Retrieve a single role by ID
// @access  Public
export const getRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const role = await getRoleById(id);

    res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/roles
// @desc    Create a new custom user role with module permissions
// @access  Private (Requires Bearer Token)
export const addRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createRoleSchema.parse(req.body);
    const role = await createRole(validatedData);

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/roles/:id
// @desc    Update an existing role or its granular module permissions
// @access  Private (Requires Bearer Token)
export const editRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const validatedData = updateRoleSchema.parse(req.body);
    const role = await updateRole(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/roles/:id
// @desc    Delete a custom role
// @access  Private (Requires Bearer Token)
export const removeRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    const result = await deleteRole(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error) {
    next(error);
  }
};

