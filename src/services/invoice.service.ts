import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import { parseDateRangeFilter } from "../utils/dateFilter";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "../validations/invoice.validation";
import { z } from "zod";

type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

const initialInvoices = [
  {
    invoiceNumber: "INV-2026-001",
    invoiceDate: new Date("2026-10-14T11:00:00Z"),
    dueDate: new Date("2026-11-14T11:00:00Z"),
    salesChannel: "Website",
    externalOrderId: "ORD-99120",
    buyerName: "Eleanor Vance",
    buyerEmail: "eleanor.vance@example.com",
    buyerPhone: "+1 (555) 234-5678",
    billingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    items: [
      {
        id: 1,
        productId: 1,
        sku: "BED-001",
        productName: "Cotton Bedsheet Set - Queen",
        quantity: 2,
        unitPrice: 180,
        discount: 20,
        taxRate: 8.25,
        lineTotal: 340,
      },
      {
        id: 2,
        productId: 3,
        sku: "TBL-001",
        productName: "Oak Side Table",
        quantity: 1,
        unitPrice: 280,
        discount: 0,
        taxRate: 8.25,
        lineTotal: 280,
      },
    ],
    subtotal: 620,
    discountTotal: 20,
    taxTotal: 49.5,
    shippingCharges: 25,
    additionalCharges: 0,
    grandTotal: 674.5,
    amountPaid: 674.5,
    balanceDue: 0,
    paymentStatus: "PAID",
    paymentMethod: "CREDIT_CARD",
    status: "ISSUED",
    notes: "Front porch delivery requested with signature requirement.",
    termsAndConditions: "Standard 30-day return policy. Retain receipt for warranty claims.",
  },
  {
    invoiceNumber: "INV-2026-002",
    invoiceDate: new Date("2026-10-28T14:30:00Z"),
    dueDate: new Date("2026-11-28T14:30:00Z"),
    salesChannel: "B2B Wholesale",
    externalOrderId: "PO-CLIENT-411",
    buyerName: "Theodore Finch",
    buyerEmail: "theodore@finch-interiors.com",
    buyerPhone: "+1 (555) 876-5432",
    billingAddress: "450 Lexington Ave, Suite 1200, New York, NY 10017",
    shippingAddress: "450 Lexington Ave, Suite 1200, New York, NY 10017",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    items: [
      {
        id: 3,
        productId: 5,
        sku: "TBL-002",
        productName: "Walnut Console Table",
        quantity: 2,
        unitPrice: 650,
        discount: 50,
        taxRate: 8.25,
        lineTotal: 1250,
      },
    ],
    subtotal: 1250,
    discountTotal: 50,
    taxTotal: 99.0,
    shippingCharges: 85,
    additionalCharges: 0,
    grandTotal: 1384.0,
    amountPaid: 500.0,
    balanceDue: 884.0,
    paymentStatus: "PARTIALLY_PAID",
    paymentMethod: "BANK_TRANSFER",
    status: "ISSUED",
    notes: "Commercial delivery between 9 AM and 4 PM with freight elevator access.",
    termsAndConditions: "Net 30 terms. Late fees of 1.5% apply after 30 days.",
  },
];

/**
 * Automatically seeds initial invoices if the table is currently empty
 */
const seedInitialInvoices = async () => {
  const count = await prisma.invoice.count();
  if (count === 0) {
    for (const inv of initialInvoices) {
      await prisma.invoice.create({
        data: inv,
      });
    }
  }
};

/**
 * Generates the next sequential invoice number (e.g. INV-2026-003)
 */
export const generateNextInvoiceNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const latest = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
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

  const parts = latest.invoiceNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;

  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
};

/**
 * Retrieves all invoices with date filtering, status filters, pagination, and KPI calculations
 */
