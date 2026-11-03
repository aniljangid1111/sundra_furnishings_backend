import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";

const initialCategories = [
  { name: "Furniture", code: "FUR", description: "Furniture products including chairs, tables and consoles." },
  { name: "Bedding", code: "BED", description: "Bedsheets, bedding sets and related products." },
  { name: "Home Decor", code: "DEC", description: "Decorative products and accessories for the home." },
  { name: "Lighting", code: "LGT", description: "Floor lamps, table lamps and other lighting products." },
  { name: "Rugs", code: "RUG", description: "Area rugs and decorative floor coverings." },
];

// Fetch all categories with search, status filters, pagination, and KPI summary
export const getAllCategories = async (
  filters?: {
    search?: string;
    status?: string;
  },
  pagination?: PaginationParams
) => {
  const existingCount = await prisma.category.count();
  if (existingCount === 0) {
    await prisma.category.createMany({
      data: initialCategories,
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
      { code: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  const allFiltered = await prisma.category.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const totalCategories = allFiltered.length;
  const activeCategories = allFiltered.filter((c) => c.status === "ACTIVE").length;
  const inactiveCategories = allFiltered.filter((c) => c.status === "INACTIVE").length;
  const totalProductCount = allFiltered.reduce(
    (sum, c) => sum + c._count.products,
    0
  );

  const kpi = {
    totalCategories,
    activeCategories,
    inactiveCategories,
    totalProductCount,
  };

  const totalItems = allFiltered.length;
  let pagedCategories = allFiltered;
  if (pagination && pagination.isPaginated) {
    pagedCategories = allFiltered.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }

  const formatted = pagedCategories.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    description: c.description,
    status: c.status,
    productCount: c._count.products,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    categories: formatted,
    pagination: paginationMeta,
    kpi,
  };
};

// Fetch single category by ID
export const getCategoryById = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    const error: any = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...category,
    productCount: category._count.products,
  };
};

// Create a new category
export const createCategory = async (data: {
  name: string;
  code: string;
  description?: string;
  status?: string;
}) => {
  // Check unique code
  const existingCode = await prisma.category.findFirst({
    where: {
      OR: [{ code: data.code }, { name: data.name }],
    },
  });

  if (existingCode) {
    const error: any = new Error("Category with this name or code already exists");
    error.statusCode = 409;
    throw error;
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description || "",
      status: data.status || "ACTIVE",
    },
  });

  return category;
};

// Update an existing category
export const updateCategory = async (
  id: number,
  data: {
    name?: string;
    code?: string;
    description?: string;
    status?: string;
  }
) => {
  await getCategoryById(id);

  // If changing name or code, verify unique
  if (data.name || data.code) {
    const duplicate = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(data.name ? [{ name: data.name }] : []),
              ...(data.code ? [{ code: data.code }] : []),
            ],
          },
        ],
      },
    });

    if (duplicate) {
      const error: any = new Error("Another category already exists with this name or code");
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data,
  });

  return updated;
};

// Delete a category
export const deleteCategory = async (id: number) => {
  await getCategoryById(id);

  // Check if products exist in category
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    const error: any = new Error(
      `Cannot delete category. There are ${productCount} products assigned to it.`
    );
    error.statusCode = 400;
    throw error;
  }

  await prisma.category.delete({
    where: { id },
  });

  return { id };
};

