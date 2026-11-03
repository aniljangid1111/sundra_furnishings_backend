import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Middleware to protect routes and verify JWT token
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Middleware to authorize specific role
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }
    next();
  };
};

// Middleware to authorize Administrators only
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "Administrator")
  ) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Only Administrators have permission to perform this action.",
    });
  }
  next();
};

