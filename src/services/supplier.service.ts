import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";

const initialSuppliers = [
  {
    supplierCode: "SUP-001",
    supplierType: "BUSINESS",
    companyName: "Appalachian Hardwood Mills",
    contactPerson: "Robert Sterling",
    email: "orders@appalachianhardwoods.com",
    phone: "(828) 555-0182",
    alternatePhone: "(828) 555-0183",
    taxId: "56-8941235",
    paymentTerms: "Net 30",
    openingBalance: 0,
    addressLine1: "142 Lumber Mill Rd",
    addressLine2: "Bldg 4",
    city: "Asheville",
    state: "NC",
    postalCode: "28801",
    country: "United States",
    notes: "Primary supplier of kiln-dried solid walnut and white oak slabs for dining tables.",
    status: "ACTIVE",
  },
  {
    supplierCode: "SUP-002",
    supplierType: "BUSINESS",
    companyName: "Heritage Loom & Textile Co.",
    contactPerson: "Margaret Vance",
    email: "m.vance@heritagetextiles.com",
    phone: "(864) 555-0144",
    alternatePhone: "",
    taxId: "57-1239874",
    paymentTerms: "Net 30",
    openingBalance: 0,
    addressLine1: "500 Weaver Way",
    addressLine2: "",
    city: "Greenville",
    state: "SC",
    postalCode: "29601",
    country: "United States",
    notes: "Supplier of Belgian linen and combed organic cotton textiles for bedding & cushions.",
    status: "ACTIVE",
  },
  {
    supplierCode: "SUP-003",
    supplierType: "BUSINESS",
    companyName: "Piedmont Brass & Metals",
    contactPerson: "David Zhao",
    email: "sales@piedmontbrass.com",
    phone: "(704) 555-0199",
    alternatePhone: "",
    taxId: "56-3456789",
    paymentTerms: "Net 15",
    openingBalance: 0,
    addressLine1: "820 Foundry St",
    addressLine2: "Suite 12",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202",
    country: "United States",
    notes: "Precision hardware pulls, brass table footings, and architectural lighting metal components.",
    status: "ACTIVE",
  },
  {
    supplierCode: "SUP-004",
    supplierType: "BUSINESS",
    companyName: "Carolina Cushion & Foam",
    contactPerson: "Sarah Jenkins",
    email: "s.jenkins@carolinafoam.com",
    phone: "(336) 555-0167",
    alternatePhone: "(336) 555-0168",
    taxId: "56-9876543",
    paymentTerms: "Due on Receipt",
    openingBalance: 0,
    addressLine1: "310 Upholstery Lane",
    addressLine2: "",
    city: "High Point",
    state: "NC",
    postalCode: "27260",
    country: "United States",
    notes: "High-density CertiPUR-US polyurethane foam inserts and down-blend sofa cushion cores.",
    status: "ACTIVE",
  },
  {
    supplierCode: "SUP-005",
    supplierType: "BUSINESS",
    companyName: "Blue Ridge Ceramic & Pottery",
    contactPerson: "Elena Vasquez",
    email: "elena@blueridgeceramics.com",
    phone: "(828) 555-0133",
    alternatePhone: "",
    taxId: "56-7412589",
    paymentTerms: "Net 30",
    openingBalance: 0,
    addressLine1: "74 Kiln Road",
    addressLine2: "",
    city: "Boone",
    state: "NC",
    postalCode: "28607",
    country: "United States",
    notes: "Handcrafted stoneware tabletop accessories, ceramic lamp bases, and terracotta planters.",
    status: "ACTIVE",
  },
];

// Retrieve all suppliers with filters, pagination, and KPI summary
export const getAllSuppliers = async (
  filters?: {
    search?: string;
    status?: string;
  },
  pagination?: PaginationParams
) => {
  const existingCount = await prisma.supplier.count();
  if (existingCount === 0) {
    await prisma.supplier.createMany({
      data: initialSuppliers,
      skipDuplicates: true,
    });
  }

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

