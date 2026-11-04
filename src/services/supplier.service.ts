import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";

// Retrieve all suppliers with filters, pagination, and KPI summary
export const getAllSuppliers = async (
  filters?: {
    search?: string;
    status?: string;
  },
  pagination?: PaginationParams
) => {
  const where: any = {};

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.search) {
    const term = filters.search.trim();
    where.OR = [
      { companyName: { contains: term, mode: "insensitive" } },
      { supplierCode: { contains: term, mode: "insensitive" } },
      { contactPerson: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const allFiltered = await prisma.supplier.findMany({
    where,
    orderBy: { id: "asc" },
  });

  const totalSuppliers = allFiltered.length;
  const activeSuppliers = allFiltered.filter((s) => s.status === "ACTIVE").length;
  const inactiveSuppliers = allFiltered.filter((s) => s.status === "INACTIVE").length;
  const totalOpeningBalance = allFiltered.reduce(
    (sum, s) => sum + (s.openingBalance || 0),
    0
  );

  const kpi = {
    totalSuppliers,
    activeSuppliers,
    inactiveSuppliers,
    totalOpeningBalance: Math.round(totalOpeningBalance * 100) / 100,
  };

  const totalItems = allFiltered.length;
  let pagedSuppliers = allFiltered;
  if (pagination && pagination.isPaginated) {
    pagedSuppliers = allFiltered.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    suppliers: pagedSuppliers,
    pagination: paginationMeta,
    kpi,
  };
};

// Retrieve single supplier by ID
export const getSupplierById = async (id: number) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    const error: any = new Error("Supplier not found");
    error.statusCode = 404;
    throw error;
  }

  return supplier;
};

// Create a new supplier
export const createSupplier = async (data: {
  supplierCode: string;
  supplierType?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  taxId?: string;
  paymentTerms?: string;
  openingBalance?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  notes?: string;
  status?: string;
}) => {
  const existing = await prisma.supplier.findUnique({
    where: { supplierCode: data.supplierCode },
  });

  if (existing) {
    const error: any = new Error(`Supplier with code '${data.supplierCode}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  const supplier = await prisma.supplier.create({
    data: {
      supplierCode: data.supplierCode,
      supplierType: data.supplierType || "BUSINESS",
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      alternatePhone: data.alternatePhone || "",
      taxId: data.taxId || "",
      paymentTerms: data.paymentTerms || "Net 30",
      openingBalance: data.openingBalance ?? 0,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || "",
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country || "United States",
      notes: data.notes || "",
      status: data.status || "ACTIVE",
    },
  });

  return supplier;
};

// Update an existing supplier
export const updateSupplier = async (
  id: number,
  data: {
    supplierCode?: string;
    supplierType?: string;
    companyName?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    taxId?: string;
    paymentTerms?: string;
    openingBalance?: number;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    notes?: string;
    status?: string;
  }
) => {
  await getSupplierById(id);

  if (data.supplierCode) {
    const duplicate = await prisma.supplier.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { supplierCode: data.supplierCode },
        ],
      },
    });

    if (duplicate) {
      const error: any = new Error(`Supplier code '${data.supplierCode}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data,
  });

  return updated;
};

// Delete a supplier
export const deleteSupplier = async (id: number) => {
  await getSupplierById(id);

  await prisma.supplier.delete({
    where: { id },
  });

  return { id };
};

