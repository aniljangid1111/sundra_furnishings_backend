import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import { parseDateRangeFilter } from "../utils/dateFilter";
import { adjustStockSchema } from "../validations/inventory.validation";
import { z } from "zod";

type AdjustStockInput = z.infer<typeof adjustStockSchema>;

/**
 * Retrieves live inventory breakdown across all products with pagination and KPI summary
 */
export const getInventorySummary = async (
  filters?: {
    warehouseId?: number;
    categoryId?: number;
    status?: string;
    stockStatus?: string;
    search?: string;
  },
  pagination?: PaginationParams
) => {
  const whereClause: any = {};

  if (filters?.categoryId) {
    whereClause.categoryId = filters.categoryId;
  }

  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
    ];
  }

  const allProducts = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const defaultWarehouse = await prisma.warehouse.findFirst({
    orderBy: { id: "asc" },
  });

  let mappedItems = allProducts.map((product) => {
    const onHand = product.stock;
    const reserved = Math.min(onHand, 2);
    const available = Math.max(0, onHand - reserved);
    const reorderLevel = product.reorderLevel || 10;
    const inventoryValue = Math.round(onHand * product.costPrice * 100) / 100;

    let stockStatus = "IN_STOCK";
    if (onHand === 0) {
      stockStatus = "OUT_OF_STOCK";
    } else if (onHand <= reorderLevel) {
      stockStatus = "LOW_STOCK";
    }

    return {
      id: product.id,
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      category: product.category?.name || "Uncategorized",
      warehouseId: defaultWarehouse?.id || 1,
      warehouseName: defaultWarehouse?.name || "Central Distribution Center (CDC)",
      onHand,
      reserved,
      available,
      reorderLevel,
      unitCost: product.costPrice,
      sellingPrice: product.sellingPrice,
      finalPrice: product.costPrice,
      inventoryValue,
      stockStatus,
      uom: product.uom || "PCS",
    };
  });

  // Filter by stockStatus if provided (e.g. LOW_STOCK, OUT_OF_STOCK, IN_STOCK)
  const targetStockStatus = filters?.stockStatus || (filters?.status && ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"].includes(filters.status) ? filters.status : undefined);
  if (targetStockStatus && targetStockStatus !== "ALL") {
    mappedItems = mappedItems.filter((item) => item.stockStatus === targetStockStatus);
  }

  // Calculate live KPIs
  const totalUnits = mappedItems.reduce((acc, i) => acc + i.onHand, 0);
  const totalValuation = mappedItems.reduce((acc, i) => acc + i.inventoryValue, 0);
  const inStockCount = mappedItems.filter((i) => i.stockStatus === "IN_STOCK").length;
  const lowStockCount = mappedItems.filter((i) => i.stockStatus === "LOW_STOCK").length;
  const outOfStockCount = mappedItems.filter((i) => i.stockStatus === "OUT_OF_STOCK").length;

  const kpi = {
    totalUnits,
    totalValuation: Math.round(totalValuation * 100) / 100,
    inStockCount,
    lowStockCount,
    outOfStockCount,
  };

  const totalItems = mappedItems.length;
  let pagedItems = mappedItems;
  if (pagination && pagination.isPaginated) {
    pagedItems = mappedItems.slice(pagination.skip, pagination.skip + pagination.limit);
  }

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    inventory: pagedItems,
    pagination: paginationMeta,
    kpi,
  };
};

/**
 * Retrieves low-stock and out-of-stock items requiring replenishment
 */
export const getInventoryAlerts = async () => {
  const result = await getInventorySummary();
  return result.inventory.filter(
    (item) => item.stockStatus === "LOW_STOCK" || item.stockStatus === "OUT_OF_STOCK"
  );
};

/**
 * Retrieves stock ledger audit movements with date filtering and pagination
 */
export const getStockLedger = async (
  filters?: {
    productId?: number;
    warehouseId?: number;
    movementType?: string;
    search?: string;
    timeRange?: string;
    startDate?: string;
    endDate?: string;
  },
  pagination?: PaginationParams
) => {
  const whereClause: any = {};
  if (filters?.productId) {
    whereClause.productId = filters.productId;
  }
  if (filters?.warehouseId) {
    whereClause.warehouseId = filters.warehouseId;
  }
  if (filters?.movementType && filters.movementType !== "ALL") {
    whereClause.movementType = filters.movementType;
  }

  // Date range filter on stock ledger date
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.date = dateFilter;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { sku: { contains: term, mode: "insensitive" } },
      { productName: { contains: term, mode: "insensitive" } },
      { referenceDocument: { contains: term, mode: "insensitive" } },
      { notes: { contains: term, mode: "insensitive" } },
    ];
  }

  const totalItems = await prisma.stockLedger.count({
    where: whereClause,
  });

  const ledger = await prisma.stockLedger.findMany({
    where: whereClause,
    orderBy: {
      date: "desc",
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
    ledger,
    pagination: paginationMeta,
  };
};

/**
 * Performs manual inventory adjustment (cycle count, damaged items, correction)
 */
export const adjustStock = async (data: AdjustStockInput) => {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const warehouse = await prisma.warehouse.findUnique({
    where: { id: data.warehouseId || 1 },
  });
  const warehouseName = warehouse?.name || "Central Distribution Center (CDC)";

  const previousBalance = product.stock;
  let newBalance = previousBalance;
  let quantityChange = 0;

  if (data.action === "ADD") {
    quantityChange = data.quantity;
    newBalance = previousBalance + data.quantity;
  } else if (data.action === "DEDUCT") {
    quantityChange = -data.quantity;
    newBalance = Math.max(0, previousBalance - data.quantity);
  } else if (data.action === "SET") {
    quantityChange = data.quantity - previousBalance;
    newBalance = data.quantity;
  }

  // Update physical product stock
  const updatedProduct = await prisma.product.update({
    where: { id: product.id },
    data: {
      stock: newBalance,
    },
  });

  // Record audit entry in StockLedger
  const ledgerEntry = await prisma.stockLedger.create({
    data: {
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      warehouseId: data.warehouseId || 1,
      warehouseName,
      movementType: "INVENTORY_ADJUSTMENT",
      referenceDocument: data.referenceDocument || `ADJ-${Date.now().toString().slice(-6)}`,
      quantityChange,
      previousBalance,
      newBalance,
      notes: data.reason || "Manual cycle count adjustment",
    },
  });

  return {
    product: updatedProduct,
    ledgerEntry,
  };
};

