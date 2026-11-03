import { prisma } from "../database/prisma";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validations/role.validation";
import { z } from "zod";

type CreateRoleInput = z.infer<typeof createRoleSchema>;
type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

const initialRoles = [
  {
    id: "role-admin",
    name: "Administrator",
    code: "ADMIN",
    description: "Full access across all platform modules and configuration settings.",
    isSystem: true,
    status: "ACTIVE",
    modules: [
      "dashboard",
      "import",
      "invoice",
      "inventory",
      "inventory_alerts",
      "user_management",
      "insights",
      "quotation",
      "purchase",
      "catalogue",
      "masters",
      "role_management",
    ],
    permissions: {
      dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      import: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      invoice: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      inventory: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      inventory_alerts: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      user_management: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      insights: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      quotation: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      purchase: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      catalogue: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      masters: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      role_management: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    },
  },
  {
    id: "role-sales-mgr",
    name: "Sales Manager",
    code: "SALES_MGR",
    description: "Manages invoices, quotations, customer catalogues, and commercial insights.",
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "insights", "invoice", "quotation", "inventory", "catalogue"],
    permissions: {
      dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      insights: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      invoice: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      quotation: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      inventory: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      catalogue: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    },
  },
  {
    id: "role-purchase-exec",
    name: "Purchase Executive",
    code: "PURCHASE_EXEC",
    description: "Procurement, supplier orders, import shipments, and stock receiving.",
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "import", "purchase", "inventory", "catalogue"],
    permissions: {
      dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      import: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      purchase: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      inventory: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      catalogue: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    },
  },
  {
    id: "role-store-keeper",
    name: "Store Keeper",
    code: "STORE_KEEPER",
    description: "Physical warehouse inventory tracking, alerts, and dispatch catalogue.",
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "inventory", "inventory_alerts", "catalogue"],
    permissions: {
      dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      inventory: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      inventory_alerts: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      catalogue: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    },
  },
  {
    id: "role-accountant",
    name: "Accountant",
    code: "ACCOUNTANT",
    description: "Reconciles sales billing, purchases, tax masters, and financial reporting.",
    isSystem: false,
    status: "ACTIVE",
    modules: ["dashboard", "insights", "invoice", "purchase", "masters"],
    permissions: {
      dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      insights: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      invoice: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      purchase: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      masters: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    },
  },
];

// Helper to seed initial system roles if table is empty
const seedInitialRoles = async () => {
  const count = await prisma.role.count();
  if (count === 0) {
    for (const r of initialRoles) {
      await prisma.role.create({
        data: r,
      });
    }
  }
};

/**
 * Retrieves all user roles with dynamic userCount, filters, pagination, and KPI summary
 */
export const getAllRoles = async (
  filters?: {
    status?: string;
    search?: string;
  },
  pagination?: PaginationParams
) => {
  await seedInitialRoles();

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

  const allFiltered = await prisma.role.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "asc",
    },
  });

  const totalRoles = allFiltered.length;
  const activeRoles = allFiltered.filter((r) => r.status === "ACTIVE").length;
  const inactiveRoles = allFiltered.filter((r) => r.status === "INACTIVE").length;
  const systemRoles = allFiltered.filter((r) => r.isSystem).length;

  // Calculate dynamic user count for each role
  const enriched = await Promise.all(
    allFiltered.map(async (role) => {
      const userCount = await prisma.user.count({
        where: { roleId: role.id },
      });
      return {
        ...role,
        userCount,
      };
    })
  );

  const totalAssignedUsers = enriched.reduce((sum, r) => sum + r.userCount, 0);

  const kpi = {
    totalRoles,
    activeRoles,
    inactiveRoles,
    systemRoles,
    totalAssignedUsers,
  };

  const totalItems = enriched.length;
  let pagedRoles = enriched;
  if (pagination && pagination.isPaginated) {
    pagedRoles = enriched.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    roles: pagedRoles,
    pagination: paginationMeta,
    kpi,
  };
};

/**
 * Retrieves a single role by ID
 */
export const getRoleById = async (id: string) => {
  await seedInitialRoles();

  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    const error: any = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  const userCount = await prisma.user.count({
    where: { roleId: role.id },
  });

  return {
    ...role,
    userCount,
  };
};

/**
 * Creates a new role with automatic ID and Code generation
 */
export const createRole = async (data: CreateRoleInput) => {
  // Generate code if missing
  const code =
    data.code ||
    data.name
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]+/g, "_");

  // Check unique code or name
  const existing = await prisma.role.findFirst({
    where: {
      OR: [{ name: data.name.trim() }, { code }],
    },
  });

  if (existing) {
    const error: any = new Error(`Role with name '${data.name}' or code '${code}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  // Generate unique slug-based ID
  const id = `role-${code.toLowerCase().replace(/_/g, "-")}-${Date.now().toString().slice(-4)}`;

  const role = await prisma.role.create({
    data: {
      id,
      name: data.name.trim(),
      code,
      description: data.description || null,
      status: data.status || "ACTIVE",
      modules: data.modules || [],
      permissions: data.permissions || {},
      isSystem: false,
    },
  });

  return {
    ...role,
    userCount: 0,
  };
};

/**
 * Updates an existing role
 */
export const updateRole = async (id: string, data: UpdateRoleInput) => {
  const existing = await prisma.role.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  // If changing name, verify uniqueness
  if (data.name && data.name.trim() !== existing.name) {
    const duplicate = await prisma.role.findFirst({
      where: {
        name: data.name.trim(),
        NOT: { id },
      },
    });
    if (duplicate) {
      const error: any = new Error(`Role name '${data.name}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.role.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.code && !existing.isSystem && { code: data.code.trim().toUpperCase() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.modules && { modules: data.modules }),
      ...(data.permissions && { permissions: data.permissions }),
    },
  });

  const userCount = await prisma.user.count({
    where: { roleId: updated.id },
  });

  return {
    ...updated,
    userCount,
  };
};

/**
 * Deletes a role
 */
export const deleteRole = async (id: string) => {
  const existing = await prisma.role.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  if (existing.isSystem) {
    const error: any = new Error("Built-in system roles cannot be deleted");
    error.statusCode = 403;
    throw error;
  }

  const assignedUsersCount = await prisma.user.count({
    where: { roleId: id },
  });

  if (assignedUsersCount > 0) {
    const error: any = new Error(
      `Cannot delete role because it is currently assigned to ${assignedUsersCount} active user(s). Reassign them first.`
    );
    error.statusCode = 400;
    throw error;
  }

  await prisma.role.delete({
    where: { id },
  });

  return { id, message: "Role deleted successfully" };
};

