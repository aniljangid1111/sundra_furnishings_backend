import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import { parseDateRangeFilter } from "../utils/dateFilter";
import {
  createImportSchema,
  updateImportSchema,
} from "../validations/import.validation";
import { z } from "zod";

type CreateImportInput = z.infer<typeof createImportSchema>;
type UpdateImportInput = z.infer<typeof updateImportSchema>;

/**
 * Landed cost allocation logic across shipment line items
 */
export const calculateLandedCosts = (
  items: any[],
  expenseHeads: any[]
): any[] => {
  const totalProductCost = items.reduce(
    (sum, item) => sum + (Number(item.purchaseTotalCost) || Number(item.quantity) * Number(item.purchaseUnitCost)),
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return items.map((item, index) => {
    const purchaseTotalCost =
      Number(item.purchaseTotalCost) ||
      Number(item.quantity) * Number(item.purchaseUnitCost);

    let itemAllocated = 0;

    for (const expense of expenseHeads) {
      const amount = Number(expense.amount) || 0;
      if (amount <= 0) continue;

      let ratio = 0;
      if (expense.allocationMethod === "BY_VALUE") {
        ratio = totalProductCost > 0 ? purchaseTotalCost / totalProductCost : 0;
      } else if (expense.allocationMethod === "BY_QUANTITY") {
        ratio = totalQuantity > 0 ? Number(item.quantity) / totalQuantity : 0;
      } else {
        // EQUAL
        ratio = items.length > 0 ? 1 / items.length : 0;
      }

      itemAllocated += amount * ratio;
    }

    const totalLandedCost = purchaseTotalCost + itemAllocated;
    const landedUnitCost =
      Number(item.quantity) > 0 ? totalLandedCost / Number(item.quantity) : 0;

    return {
      ...item,
      id: item.id || index + 1,
      purchaseTotalCost: Number(purchaseTotalCost.toFixed(2)),
      allocatedExpense: Number(itemAllocated.toFixed(2)),
      totalLandedCost: Number(totalLandedCost.toFixed(2)),
      landedUnitCost: Number(landedUnitCost.toFixed(2)),
    };
  });
};

/**
 * Generate next sequential Import Number (e.g. IMP-2026-002)
 */
export const generateNextImportNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `IMP-${year}-`;

  const latest = await prisma.importShipment.findFirst({
    where: {
      importNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!latest) {
    return `${prefix}001`;
  }

  const parts = latest.importNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;

  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
};

/**
 * Retrieve all import shipments with date filters, pagination, and KPI summary
 */
export const getAllImports = async (
  filters?: {
    status?: string;
    warehouseId?: number;
    search?: string;
    timeRange?: string;
    startDate?: string;
    endDate?: string;
  },
  pagination?: PaginationParams
) => {
  const whereClause: any = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.warehouseId) {
    whereClause.warehouseId = filters.warehouseId;
  }

  // Date range filter on importDate
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.importDate = dateFilter;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { importNumber: { contains: term, mode: "insensitive" } },
      { supplierName: { contains: term, mode: "insensitive" } },
      { shipmentReference: { contains: term, mode: "insensitive" } },
      { supplierInvoiceNumber: { contains: term, mode: "insensitive" } },
    ];
  }

  const totalItems = await prisma.importShipment.count({
    where: whereClause,
  });

  const allFiltered = await prisma.importShipment.findMany({
    where: whereClause,
    select: {
      totalProductCost: true,
      totalAdditionalCosts: true,
      totalLandedCost: true,
      status: true,
    },
  });

  const totalShipments = allFiltered.length;
  const totalProductCost = allFiltered.reduce(
    (sum, imp) => sum + imp.totalProductCost,
    0
  );
  const totalAdditionalCosts = allFiltered.reduce(
    (sum, imp) => sum + imp.totalAdditionalCosts,
    0
  );
  const totalLandedCost = allFiltered.reduce(
    (sum, imp) => sum + imp.totalLandedCost,
    0
  );
  const completedCount = allFiltered.filter(
    (imp) => imp.status === "COMPLETED"
  ).length;
  const inProgressCount = allFiltered.filter(
    (imp) => imp.status !== "COMPLETED" && imp.status !== "CANCELLED"
  ).length;

  const kpi = {
    totalShipments,
    totalProductCost: Math.round(totalProductCost * 100) / 100,
    totalAdditionalCosts: Math.round(totalAdditionalCosts * 100) / 100,
    totalLandedCost: Math.round(totalLandedCost * 100) / 100,
    completedCount,
    inProgressCount,
  };

  const shipments = await prisma.importShipment.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
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
    shipments,
    pagination: paginationMeta,
    kpi,
  };
};

/**
 * Retrieve a single import shipment by ID
 */
export const getImportById = async (id: number) => {
  const shipment = await prisma.importShipment.findUnique({
    where: { id },
  });

  if (!shipment) {
    const error: any = new Error("Import shipment not found");
    error.statusCode = 404;
    throw error;
  }

  return shipment;
};

/**
 * Create a new import shipment with automated landed cost allocation
 */
