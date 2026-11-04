import { prisma } from "../database/prisma";
import { parseDateRangeFilter } from "../utils/dateFilter";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";

/**
 * Computes high-level business metrics for dashboard overview & insights with date range filtering
 */
export const getDashboardInsights = async (filters?: {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );

  // 1. Invoices metrics
  const invoiceWhere: any = {
    status: { not: "CANCELLED" },
  };
  if (dateFilter) {
    invoiceWhere.invoiceDate = dateFilter;
  }

  const invoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    orderBy: { createdAt: "desc" },
  });

  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const outstandingAmount = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // 2. Purchases metrics
  const purchaseWhere: any = {
    status: { not: "CANCELLED" },
  };
  if (dateFilter) {
    purchaseWhere.purchaseDate = dateFilter;
  }

  const purchases = await prisma.purchase.findMany({
    where: purchaseWhere,
    orderBy: { createdAt: "desc" },
  });

  const totalPurchasesCost = purchases.reduce((sum, po) => sum + po.grandTotal, 0);

  // 3. Inventory & Products metrics
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  const totalProducts = products.length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.stock * p.costPrice,
    0
  );

  // 4. Calculate COGS (Cost of Goods Sold) and Gross Profit
  let totalCostOfGoodsSold = 0;
  const productSalesMap: Record<
    number,
    { unitsSold: number; revenue: number }
  > = {};

  for (const inv of invoices) {
    const items = inv.items as any[];
    if (Array.isArray(items)) {
      for (const item of items) {
        const prod = products.find((p) => p.id === Number(item.productId));
        const costPrice = prod ? prod.costPrice : 0;
        const qty = Number(item.quantity) || 0;
        const lineTotal = Number(item.lineTotal) || qty * (item.unitPrice || 0);

        totalCostOfGoodsSold += qty * costPrice;

        if (item.productId) {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = { unitsSold: 0, revenue: 0 };
          }
          productSalesMap[item.productId].unitsSold += qty;
          productSalesMap[item.productId].revenue += lineTotal;
        }
      }
    }
  }

  const grossProfit = Math.max(0, totalSales - totalCostOfGoodsSold);

  // 5. Best selling products ranked
  const bestSellingProducts = products
    .map((prod) => {
      const sales = productSalesMap[prod.id] || { unitsSold: 0, revenue: 0 };
      const costOfSold = sales.unitsSold * prod.costPrice;
      const profit = Math.max(0, sales.revenue - costOfSold);
      const marginPercent =
        sales.revenue > 0 ? Math.round((profit / sales.revenue) * 100) : 0;

      return {
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category?.name || "Uncategorized",
        unitsSold: sales.unitsSold,
        revenue: Math.round(sales.revenue * 100) / 100,
        costPrice: prod.costPrice,
        profit: Math.round(profit * 100) / 100,
        marginPercent,
        onHandStock: prod.stock,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 6. Sales Channel breakdown
  const channelData: Record<string, { value: number; orders: number }> = {};
  for (const inv of invoices) {
    const channel = inv.salesChannel || "Website";
    if (!channelData[channel]) {
      channelData[channel] = { value: 0, orders: 0 };
    }
    channelData[channel].value += inv.grandTotal;
    channelData[channel].orders += 1;
  }

  const channelBreakdown = Object.entries(channelData).map(([name, data]) => ({
    name,
    value: Math.round(data.value * 100) / 100,
    orders: data.orders,
  }));

  // 7. Category Revenue breakdown
  const categoryData: Record<string, { revenue: number; units: number }> = {};
  for (const inv of invoices) {
    const items = inv.items as any[];
    if (Array.isArray(items)) {
      for (const item of items) {
        const prod = products.find((p) => p.id === Number(item.productId));
        const cat = prod?.category?.name || "Other";
        if (!categoryData[cat]) {
          categoryData[cat] = { revenue: 0, units: 0 };
        }
        categoryData[cat].revenue += Number(item.lineTotal) || 0;
        categoryData[cat].units += Number(item.quantity) || 0;
      }
    }
  }

  const categoryBreakdown = Object.entries(categoryData).map(
    ([category, data]) => ({
      category,
      revenue: Math.round(data.revenue * 100) / 100,
      units: data.units,
      percentage:
        totalSales > 0 ? Math.round((data.revenue / totalSales) * 100) : 0,
    })
  );

  // 8. Monthly trends: dynamically aggregate past 6 months from actual database invoices & purchases
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();

  const monthBuckets: { month: string; year: number; monthIdx: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
      monthIdx: d.getMonth(),
    });
  }

  const monthlyTrends = monthBuckets.map(({ month, year, monthIdx }) => {
    // Sum real invoices belonging to this calendar month
    const monthInvoices = invoices.filter((inv) => {
      const d = new Date(inv.invoiceDate || inv.createdAt);
      return d.getFullYear() === year && d.getMonth() === monthIdx;
    });

    // Sum real purchases belonging to this calendar month
    const monthPurchases = purchases.filter((po) => {
      const d = new Date(po.purchaseDate || po.createdAt);
      return d.getFullYear() === year && d.getMonth() === monthIdx;
    });

    const revenue = monthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.grandTotal) || 0),
      0
    );
    const cost = monthPurchases.reduce(
      (sum, po) => sum + (Number(po.grandTotal) || 0),
      0
    );
    const profit = Math.max(0, revenue - cost);

    return {
      month,
      revenue: Math.round(revenue * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    };
  });

  return {
    kpi: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      totalCostOfGoodsSold: Math.round(totalCostOfGoodsSold * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitMarginPercent:
        totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      totalProducts,
      totalInvoices: invoices.length,
      totalPurchases: purchases.length,
      totalPurchasesCost: Math.round(totalPurchasesCost * 100) / 100,
    },
    monthlyTrends,
    channelBreakdown,
    categoryBreakdown,
    bestSellingProducts,
    recentInvoices: invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      buyerName: inv.buyerName,
      date: inv.invoiceDate,
      amount: inv.grandTotal,
      status: inv.paymentStatus,
    })),
  };
};

