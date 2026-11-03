import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing in environment variables!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Initializing Neon Database (Clean & Single Admin)...");

  // 1. Seed Default Administrator Role (Full System Access)
  const adminRole = await prisma.role.upsert({
    where: { id: "role-admin" },
    update: {},
    create: {
      id: "role-admin",
      name: "Administrator",
      code: "ADMIN",
      description: "Full system control with administrative privileges across all modules.",
      isSystem: true,
      status: "ACTIVE",
      modules: [
        "dashboard",
        "invoices",
        "purchases",
        "inventory",
        "imports",
        "products",
        "categories",
        "sales-channels",
        "suppliers",
        "users",
        "roles",
        "reports",
        "settings",
      ],
      permissions: {
        dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        invoices: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        purchases: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        inventory: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        imports: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        products: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        categories: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        "sales-channels": { canView: true, canCreate: true, canEdit: true, canDelete: true },
        suppliers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        users: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        roles: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        reports: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        settings: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      },
    },
  });
  console.log("✅ Seeded Admin Role:", adminRole.name);

  // 2. Seed Single Clean Administrator User
  const hashedPassword = await argon2.hash("Admin@123");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sundarafurnishings.com" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      roleTitle: "Administrator",
      roleId: "role-admin",
      isActive: true,
    },
    create: {
      name: "Admin User",
      email: "admin@sundarafurnishings.com",
      password: hashedPassword,
      role: "ADMIN",
      roleTitle: "Administrator",
      roleId: "role-admin",
      status: "ACTIVE",
      initials: "AD",
      avatarBg: "bg-emerald-700 text-white",
      isActive: true,
      requirePasswordChange: false,
    },
  });
  console.log("✅ Seeded Single Clean Admin User:", adminUser.email, "(Password: Admin@123)");

  // 3. Seed Default Company Profile
  const settings = await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      companyName: "Sundara Furnishings LLC",
      corporateName: "Sundara Furnishings & Home Decor LLC",
      ein: "84-2910394",
      salesTaxPermit: "NC-DOR-098231",
      address: "4820 South Blvd, Suite 200",
      city: "Charlotte",
      state: "NC",
      zipCode: "28217",
      phone: "+1 (704) 555-0199",
      email: "billing@sundarafurnishings.com",
      defaultTaxRate: 8.25,
      taxCalculationMode: "EXCLUSIVE",
      taxLabel: "Sales Tax",
      logoUrl: "/logo.png",
    },
  });
  console.log("✅ Seeded Company Settings:", settings.companyName);

  console.log("🎉 Neon Database Ready with 100% Clean Data!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