export const getAllInvoices = async (
  filters?: {
    status?: string;
    paymentStatus?: string;
    salesChannel?: string;
    search?: string;
    timeRange?: string;
    startDate?: string;
    endDate?: string;
  },
  pagination?: PaginationParams
) => {
  await seedInitialInvoices();

  const whereClause: any = {};

  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }

  if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
    whereClause.paymentStatus = filters.paymentStatus;
  }

  if (filters?.salesChannel && filters.salesChannel !== "ALL") {
    whereClause.salesChannel = filters.salesChannel;
  }

  // Date range filter on invoiceDate
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.invoiceDate = dateFilter;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { invoiceNumber: { contains: term, mode: "insensitive" } },
      { buyerName: { contains: term, mode: "insensitive" } },
      { externalOrderId: { contains: term, mode: "insensitive" } },
      { buyerEmail: { contains: term, mode: "insensitive" } },
    ];
  }

  // Count total items matching the search / filter criteria
  const totalItems = await prisma.invoice.count({
    where: whereClause,
  });

  // Calculate live KPI summary metrics based on filtered invoices
  const allFilteredInvoices = await prisma.invoice.findMany({
    where: whereClause,
    select: {
      grandTotal: true,
      amountPaid: true,
      balanceDue: true,
      paymentStatus: true,
    },
  });

  const totalCount = allFilteredInvoices.length;
  const totalValue = allFilteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const paidInvoices = allFilteredInvoices.filter((inv) => inv.paymentStatus === "PAID");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  const pendingInvoices = allFilteredInvoices.filter(
    (inv) => inv.paymentStatus === "PENDING" || inv.paymentStatus === "PARTIALLY_PAID"
  );
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const overdueInvoices = allFilteredInvoices.filter((inv) => inv.paymentStatus === "OVERDUE");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const kpi = {
    totalCount,
    totalInvoices: totalCount,
    totalValue: Math.round(totalValue * 100) / 100,
    totalRevenue: Math.round(totalValue * 100) / 100,
    paidCount: paidInvoices.length,
    totalPaid: Math.round(totalPaid * 100) / 100,
    paidAmount: Math.round(totalPaid * 100) / 100,
    pendingCount: pendingInvoices.length,
    totalPending: Math.round(totalPending * 100) / 100,
    pendingAmount: Math.round(totalPending * 100) / 100,
    overdueCount: overdueInvoices.length,
    totalOverdue: Math.round(totalOverdue * 100) / 100,
    overdueAmount: Math.round(totalOverdue * 100) / 100,
  };

  const invoices = await prisma.invoice.findMany({
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
    invoices,
    pagination: paginationMeta,
    kpi,
  };
};

/**
 * Retrieves a single invoice by ID
 */
export const getInvoiceById = async (id: number) => {
  await seedInitialInvoices();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    const error: any = new Error("Invoice not found");
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

/**
 * Creates a new invoice and decrements stock if issued
 */
export const createInvoice = async (data: CreateInvoiceInput) => {
  const invoiceNumber = data.invoiceNumber || (await generateNextInvoiceNumber());

  // Resolve warehouse name if warehouseId provided
  let warehouseName = data.warehouseName;
  if (data.warehouseId && !warehouseName) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    warehouseName = wh?.name || "Main Warehouse";
  }

  // Auto-resolve items: sku, productName, unitPrice from product table if omitted
  const resolvedItems = await Promise.all(
    data.items.map(async (item, index) => {
      let sku = item.sku;
      let productName = item.productName;
      let unitPrice = item.unitPrice;

      if (!sku || !productName || unitPrice === undefined) {
        const prod = await prisma.product.findUnique({
          where: { id: Number(item.productId) },
        });
        if (prod) {
          sku = sku || prod.sku;
          productName = productName || prod.name;
          unitPrice = unitPrice !== undefined ? unitPrice : prod.sellingPrice;
        }
      }

      const price = Number(unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const quantity = Number(item.quantity) || 1;
      const lineTotal =
        item.lineTotal !== undefined
          ? Number(item.lineTotal)
          : Math.max(0, quantity * price - discount);

      return {
        id: item.id || index + 1,
        productId: Number(item.productId),
        sku: sku || `SKU-${item.productId}`,
        productName: productName || `Product ${item.productId}`,
        quantity,
        unitPrice: price,
        discount,
        taxRate: Number(item.taxRate) || 8.25,
        lineTotal,
      };
    })
  );

  const calculatedSubtotal = resolvedItems.reduce((acc, it) => acc + it.lineTotal, 0);
  const subtotal = data.subtotal ?? calculatedSubtotal;
  const discountTotal = data.discountTotal ?? 0;
  const taxTotal = data.taxTotal ?? 0;
  const shippingCharges = data.shippingCharges ?? 0;
  const additionalCharges = data.additionalCharges ?? 0;

  const grandTotal =
    data.grandTotal ??
    Math.max(
      0,
      subtotal - discountTotal + taxTotal + shippingCharges + additionalCharges
    );

  const amountPaid = data.amountPaid ?? 0;
  const balanceDue =
    data.balanceDue ?? Math.max(0, grandTotal - amountPaid);

  let paymentStatus = data.paymentStatus;
  if (!paymentStatus) {
    if (amountPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = "PAID";
    } else if (amountPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    } else {
      paymentStatus = "PENDING";
    }
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      salesChannel: data.salesChannel || data.salesChannelName || "Website",
      externalOrderId: data.externalOrderId || null,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail || null,
      buyerPhone: data.buyerPhone || null,
      billingAddress: data.billingAddress || null,
      shippingAddress: data.shippingAddress || null,
      warehouseId: data.warehouseId || null,
      warehouseName: warehouseName || null,
      items: resolvedItems,
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharges,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentStatus,
      paymentMethod: data.paymentMethod || null,
      status: data.status || "ISSUED",
      notes: data.notes || null,
      termsAndConditions: data.termsAndConditions || null,
    },
  });

  // If status is ISSUED, automatically decrement warehouse inventory stock
  if (invoice.status === "ISSUED") {
    for (const item of resolvedItems) {
      if (item.productId && item.quantity > 0) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } catch {
          // Ignore if product is not found in master
        }
      }
    }
  }

  return invoice;
};

/**
 * Updates an existing invoice and adjusts inventory if status transitions
 */