/**
 * Generates structured downloadable and filterable accounting reports
 */
export const getFinancialReports = async (
  type: string,
  filters?: any,
  pagination?: PaginationParams
) => {
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );

  if (type === "sales") {
    const whereClause: any = {};
    if (dateFilter) whereClause.invoiceDate = dateFilter;
    if (filters?.status && filters.status !== "ALL") whereClause.status = filters.status;
    if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
      whereClause.paymentStatus = filters.paymentStatus;
    }

    const totalItems = await prisma.invoice.count({ where: whereClause });
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { invoiceDate: "desc" },
      ...(pagination && pagination.isPaginated && {
        skip: pagination.skip,
        take: pagination.limit,
      }),
    });

    const paginationMeta = pagination
      ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
      : buildPaginationMetadata(totalItems, 1, totalItems || 1);

    return {
      reportType: "sales",
      pagination: paginationMeta,
      data: invoices,
    };
  }

  if (type === "purchases") {
    const whereClause: any = {};
    if (dateFilter) whereClause.purchaseDate = dateFilter;
    if (filters?.status && filters.status !== "ALL") whereClause.status = filters.status;

    const totalItems = await prisma.purchase.count({ where: whereClause });
    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      orderBy: { purchaseDate: "desc" },
      ...(pagination && pagination.isPaginated && {
        skip: pagination.skip,
        take: pagination.limit,
      }),
    });

    const paginationMeta = pagination
      ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
      : buildPaginationMetadata(totalItems, 1, totalItems || 1);

    return {
      reportType: "purchases",
      pagination: paginationMeta,
      data: purchases,
    };
  }

  if (type === "inventory") {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: "asc" },
    });
    const mapped = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category?.name || "Uncategorized",
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      inventoryValue: Math.round(p.stock * p.costPrice * 100) / 100,
      reorderLevel: p.reorderLevel,
      status: p.stock <= p.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
    }));

    const totalItems = mapped.length;
    const paged =
      pagination && pagination.isPaginated
        ? mapped.slice(pagination.skip, pagination.skip + pagination.limit)
        : mapped;

    const paginationMeta = pagination
      ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
      : buildPaginationMetadata(totalItems, 1, totalItems || 1);

    return {
      reportType: "inventory",
      pagination: paginationMeta,
      data: paged,
    };
  }

  if (type === "tax") {
    const invoiceWhere: any = { status: { not: "CANCELLED" } };
    const purchaseWhere: any = { status: { not: "CANCELLED" } };
    if (dateFilter) {
      invoiceWhere.invoiceDate = dateFilter;
      purchaseWhere.purchaseDate = dateFilter;
    }

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
    });
    const purchases = await prisma.purchase.findMany({
      where: purchaseWhere,
    });

    const taxCollected = invoices.reduce((sum, inv) => sum + inv.taxTotal, 0);
    const taxPaid = purchases.reduce((sum, po) => sum + po.tax, 0);
    const netTaxPayable = Math.max(0, taxCollected - taxPaid);

    return {
      reportType: "tax",
      data: {
        taxCollected: Math.round(taxCollected * 100) / 100,
        taxPaid: Math.round(taxPaid * 100) / 100,
        netTaxPayable: Math.round(netTaxPayable * 100) / 100,
        invoicesCount: invoices.length,
        purchasesCount: purchases.length,
      },
    };
  }

  if (type === "profit-loss") {
    const insights = await getDashboardInsights({
      timeRange: filters?.timeRange,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
    });
    return {
      reportType: "profit-loss",
      data: {
        grossRevenue: insights.kpi.totalSales,
        cogs: insights.kpi.totalCostOfGoodsSold,
        grossProfit: insights.kpi.grossProfit,
        marginPercent: insights.kpi.profitMarginPercent,
        outstandingReceivables: insights.kpi.outstandingAmount,
      },
    };
  }

  return { message: "Unknown report type" };
};

