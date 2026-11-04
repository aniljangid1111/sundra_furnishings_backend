import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import { parseDateRangeFilter } from "../utils/dateFilter";

// Generate next PO Number sequentially (e.g. PO-2026-003)
export const generateNextPoNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;

  const latestPo = await prisma.purchase.findFirst({
    where: {
      purchaseNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!latestPo) {
    return `${prefix}001`;
  }

  const parts = latestPo.purchaseNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;

  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
};

// Retrieve all purchase orders with date filtering, status filters, pagination, and KPI summary
export const getAllPurchases = async (
  filters?: {
    status?: string;
    supplierId?: number;
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

  if (filters?.supplierId) {
    whereClause.supplierId = filters.supplierId;
  }

  if (filters?.warehouseId) {
    whereClause.warehouseId = filters.warehouseId;
  }

  // Date range filter on purchaseDate
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.purchaseDate = dateFilter;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { purchaseNumber: { contains: term, mode: "insensitive" } },
      { supplierName: { contains: term, mode: "insensitive" } },
      { supplierInvoiceNumber: { contains: term, mode: "insensitive" } },
      { containerNumber: { contains: term, mode: "insensitive" } },
    ];
  }

  // Count total items matching criteria
  const totalItems = await prisma.purchase.count({
    where: whereClause,
  });

  // Calculate live KPI summary metrics
  const allFilteredPOs = await prisma.purchase.findMany({
    where: whereClause,
    select: {
      grandTotal: true,
      balanceDue: true,
      status: true,
    },
  });

  const totalCount = allFilteredPOs.length;
  const totalValue = allFilteredPOs.reduce((acc, p) => acc + p.grandTotal, 0);
  const receivedCount = allFilteredPOs.filter((p) => p.status === "RECEIVED").length;
  const draftCount = allFilteredPOs.filter((p) => p.status === "DRAFT").length;
  const orderedCount = allFilteredPOs.filter((p) => p.status === "ORDERED").length;
  const totalBalanceDue = allFilteredPOs.reduce((acc, p) => acc + p.balanceDue, 0);

  const kpi = {
    totalCount,
    totalValue: Math.round(totalValue * 100) / 100,
    receivedCount,
    draftCount,
    orderedCount,
    totalBalanceDue: Math.round(totalBalanceDue * 100) / 100,
  };

  const purchases = await prisma.purchase.findMany({
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
    purchases,
    pagination: paginationMeta,
    kpi,
  };
};

// Retrieve single purchase by ID
export const getPurchaseById = async (id: number) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
  });

  if (!purchase) {
    const error: any = new Error("Purchase order not found");
    error.statusCode = 404;
    throw error;
  }

  return purchase;
};