export const createImportShipment = async (data: CreateImportInput) => {
  const importNumber = data.importNumber || (await generateNextImportNumber());

  // Auto-resolve items: sku & name from product table if omitted
  const preparedItems = await Promise.all(
    data.items.map(async (item) => {
      let sku = item.sku;
      let productName = item.productName;
      let purchaseUnitCost = item.purchaseUnitCost;

      if (!sku || !productName || !purchaseUnitCost) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (prod) {
          sku = sku || prod.sku;
          productName = productName || prod.name;
          purchaseUnitCost = purchaseUnitCost || prod.costPrice;
        }
      }

      const totalCost = item.purchaseTotalCost ?? Number(item.quantity) * Number(purchaseUnitCost);

      return {
        ...item,
        sku: sku || `SKU-${item.productId}`,
        productName: productName || `Product ${item.productId}`,
        purchaseUnitCost: Number(purchaseUnitCost),
        purchaseTotalCost: Number(totalCost),
      };
    })
  );

  // Compute landed costs for each line item based on expense heads
  const calculatedItems = calculateLandedCosts(preparedItems, data.expenseHeads || []);

  const totalProductCost = calculatedItems.reduce(
    (sum, it) => sum + Number(it.purchaseTotalCost),
    0
  );
  const totalAdditionalCosts = (data.expenseHeads || []).reduce(
    (sum, ex) => sum + (Number(ex.amount) || 0),
    0
  );
  const totalLandedCost = totalProductCost + totalAdditionalCosts;

  // Resolve warehouse name
  let warehouseName = data.warehouseName;
  if (!warehouseName && data.warehouseId) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    warehouseName = wh?.name || "Central Distribution Center (CDC)";
  }

  // Resolve supplier name if missing
  let supplierName = data.supplierName;
  if (!supplierName && data.supplierId) {
    const sup = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    supplierName = sup?.companyName || "Vendor";
  }

  const shipment = await prisma.importShipment.create({
    data: {
      importNumber,
      supplierId: data.supplierId || null,
      supplierName: supplierName || null,
      supplierInvoiceNumber: data.supplierInvoiceNumber || null,
      purchaseId: data.purchaseId || null,
      purchaseNumber: data.purchaseNumber || null,
      shipmentReference: data.shipmentReference || null,
      importDate: data.importDate ? new Date(data.importDate) : new Date(),
      warehouseId: data.warehouseId || 1,
      warehouseName: warehouseName || "Central Distribution Center (CDC)",
      status: data.status || "DRAFT",
      items: calculatedItems,
      expenseHeads: data.expenseHeads || [],
      totalProductCost,
      totalAdditionalCosts,
      totalLandedCost,
      documentName: data.documentName || null,
      documentExtracted: data.documentExtracted || false,
      notes: data.notes || null,
    },
  });

  return shipment;
};

/**
 * Update an existing import shipment
 */
export const updateImportShipment = async (id: number, data: UpdateImportInput) => {
  const existing = await getImportById(id);

  let calculatedItems = existing.items as any[];
  let expenseHeads = data.expenseHeads ?? (existing.expenseHeads as any[]);

  if (data.items || data.expenseHeads) {
    const itemsToProcess = data.items || calculatedItems;
    calculatedItems = calculateLandedCosts(itemsToProcess, expenseHeads);
  }

  const totalProductCost = calculatedItems.reduce(
    (sum, it) => sum + Number(it.purchaseTotalCost),
    0
  );
  const totalAdditionalCosts = expenseHeads.reduce(
    (sum: number, ex: any) => sum + (Number(ex.amount) || 0),
    0
  );
  const totalLandedCost = totalProductCost + totalAdditionalCosts;

  const updated = await prisma.importShipment.update({
    where: { id },
    data: {
      ...(data.importNumber && { importNumber: data.importNumber }),
      ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
      ...(data.supplierName !== undefined && { supplierName: data.supplierName }),
      ...(data.supplierInvoiceNumber !== undefined && {
        supplierInvoiceNumber: data.supplierInvoiceNumber,
      }),
      ...(data.purchaseId !== undefined && { purchaseId: data.purchaseId }),
      ...(data.purchaseNumber !== undefined && { purchaseNumber: data.purchaseNumber }),
      ...(data.shipmentReference !== undefined && {
        shipmentReference: data.shipmentReference,
      }),
      ...(data.importDate && { importDate: new Date(data.importDate) }),
      ...(data.warehouseId && { warehouseId: data.warehouseId }),
      ...(data.warehouseName && { warehouseName: data.warehouseName }),
      ...(data.status && { status: data.status }),
      items: calculatedItems,
      expenseHeads,
      totalProductCost,
      totalAdditionalCosts,
      totalLandedCost,
      ...(data.documentName !== undefined && { documentName: data.documentName }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  return updated;
};

/**
 * Delete an import shipment
 */
export const deleteImportShipment = async (id: number) => {
  const existing = await prisma.importShipment.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Import shipment not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.importShipment.delete({
    where: { id },
  });

  return { id, message: "Import shipment deleted successfully" };
};

