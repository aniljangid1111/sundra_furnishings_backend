import { prisma } from "../database/prisma";
import { hashPassword } from "../utils/password";
import {
  PaginationParams,
  buildPaginationMetadata,
} from "../utils/pagination";
import {
  createUserSchema,
  updateUserSchema,
} from "../validations/user.validation";
import { z } from "zod";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Helper to compute user initials (e.g. Aarav Rathi -> AR)
const computeInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0] ? parts[0].slice(0, 2) : "US").toUpperCase();
};

const initialUsersSeed = [
  {
    name: "Aarav Rathi",
    mobile: "+1 (704) 555-0112",
    email: "aarav@sundarafurnishings.com",
    role: "ADMIN" as const,
    roleTitle: "Administrator",
    roleId: "role-admin",
    status: "ACTIVE",
    initials: "AR",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123",
  },
  {
    name: "Maya Whitfield",
    mobile: "+1 (704) 555-0145",
    email: "maya@sundarafurnishings.com",
    role: "EMPLOYEE" as const,
    roleTitle: "Sales Manager",
    roleId: "role-sales-mgr",
    status: "ACTIVE",
    initials: "MW",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123",
  },
  {
    name: "Daniel Ochoa",
    mobile: "+1 (704) 555-0178",
    email: "daniel@sundarafurnishings.com",
    role: "EMPLOYEE" as const,
    roleTitle: "Purchase Executive",
    roleId: "role-purchase-exec",
    status: "ACTIVE",
    initials: "DO",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123",
  },
  {
    name: "Hannah Brooks",
    mobile: "+1 (704) 555-0198",
    email: "hannah@sundarafurnishings.com",
    role: "EMPLOYEE" as const,
    roleTitle: "Store Keeper",
    roleId: "role-store-keeper",
    status: "ACTIVE",
    initials: "HB",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123",
  },
  {
    name: "Marcus Chen",
    mobile: "+1 (704) 555-0133",
    email: "marcus@sundarafurnishings.com",
    role: "EMPLOYEE" as const,
    roleTitle: "Accountant",
    roleId: "role-accountant",
    status: "INACTIVE",
    initials: "MC",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123",
  },
];

// Helper to seed initial users if user table has only 0 or 1 user
const seedInitialUsers = async () => {
  const count = await prisma.user.count();
  if (count <= 1) {
    for (const u of initialUsersSeed) {
      const exists = await prisma.user.findUnique({
        where: { email: u.email },
      });
      if (!exists) {
        const hashedPassword = await hashPassword(u.password);
        await prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            mobile: u.mobile,
            password: hashedPassword,
            role: u.role,
            roleTitle: u.roleTitle,
            roleId: u.roleId,
            status: u.status,
            initials: u.initials,
            avatarBg: u.avatarBg,
            isActive: u.status === "ACTIVE",
          },
        });
      }
    }
  }
};

/**
 * Retrieves all users with pagination, filters, and KPI summary
 */
export const getAllUsers = async (
  filters?: {
    roleId?: string;
    status?: string;
    search?: string;
  },
  pagination?: PaginationParams
) => {
  await seedInitialUsers();

  const whereClause: any = {};
  if (filters?.roleId) {
    whereClause.roleId = filters.roleId;
  }
  if (filters?.status) {
    whereClause.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { mobile: { contains: term, mode: "insensitive" } },
      { roleTitle: { contains: term, mode: "insensitive" } },
    ];
  }

  // Count total items matching the search / filter criteria
  const totalItems = await prisma.user.count({
    where: whereClause,
  });

  // Calculate overall KPI summary metrics
  const allUsersForKpi = await prisma.user.findMany({
    select: { status: true, roleId: true },
  });
  const totalUsers = allUsersForKpi.length;
  const activeUsers = allUsersForKpi.filter((u) => u.status === "ACTIVE").length;
  const inactiveUsers = allUsersForKpi.filter((u) => u.status === "INACTIVE").length;
  const rolesInUseCount = new Set(
    allUsersForKpi.map((u) => u.roleId).filter(Boolean)
  ).size;

  const kpi = {
    totalUsers,
    activeUsers,
    inactiveUsers,
    rolesInUseCount,
  };

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      roleTitle: true,
      roleId: true,
      status: true,
      initials: true,
      avatarBg: true,
      requirePasswordChange: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      id: "asc",
    },
    ...(pagination && {
      skip: pagination.skip,
      take: pagination.limit,
    }),
  });

  const formattedUsers = users.map((u) => ({
    ...u,
    role: u.roleTitle, // Return human-readable role name for frontend
  }));

  const paginationMeta = pagination
    ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit)
    : buildPaginationMetadata(totalItems, 1, totalItems || 1);

  return {
    users: formattedUsers,
    pagination: paginationMeta,
    kpi,
  };
};