// Create a new purchase order
export const createPurchase = async (data: {
  purchaseNumber?: string;
  supplierId: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName?: string;
  purchaseDate?: string;
  expectedDate?: string;
  supplierInvoiceNumber?: string;
  containerNumber?: string;
  status?: string;
  items: any[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  additionalCharges?: number;
  grandTotal?: number;
  amountPaid?: number;
  balanceDue?: number;
  notes?: string;
}) => {
  // Generate PO number if not provided by backend automatically
  const purchaseNumber = data.purchaseNumber || (await generateNextPoNumber());

  // Check unique PO number
  const existing = await prisma.purchase.findUnique({
    where: { purchaseNumber },
  });
  if (existing) {
    const error: any = new Error(`Purchase order '${purchaseNumber}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  // Resolve supplier name automatically from DB if missing
  let supplierName = data.supplierName;
  if (!supplierName) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    supplierName = supplier?.companyName || "Vendor";
  }

  // Resolve warehouse name automatically from DB if missing
  let warehouseName = data.warehouseName;
  if (!warehouseName) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    warehouseName = warehouse?.name || "Main Warehouse";
  }

  // Auto-resolve product details, unitCost, lineTotal, and item ID for each line item
  const resolvedItems = await Promise.all(
    data.items.map(async (item, index) => {
      let sku = item.sku;
      let productName = item.productName;
      let unitCost = item.unitCost;

      if (!sku || !productName || unitCost === undefined) {
        const prod = await prisma.product.findUnique({
          where: { id: Number(item.productId) },
        });
        if (prod) {
          sku = sku || prod.sku;
          productName = productName || prod.name;
          unitCost = unitCost !== undefined ? unitCost : prod.costPrice;
        }
      }

      const cost = Number(unitCost) || 0;
      const discount = Number(item.discount) || 0;
      const quantity = Number(item.quantity) || 1;
      const lineTotal =
        item.lineTotal !== undefined
          ? Number(item.lineTotal)
          : Math.max(0, quantity * cost - discount);

      return {
        id: item.id || index + 1,
        productId: Number(item.productId),
        sku: sku || `SKU-${item.productId}`,
        productName: productName || `Product ${item.productId}`,
        quantity,
        unitCost: cost,
        discount,
        taxRate: Number(item.taxRate) || 8.25,
        lineTotal,
        receivedQuantity: Number(item.receivedQuantity) || 0,
      };
    })
  );

  // Calculate financials
  const subtotal =
    data.subtotal ?? resolvedItems.reduce((acc, it) => acc + it.lineTotal, 0);
  const discount = Number(data.discount) || 0;
  const tax = Number(data.tax) || 0;
  const additionalCharges = Number(data.additionalCharges) || 0;
  const grandTotal =
    data.grandTotal ?? Math.max(0, subtotal - discount + tax + additionalCharges);
  const amountPaid = Number(data.amountPaid) || 0;
  const balanceDue = data.balanceDue ?? Math.max(0, grandTotal - amountPaid);
  const status = data.status || "DRAFT";

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber,
      supplierId: data.supplierId,
      supplierName,
      warehouseId: data.warehouseId,
      warehouseName,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      supplierInvoiceNumber: data.supplierInvoiceNumber || null,
      containerNumber: data.containerNumber || null,
      status,
      items: resolvedItems,
      subtotal,
      discount,
      tax,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      notes: data.notes || "",
    },
  });

  // If status is RECEIVED upon creation, increment stock of each item in inventory
  if (status === "RECEIVED") {
    for (const item of resolvedItems) {
      if (item.productId && item.quantity) {
        await prisma.product.updateMany({
          where: { id: Number(item.productId) },
          data: {
            stock: { increment: Number(item.quantity) },
          },
        });
      }
    }
  }

  return purchase;
};

// Update an existing purchase order
export const updatePurchase = async (id: number, data: any) => {
  const existing = await getPurchaseById(id);

  // If supplierId changed without supplierName, resolve it
  let supplierName = data.supplierName;
  if (data.supplierId && !supplierName) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    supplierName = supplier?.companyName || existing.supplierName;
  }

  // If warehouseId changed without warehouseName, resolve it
  let warehouseName = data.warehouseName;
  if (data.warehouseId && !warehouseName) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    warehouseName = warehouse?.name || existing.warehouseName;
  }

  // If items are provided, resolve product details and recalculate
  let resolvedItems = data.items;
  if (Array.isArray(data.items)) {
    resolvedItems = await Promise.all(
      data.items.map(async (item: any, index: number) => {
        let sku = item.sku;
        let productName = item.productName;
        let unitCost = item.unitCost;

        if (!sku || !productName || unitCost === undefined) {
          const prod = await prisma.product.findUnique({
            where: { id: Number(item.productId) },
          });
          if (prod) {
            sku = sku || prod.sku;
            productName = productName || prod.name;
            unitCost = unitCost !== undefined ? unitCost : prod.costPrice;
          }
        }

        const cost = Number(unitCost) || 0;
        const discount = Number(item.discount) || 0;
        const quantity = Number(item.quantity) || 1;
        const lineTotal =
          item.lineTotal !== undefined
            ? Number(item.lineTotal)
            : Math.max(0, quantity * cost - discount);

        return {
          id: item.id || index + 1,
          productId: Number(item.productId),
          sku: sku || `SKU-${item.productId}`,
          productName: productName || `Product ${item.productId}`,
          quantity,
          unitCost: cost,
          discount,
          taxRate: Number(item.taxRate) || 8.25,
          lineTotal,
          receivedQuantity: Number(item.receivedQuantity) || 0,
        };
      })
    );
  }

  const subtotal =
    data.subtotal ??
    (resolvedItems
      ? resolvedItems.reduce((acc: number, it: any) => acc + it.lineTotal, 0)
      : existing.subtotal);
  const discount = data.discount !== undefined ? Number(data.discount) : existing.discount;
  const tax = data.tax !== undefined ? Number(data.tax) : existing.tax;
  const additionalCharges =
    data.additionalCharges !== undefined
      ? Number(data.additionalCharges)
      : existing.additionalCharges;
  const grandTotal =
    data.grandTotal ?? Math.max(0, subtotal - discount + tax + additionalCharges);
  const amountPaid =
    data.amountPaid !== undefined ? Number(data.amountPaid) : existing.amountPaid;
  const balanceDue =
    data.balanceDue ?? Math.max(0, grandTotal - amountPaid);

  const updated = await prisma.purchase.update({
    where: { id },
    data: {
      ...data,
      ...(supplierName && { supplierName }),
      ...(warehouseName && { warehouseName }),
      ...(resolvedItems && { items: resolvedItems }),
      subtotal,
      discount,
      tax,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      ...(data.purchaseDate && {
        purchaseDate: new Date(data.purchaseDate),
      }),
      ...(data.expectedDate !== undefined && {
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      }),
    },
  });

  // If status changed to RECEIVED, increment product inventory stock
  if (existing.status !== "RECEIVED" && data.status === "RECEIVED") {
    const items = (updated.items as any[]) || [];
    for (const item of items) {
      if (item.productId && item.quantity) {
        await prisma.product.updateMany({
          where: { id: Number(item.productId) },
          data: {
            stock: { increment: Number(item.quantity) },
          },
        });
      }
    }
  }

  return updated;
};

// Delete a purchase order
export const deletePurchase = async (id: number) => {
  const existing = await prisma.purchase.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Purchase order not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.purchase.delete({
    where: { id },
  });

  return { id };
};