export const updateInvoice = async (id: number, data: UpdateInvoiceInput) => {
  const existing = await getInvoiceById(id);

  // If warehouseId updated without warehouseName, resolve it
  let warehouseName = data.warehouseName;
  if (data.warehouseId && !warehouseName) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    warehouseName = wh?.name || existing.warehouseName || undefined;
  }

  // If items updated, resolve product details
  let resolvedItems = data.items;
  if (Array.isArray(data.items)) {
    resolvedItems = await Promise.all(
      data.items.map(async (item: any, index: number) => {
        let sku = item.sku;
        let productName = item.productName;
        let unitPrice = item.unitPrice;

        if (!sku || !productName || unitPrice === undefined) {
          const prod = await prisma.product.findUnique({
            where: { id: Number(item.productId) },
          });
          if (prod) {
            sku = sku || prod.sku;
            productName = productName || prod.name;
            unitPrice = unitPrice !== undefined ? unitPrice : prod.sellingPrice;
          }
        }

        const price = Number(unitPrice) || 0;
        const discount = Number(item.discount) || 0;
        const quantity = Number(item.quantity) || 1;
        const lineTotal =
          item.lineTotal !== undefined
            ? Number(item.lineTotal)
            : Math.max(0, quantity * price - discount);

        return {
          id: item.id || index + 1,
          productId: Number(item.productId),
          sku: sku || `SKU-${item.productId}`,
          productName: productName || `Product ${item.productId}`,
          quantity,
          unitPrice: price,
          discount,
          taxRate: Number(item.taxRate) || 8.25,
          lineTotal,
        };
      })
    );
  }

  const subtotal =
    data.subtotal ??
    (resolvedItems
      ? resolvedItems.reduce((acc: number, it: any) => acc + it.lineTotal, 0)
      : existing.subtotal);
  const discountTotal =
    data.discountTotal !== undefined ? data.discountTotal : existing.discountTotal;
  const taxTotal =
    data.taxTotal !== undefined ? data.taxTotal : existing.taxTotal;
  const shippingCharges =
    data.shippingCharges !== undefined ? data.shippingCharges : existing.shippingCharges;
  const additionalCharges =
    data.additionalCharges !== undefined ? data.additionalCharges : existing.additionalCharges;

  const grandTotal =
    data.grandTotal ??
    Math.max(
      0,
      subtotal - discountTotal + taxTotal + shippingCharges + additionalCharges
    );

  const amountPaid =
    data.amountPaid !== undefined ? data.amountPaid : existing.amountPaid;
  const balanceDue =
    data.balanceDue ?? Math.max(0, grandTotal - amountPaid);

  let paymentStatus = data.paymentStatus ?? existing.paymentStatus;
  if (!data.paymentStatus && data.amountPaid !== undefined) {
    if (amountPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = "PAID";
    } else if (amountPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    } else {
      paymentStatus = "PENDING";
    }
  }

  // If status transitioned from ISSUED to CANCELLED, restore product stock
  if (existing.status === "ISSUED" && data.status === "CANCELLED") {
    const items = existing.items as Array<{
      productId: number;
      quantity: number;
    }>;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          } catch {
            // Ignore
          }
        }
      }
    }
  }

  // If status transitioned from DRAFT to ISSUED, decrement product stock
  if (existing.status === "DRAFT" && data.status === "ISSUED") {
    const items = (resolvedItems || existing.items) as Array<{
      productId: number;
      quantity: number;
    }>;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          } catch {
            // Ignore
          }
        }
      }
    }
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...(data.invoiceNumber && { invoiceNumber: data.invoiceNumber }),
      ...(data.invoiceDate && { invoiceDate: new Date(data.invoiceDate) }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.salesChannel && { salesChannel: data.salesChannel }),
      ...(data.externalOrderId !== undefined && {
        externalOrderId: data.externalOrderId || null,
      }),
      ...(data.buyerName && { buyerName: data.buyerName }),
      ...(data.buyerEmail !== undefined && {
        buyerEmail: data.buyerEmail || null,
      }),
      ...(data.buyerPhone !== undefined && {
        buyerPhone: data.buyerPhone || null,
      }),
      ...(data.billingAddress !== undefined && {
        billingAddress: data.billingAddress || null,
      }),
      ...(data.shippingAddress !== undefined && {
        shippingAddress: data.shippingAddress || null,
      }),
      ...(data.warehouseId !== undefined && {
        warehouseId: data.warehouseId,
      }),
      ...(warehouseName && {
        warehouseName,
      }),
      ...(resolvedItems && { items: resolvedItems }),
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharges,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentStatus,
      ...(data.paymentMethod !== undefined && {
        paymentMethod: data.paymentMethod,
      }),
      ...(data.status && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.termsAndConditions !== undefined && {
        termsAndConditions: data.termsAndConditions,
      }),
    },
  });

  return updated;
};

/**
 * Deletes an invoice by ID
 */
export const deleteInvoice = async (id: number) => {
  await getInvoiceById(id);

  await prisma.invoice.delete({
    where: { id },
  });

  return { message: "Invoice deleted successfully" };
};