/**
 * Retrieves a single user by ID
 */
export const getUserById = async (id: number) => {
  await seedInitialUsers();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      roleTitle: true,
      roleId: true,
      status: true,
      initials: true,
      avatarBg: true,
      requirePasswordChange: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error: any = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    role: user.roleTitle,
  };
};

/**
 * Creates a new user account with Argon2 hashed password
 */
export const createUser = async (data: CreateUserInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    const error: any = new Error(`Email '${data.email}' is already registered`);
    error.statusCode = 409;
    throw error;
  }

  // Resolve roleTitle from Role table
  let roleTitle = data.role;
  const roleId = data.roleId || "role-admin";
  if (!roleTitle) {
    const roleRecord = await prisma.role.findUnique({
      where: { id: roleId },
    });
    roleTitle = roleRecord?.name || "Administrator";
  }

  const initials = computeInitials(data.name);
  const hashedPassword = await hashPassword(data.password);
  const status = data.status || "ACTIVE";

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile || null,
      password: hashedPassword,
      role: roleId === "role-admin" ? "ADMIN" : "EMPLOYEE",
      roleTitle,
      roleId,
      status,
      initials,
      avatarBg: data.avatarBg || "bg-emerald-700 text-white",
      requirePasswordChange: data.requirePasswordChange || false,
      isActive: status === "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      roleTitle: true,
      roleId: true,
      status: true,
      initials: true,
      avatarBg: true,
      requirePasswordChange: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...user,
    role: user.roleTitle,
  };
};

/**
 * Updates an existing user account
 */
export const updateUser = async (id: number, data: UpdateUserInput) => {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  // Check unique email if updating email
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailTaken) {
      const error: any = new Error(`Email '${data.email}' is already registered`);
      error.statusCode = 409;
      throw error;
    }
  }

  // Resolve roleTitle if roleId changed
  let roleTitle = data.role;
  const roleId = data.roleId || existing.roleId;
  if (!roleTitle && data.roleId && data.roleId !== existing.roleId) {
    const roleRecord = await prisma.role.findUnique({
      where: { id: data.roleId },
    });
    roleTitle = roleRecord?.name || existing.roleTitle;
  }

  const status = data.status || existing.status;
  const initials = data.name ? computeInitials(data.name) : existing.initials;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.email && { email: data.email.trim().toLowerCase() }),
      ...(data.mobile !== undefined && { mobile: data.mobile }),
      ...(roleId && { roleId }),
      ...(roleTitle && { roleTitle }),
      ...(roleId && {
        role: roleId === "role-admin" ? "ADMIN" : "EMPLOYEE",
      }),
      ...(data.status && {
        status,
        isActive: status === "ACTIVE",
      }),
      ...(initials && { initials }),
      ...(data.avatarBg && { avatarBg: data.avatarBg }),
      ...(data.requirePasswordChange !== undefined && {
        requirePasswordChange: data.requirePasswordChange,
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      roleTitle: true,
      roleId: true,
      status: true,
      initials: true,
      avatarBg: true,
      requirePasswordChange: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...updated,
    role: updated.roleTitle,
  };
};

/**
 * Resets user password by Administrator
 */
export const resetUserPassword = async (
  id: number,
  newPassword: string,
  requireChangeOnLogin = true
) => {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      requirePasswordChange: requireChangeOnLogin,
    },
  });

  return { message: "User password reset successfully" };
};

/**
 * Deletes a user account
 */
export const deleteUser = async (id: number) => {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    const error: any = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.user.delete({
    where: { id },
  });

  return { id, message: "User account deleted successfully" };
};

