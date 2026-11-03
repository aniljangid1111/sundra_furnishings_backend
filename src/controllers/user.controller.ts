import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createUserSchema,
  updateUserSchema,
  resetUserPasswordSchema,
} from "../validations/user.validation";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../services/user.service";

// @route   GET /api/users
// @desc    Retrieve all platform users with role details, pagination, and KPI summary
// @access  Public
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleId, status, search } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllUsers(
      {
        roleId: roleId ? String(roleId) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.users,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:id
// @desc    Retrieve a single user by ID
// @access  Public
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await getUserById(id);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users
// @desc    Create a new user account with Argon2 encryption
// @access  Private (Requires Bearer Token)
export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await createUser(validatedData);

    res.status(201).json({
      success: true,
      message: "User account created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/:id
// @desc    Update an existing user account or assigned role
// @access  Private (Requires Bearer Token)
export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const validatedData = updateUserSchema.parse(req.body);
    const user = await updateUser(id, validatedData);

    res.status(200).json({
      success: true,
      message: "User account updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/:id/reset-password
// @desc    Reset password for a user by Administrator
// @access  Private (Requires Bearer Token)
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const validatedData = resetUserPasswordSchema.parse(req.body);
    const result = await resetUserPassword(
      id,
      validatedData.newPassword,
      validatedData.requireChangeOnLogin
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/users/:id
// @desc    Delete a user account
// @access  Private (Requires Bearer Token)
export const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await deleteUser(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (error) {
    next(error);
  }
};

