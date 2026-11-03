import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// @route   POST /api/auth/register
// @desc    Create a new user account (No session token issued)
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request payload with Zod
    const data = registerSchema.parse(req.body);

    // Create user in database (No token generated)
    const user = await registerUser(
      data.name,
      data.email,
      data.password,
      (data.role as "ADMIN" | "EMPLOYEE") || "EMPLOYEE"
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user credentials & issue JWT session token
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request payload with Zod
    const data = loginSchema.parse(req.body);

    // Authenticate credentials and get JWT token
    const result = await loginUser(data.email, data.password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get currently authenticated user profile
// @access  Private (Requires Bearer JWT Token)
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token missing or invalid.",
      });
    }

    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
