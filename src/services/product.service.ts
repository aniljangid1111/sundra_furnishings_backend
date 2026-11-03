import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import {
  extractPublicIdFromUrl,
  deleteFromCloudinary,
} from "./upload.service";

// Retrieve all products with category details, filters, pagination, and KPI summary
export const getAllProducts = async (
  filters?: {
    search?: string;
    categoryId?: number;
    status?: string;
    channel?: string;
    stockFilter?: string;
  },
  pagination?: PaginationParams
) => {
  const where: any = {};

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search.trim(), mode: "insensitive" } },
      { sku: { contains: filters.search.trim(), mode: "insensitive" } },
    ];
  }

  // Stock status filter (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
  if (filters?.stockFilter === "OUT_OF_STOCK") {
    where.stock = 0;
  } else if (filters?.stockFilter === "IN_STOCK") {
    where.stock = { gt: 0 };
  }

  const allFiltered = await prisma.product.findMany({
    where,
    select: {
      id: true,
      status: true,
      stock: true,
      costPrice: true,
      reorderLevel: true,
      salesChannels: true,
    },
  });

  // If channel filter applied, filter in-memory for Json array
  let matchedIds: number[] | null = null;
  if (filters?.channel && filters.channel !== "ALL") {
    matchedIds = allFiltered
      .filter((p) => {
        const ch = p.salesChannels as any[];
        return Array.isArray(ch) && ch.includes(filters.channel);
      })
      .map((p) => p.id);

    where.id = { in: matchedIds };
  }

  const finalPool = matchedIds
    ? allFiltered.filter((p) => matchedIds.includes(p.id))
    : allFiltered;

  const totalItems = finalPool.length;
  const totalProducts = totalItems;
  const activeProducts = finalPool.filter((p) => p.status === "ACTIVE").length;
  const inactiveProducts = finalPool.filter((p) => p.status === "INACTIVE").length;
  const outOfStockProducts = finalPool.filter((p) => p.stock === 0).length;
  const lowStockProducts = finalPool.filter(
    (p) => p.stock > 0 && p.stock <= (p.reorderLevel || 10)
  ).length;
  const totalInventoryValue = finalPool.reduce(
    (sum, p) => sum + p.stock * p.costPrice,
    0
  );

  const kpi = {
    totalProducts,
    activeProducts,
    inactiveProducts,
    lowStockProducts,
    outOfStockProducts,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    ...(pagination && {
      skip: pagination.skip,
      take: pagination.limit,
    }),
  });

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    products,
    pagination: paginationMeta,
    kpi,
  };
};

// Retrieve single product by ID
export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

// Create a new product
export const createProduct = async (data: {
  name: string;
  sku: string;
  categoryId?: number | null;
  uom?: string;
  costPrice?: number;
  sellingPrice?: number;
  stock?: number;
  reorderLevel?: number;
  taxRate?: number;
  status?: string;
  imageUrl?: string | null;
  salesChannels?: string[];
}) => {
  // Check if SKU already exists
  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku },
  });

  if (existingSku) {
    const error: any = new Error(`Product with SKU '${data.sku}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  // Validate categoryId exists in database if provided
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      const error: any = new Error(
        `Category with ID ${data.categoryId} does not exist. Call GET /api/categories to see available categories.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId || null,
      uom: data.uom || "PCS",
      costPrice: data.costPrice ?? 0,
      sellingPrice: data.sellingPrice ?? 0,
      stock: data.stock ?? 0,
      reorderLevel: data.reorderLevel ?? 10,
      taxRate: data.taxRate ?? 8.25,
      status: data.status || "ACTIVE",
      imageUrl: data.imageUrl || null,
      salesChannels: data.salesChannels || [],
    },
    include: {
      category: true,
    },
  });

  return product;
};

// Update an existing product
export const updateProduct = async (
  id: number,
  data: {
    name?: string;
    sku?: string;
    categoryId?: number | null;
    uom?: string;
    costPrice?: number;
    sellingPrice?: number;
    stock?: number;
    reorderLevel?: number;
    taxRate?: number;
    status?: string;
    imageUrl?: string | null;
    salesChannels?: string[];
  }
) => {
  await getProductById(id);

  // Check unique SKU if changing
  if (data.sku) {
    const existingSku = await prisma.product.findFirst({
      where: {
        AND: [{ id: { not: id } }, { sku: data.sku }],
      },
    });

    if (existingSku) {
      const error: any = new Error(`Another product already has SKU '${data.sku}'`);
      error.statusCode = 409;
      throw error;
    }
  }

  // Validate categoryId exists in database if provided
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      const error: any = new Error(
        `Category with ID ${data.categoryId} does not exist. Call GET /api/categories to see available categories.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });

  return updated;
};

// Delete a product (and clean up image from Cloudinary)
export const deleteProduct = async (id: number) => {
  const product = await getProductById(id);

  // Clean up product image from Cloudinary if it exists
  if (product.imageUrl) {
    const publicId = extractPublicIdFromUrl(product.imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  await prisma.product.delete({
    where: { id },
  });

  return { id };
};
