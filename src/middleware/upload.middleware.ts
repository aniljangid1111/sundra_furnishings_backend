import multer from "multer";
import { Request } from "express";

// Allowed image MIME types for enterprise security
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

// Configure in-memory storage (Direct RAM buffer, no temp disk files)
const storage = multer.memoryStorage();

const multerConfig = {
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    // Validate MIME type
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PNG, JPG, JPEG, WEBP, and SVG images are permitted."
        )
      );
    }
  },
};

// Middleware for company logo upload (field: 'logo')
export const uploadLogoMiddleware = multer(multerConfig).single("logo");

// Middleware for product image upload (field: 'image')
export const uploadProductImageMiddleware = multer(multerConfig).single("image");
