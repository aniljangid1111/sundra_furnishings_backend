import { prisma } from "../database/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";

// Register/Create a new user account (Admin action - No token generated)
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "EMPLOYEE" = "EMPLOYEE"
) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error: any = new Error("Email already registered with another account");
    error.statusCode = 409;
    throw error;
  }

  // Hash password using Argon2 (High-security US standard)
  const hashedPassword = await hashPassword(password);

  // Persist user record in database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Return created user profile only (NO session token)
  return user;
};

// Login user and return JWT authentication token
export const loginUser = async (email: string, password: string) => {
  // Find user by unique email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Check if account is active
  if (!user.isActive) {
    const error: any = new Error("Account is suspended. Please contact administrator.");
    error.statusCode = 403;
    throw error;
  }

  // Verify Argon2 hashed password
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate signed JWT token with minimal payload (userId, email, role)
  const effectiveRole =
    user.roleId === "role-admin" || user.role === "ADMIN"
      ? "ADMIN"
      : user.role;

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: effectiveRole,
  });

  // Return clean user profile with token
  const userProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role, // "ADMIN"
    roleTitle: user.roleTitle || "Administrator",
    roleId: user.roleId || "role-admin",
    status: user.status,
    isActive: user.isActive,
    requirePasswordChange: user.requirePasswordChange,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: userProfile, token };
};

// Get current authenticated user profile
export const getCurrentUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
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
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    role: user.roleTitle || user.role,
  };
};
