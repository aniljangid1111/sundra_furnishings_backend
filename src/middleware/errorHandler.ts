import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  meta?: Record<string, any>;
}

// Global professional error handling middleware
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1. Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const fieldPath = issue.path.join(".") || "field";
      formattedErrors[fieldPath] = issue.message;
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed. Please verify the provided request data.",
      errors: formattedErrors,
    });
  }

  // 2. Prisma Database Errors
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as AppError;

    // Unique constraint violation (e.g. duplicate email, SKU, code)
    if (prismaErr.code === "P2002") {
      const target = (prismaErr.meta?.target as string[]) || ["field"];
      const fieldName = target.join(", ");
      return res.status(409).json({
        success: false,
        message: `A record with this ${fieldName} already exists. Please choose a unique value.`,
        field: fieldName,
      });
    }

    // Foreign key constraint violation (e.g. invalid categoryId or supplierId)
    if (prismaErr.code === "P2003") {
      const fieldName = prismaErr.meta?.field_name || "referenced ID";
      return res.status(400).json({
        success: false,
        message: `Referenced entity does not exist (${fieldName}). Please provide a valid ID from the master catalog.`,
      });
    }

    // Record to update or delete not found
    if (prismaErr.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "The requested record could not be found or has already been removed.",
      });
    }
  }

  // 3. Malformed JSON syntax error in request body
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body. Please verify the JSON syntax.",
    });
  }

  // 4. Custom Application Errors
  if (err instanceof Error) {
    const statusCode = (err as AppError).statusCode || 500;
    const message = err.message || "An unexpected error occurred.";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // 5. Fallback for unhandled exceptions
  return res.status(500).json({
    success: false,
    message: "Internal server error. Our engineering team has logged the incident.",
  });
};
