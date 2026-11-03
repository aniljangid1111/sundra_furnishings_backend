import { Request, Response, NextFunction } from "express";
import { getPaginationParams } from "../utils/pagination";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service";
import {
  uploadBufferToCloudinary,
  extractPublicIdFromUrl,
  deleteFromCloudinary,
} from "../services/upload.service";

// Helper to sanitize multipart/form-data stringified fields
const parseMultipartFields = (body: Record<string, any>) => {
  const parsed = { ...body };

  if (typeof parsed.costPrice === "string") parsed.costPrice = Number(parsed.costPrice);
  if (typeof parsed.sellingPrice === "string") parsed.sellingPrice = Number(parsed.sellingPrice);
  if (typeof parsed.stock === "string") parsed.stock = Number(parsed.stock);
  if (typeof parsed.reorderLevel === "string") parsed.reorderLevel = Number(parsed.reorderLevel);
  if (typeof parsed.taxRate === "string") parsed.taxRate = Number(parsed.taxRate);
  if (typeof parsed.categoryId === "string") {
    const trimmed = parsed.categoryId.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined") {
      parsed.categoryId = null;
    } else {
      parsed.categoryId = Number(trimmed);
    }
  }

  if (typeof parsed.salesChannels === "string") {
    try {
      parsed.salesChannels = JSON.parse(parsed.salesChannels);
    } catch {
      // If comma-separated string e.g. "Website,Amazon"
      parsed.salesChannels = parsed.salesChannels.split(",").map((s: string) => s.trim());
    }
  }

  return parsed;
};

// @route   GET /api/products
// @desc    Retrieve all products with category details, filters, pagination, and KPI summary
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, categoryId, status, channel, stockFilter } = req.query;
    const pagination = getPaginationParams(req.query);

    const result = await getAllProducts(
      {
        search: search ? String(search) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        status: status ? String(status) : undefined,
        channel: channel ? String(channel) : undefined,
        stockFilter: stockFilter ? String(stockFilter) : undefined,
      },
      pagination
    );

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.products,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
// @desc    Retrieve a single product by ID
// @access  Public
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const product = await getProductById(id);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/products
// @desc    Create a new product with optional image upload (to sundara/products)
// @access  Private (Requires Bearer Token)
export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawBody = parseMultipartFields(req.body);

    // 1. Upload product image to Cloudinary 'sundara/products' folder if attached
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "sundara/products"
      );
      rawBody.imageUrl = uploadResult.secureUrl;
    }

    // 2. Validate payload with Zod
    const validatedData = createProductSchema.parse(rawBody);

    // 3. Create product in database
    const product = await createProduct(validatedData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id
// @desc    Update an existing product (Auto-deletes old Cloudinary image on replace)
// @access  Private (Requires Bearer Token)
export const editProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rawBody = parseMultipartFields(req.body);

    // 1. If a new image is attached, delete the previous image from Cloudinary
    if (req.file) {
      const existingProduct = await getProductById(id);
      if (existingProduct.imageUrl) {
        const oldPublicId = extractPublicIdFromUrl(existingProduct.imageUrl);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }

      // Upload new image to 'sundara/products' folder
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "sundara/products"
      );
      rawBody.imageUrl = uploadResult.secureUrl;
    }

    // 2. Validate update payload
    const validatedData = updateProductSchema.parse(rawBody);

    // 3. Update product in database
    const updatedProduct = await updateProduct(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product and remove its image from Cloudinary
// @access  Private (Requires Bearer Token)
export const removeProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteProduct(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
