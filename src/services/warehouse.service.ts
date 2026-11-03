import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";

const initialWarehouses = [
  {
    warehouseCode: "WH-01",
    name: "Central Distribution Center (CDC)",
    address: "4800 E 48th Ave, Bay 6",
    city: "Denver",
    state: "CO",
    postalCode: "80216",
    country: "United States",
    status: "ACTIVE",
    notes: "Main cross-docking and inventory storage hub for solid wood dining and living furniture.",
  },
  {
    warehouseCode: "WH-02",
    name: "East Coast Logistics Hub",
    address: "100 Northern Ave, Berth 4",
    city: "Boston",
    state: "MA",
    postalCode: "02210",
    country: "United States",
    status: "ACTIVE",
    notes: "Serving Northeast residential orders, designer direct shipments, and retail replenishment.",
  },
  {
    warehouseCode: "WH-03",
    name: "West Coast Fulfillment Center",
    address: "3200 Airport Way S, Dock 12",
    city: "Seattle",
    state: "WA",
    postalCode: "98134",
    country: "United States",
    status: "ACTIVE",
    notes: "Specialized in lighting fixtures, textiles, bedding stock, and imported decor accessories.",
  },
];

// Retrieve all warehouses with filters, pagination, and KPI summary
export const getAllWarehouses = async (
  filters?: {
    search?: string;
    status?: string;
  },
  pagination?: PaginationParams
) => {
  const existingCount = await prisma.warehouse.count();
  if (existingCount === 0) {
    await prisma.warehouse.createMany({
      data: initialWarehouses,
      skipDuplicates: true,
    });
  }

  const whereClause: any = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { warehouseCode: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { state: { contains: term, mode: "insensitive" } },
    ];
  }

  const allFiltered = await prisma.warehouse.findMany({
    where: whereClause,
    orderBy: { id: "asc" },
  });

  const totalWarehouses = allFiltered.length;
  const activeWarehouses = allFiltered.filter((w) => w.status === "ACTIVE").length;
  const inactiveWarehouses = allFiltered.filter((w) => w.status === "INACTIVE").length;

  const kpi = {
    totalWarehouses,
    activeWarehouses,
    inactiveWarehouses,
  };

  const totalItems = allFiltered.length;
  let pagedWarehouses = allFiltered;
  if (pagination && pagination.isPaginated) {
    pagedWarehouses = allFiltered.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    warehouses: pagedWarehouses,
    pagination: paginationMeta,
    kpi,
  };
};

// Retrieve single warehouse by ID
export const getWarehouseById = async (id: number) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!warehouse) {
    const error: any = new Error("Warehouse facility not found");
    error.statusCode = 404;
    throw error;
  }

  return warehouse;
};

// Create a new warehouse
export const createWarehouse = async (data: {
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  status?: string;
  notes?: string;
}) => {
  const existing = await prisma.warehouse.findUnique({
    where: { warehouseCode: data.warehouseCode },
  });

  if (existing) {
    const error: any = new Error(`Warehouse with code '${data.warehouseCode}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      warehouseCode: data.warehouseCode,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country || "United States",
      status: data.status || "ACTIVE",
      notes: data.notes || "",
    },
  });

  return warehouse;
};

// Update an existing warehouse
export const updateWarehouse = async (
  id: number,
  data: {
    warehouseCode?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    status?: string;
    notes?: string;
  }
) => {
  await getWarehouseById(id);

  if (data.warehouseCode) {
    const duplicate = await prisma.warehouse.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { warehouseCode: data.warehouseCode },
        ],
      },
    });

    if (duplicate) {
      const error: any = new Error(`Warehouse code '${data.warehouseCode}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.warehouse.update({
    where: { id },
    data,
  });

  return updated;
};

// Delete a warehouse
export const deleteWarehouse = async (id: number) => {
  await getWarehouseById(id);

  await prisma.warehouse.delete({
    where: { id },
  });

  return { id };
};

