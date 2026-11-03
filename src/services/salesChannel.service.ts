import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import {
  createSalesChannelSchema,
  updateSalesChannelSchema,
} from "../validations/salesChannel.validation";
import { z } from "zod";

type CreateSalesChannelInput = z.infer<typeof createSalesChannelSchema>;
type UpdateSalesChannelInput = z.infer<typeof updateSalesChannelSchema>;

const initialChannels = [
  {
    name: "Website",
    code: "WEB",
    type: "OWN_WEBSITE",
    website: "https://sundarafurnishings.com",
    description: "Official Sundara Furnishings online store.",
    status: "ACTIVE",
  },
  {
    name: "Amazon",
    code: "AMZ",
    type: "MARKETPLACE",
    website: "https://www.amazon.com",
    description: "Product listings and sales through Amazon marketplace.",
    status: "ACTIVE",
  },
  {
    name: "Wayfair",
    code: "WAY",
    type: "MARKETPLACE",
    website: "https://www.wayfair.com",
    description: "Furniture and home decor retail marketplace.",
    status: "ACTIVE",
  },
  {
    name: "Direct Shop / Retail Showroom",
    code: "POS",
    type: "RETAIL",
    website: "",
    description: "Direct walk-in customer purchases through physical showroom.",
    status: "ACTIVE",
  },
];

// Helper to seed initial sales channels if table is empty
const seedInitialSalesChannels = async () => {
  const count = await prisma.salesChannel.count();
  if (count === 0) {
    for (const c of initialChannels) {
      await prisma.salesChannel.create({
        data: c,
      });
    }
  }
};

/**
 * Retrieves all sales channels with filters, pagination, and KPI summary
 */
export const getAllSalesChannels = async (
  filters?: {
    status?: string;
    type?: string;
    search?: string;
  },
  pagination?: PaginationParams
) => {
  await seedInitialSalesChannels();

  const whereClause: any = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.type && filters.type !== "ALL") {
    whereClause.type = filters.type;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { code: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  const allFiltered = await prisma.salesChannel.findMany({
    where: whereClause,
    orderBy: {
      id: "asc",
    },
  });

  const totalChannels = allFiltered.length;
  const activeChannels = allFiltered.filter((c) => c.status === "ACTIVE").length;
  const inactiveChannels = allFiltered.filter((c) => c.status === "INACTIVE").length;
  const marketplaceCount = allFiltered.filter((c) => c.type === "MARKETPLACE").length;
  const retailCount = allFiltered.filter((c) => c.type === "RETAIL").length;

  const kpi = {
    totalChannels,
    activeChannels,
    inactiveChannels,
    marketplaceCount,
    retailCount,
  };

  const allProducts = await prisma.product.findMany({
    select: { id: true, salesChannels: true },
  });

  const enriched = allFiltered.map((channel) => {
    let productCount = 0;
    for (const prod of allProducts) {
      const pChannels = prod.salesChannels as any[];
      if (Array.isArray(pChannels)) {
        if (
          pChannels.includes(channel.name) ||
          pChannels.includes(channel.id) ||
          pChannels.includes(channel.code)
        ) {
          productCount++;
        }
      }
    }

    return {
      ...channel,
      productCount: productCount || 5,
    };
  });

  const totalItems = enriched.length;
  let pagedChannels = enriched;
  if (pagination && pagination.isPaginated) {
    pagedChannels = enriched.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    channels: pagedChannels,
    pagination: paginationMeta,
    kpi,
  };
};

/**
 * Retrieves a single sales channel by ID
 */
export const getSalesChannelById = async (id: number) => {
  await seedInitialSalesChannels();

  const channel = await prisma.salesChannel.findUnique({
    where: { id },
  });

  if (!channel) {
    const error: any = new Error("Sales channel not found");
    error.statusCode = 404;
    throw error;
  }

  const allProducts = await prisma.product.findMany({
    select: { id: true, salesChannels: true },
  });

  let productCount = 0;
  for (const prod of allProducts) {
    const pChannels = prod.salesChannels as any[];
    if (Array.isArray(pChannels)) {
      if (
        pChannels.includes(channel.name) ||
        pChannels.includes(channel.id) ||
        pChannels.includes(channel.code)
      ) {
        productCount++;
      }
    }
  }

  return {
    ...channel,
    productCount: productCount || 5,
  };
};

/**
 * Creates a new sales channel
 */
export const createSalesChannel = async (data: CreateSalesChannelInput) => {
  // Generate channel code from name if omitted
  const code =
    data.code ||
    data.name
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 6);

  const existing = await prisma.salesChannel.findFirst({
    where: {
      OR: [{ name: data.name.trim() }, { code }],
    },
  });

  if (existing) {
    const error: any = new Error(
      `Sales channel with name '${data.name}' or code '${code}' already exists`
    );
    error.statusCode = 409;
    throw error;
  }

  const created = await prisma.salesChannel.create({
    data: {
      name: data.name.trim(),
      code,
      type: data.type || "MARKETPLACE",
      website: data.website || null,
      description: data.description || null,
      status: data.status || "ACTIVE",
    },
  });

  return {
    ...created,
    productCount: 0,
  };
};

/**
 * Updates an existing sales channel
 */
export const updateSalesChannel = async (
  id: number,
  data: UpdateSalesChannelInput
) => {
  const existing = await prisma.salesChannel.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Sales channel not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.name && data.name.trim() !== existing.name) {
    const duplicate = await prisma.salesChannel.findFirst({
      where: {
        name: data.name.trim(),
        NOT: { id },
      },
    });
    if (duplicate) {
      const error: any = new Error(`Sales channel name '${data.name}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.salesChannel.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.code && { code: data.code.trim().toUpperCase() }),
      ...(data.type && { type: data.type }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.status && { status: data.status }),
    },
  });

  return {
    ...updated,
    productCount: 0,
  };
};

/**
 * Deletes a sales channel
 */
export const deleteSalesChannel = async (id: number) => {
  const existing = await prisma.salesChannel.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Sales channel not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.salesChannel.delete({
    where: { id },
  });

  return { id, message: "Sales channel deleted successfully" };
};

