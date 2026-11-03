const connectionString =
  "postgresql://neondb_owner:npg_U9HhQwRWM2rV@ep-red-sea-bdc6yik4.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

const sqlQueries = [
  // 1. Schema & Enums
  `CREATE SCHEMA IF NOT EXISTS "public";`,
  `DO $$ BEGIN
     CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  // 2. User Table
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "roleTitle" TEXT NOT NULL DEFAULT 'Administrator',
    "roleId" TEXT NOT NULL DEFAULT 'role-admin',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "initials" TEXT,
    "avatarBg" TEXT DEFAULT 'bg-emerald-700 text-white',
    "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  );`,

  // 3. Role Table
  `CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "modules" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
  );`,

  // 4. Setting Table
  `CREATE TABLE IF NOT EXISTS "Setting" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Sundara Furnishings LLC',
    "corporateName" TEXT NOT NULL DEFAULT 'Sundara Furnishings & Home Decor LLC',
    "ein" TEXT NOT NULL DEFAULT '84-2910394',
    "salesTaxPermit" TEXT NOT NULL DEFAULT 'NC-DOR-098231',
    "address" TEXT NOT NULL DEFAULT '4820 South Blvd, Suite 200',
    "city" TEXT NOT NULL DEFAULT 'Charlotte',
    "state" TEXT NOT NULL DEFAULT 'NC',
    "zipCode" TEXT NOT NULL DEFAULT '28217',
    "phone" TEXT NOT NULL DEFAULT '+1 (704) 555-0199',
    "email" TEXT NOT NULL DEFAULT 'billing@sundarafurnishings.com',
    "logoUrl" TEXT,
    "defaultTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 8.25,
    "taxCalculationMode" TEXT NOT NULL DEFAULT 'EXCLUSIVE',
    "taxLabel" TEXT NOT NULL DEFAULT 'Sales Tax',
    "taxSlabs" JSONB,
    "paymentTerms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
  );`,

  // 5. Category Table
  `CREATE TABLE IF NOT EXISTS "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
  );`,

  // 6. Product Table
  `CREATE TABLE IF NOT EXISTS "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "categoryId" INTEGER,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 8.25,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "imageUrl" TEXT,
    "salesChannels" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
  );`,

  // 7. Warehouse Table
  `CREATE TABLE IF NOT EXISTS "Warehouse" (
    "id" SERIAL NOT NULL,
    "warehouseCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'United States',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
  );`,

  // 8. Supplier Table
  `CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" SERIAL NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "supplierType" TEXT NOT NULL DEFAULT 'BUSINESS',
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "taxId" TEXT,
    "paymentTerms" TEXT NOT NULL DEFAULT 'Net 30',
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'United States',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
  );`,

  // 9. Purchase Table
  `CREATE TABLE IF NOT EXISTS "Purchase" (
    "id" SERIAL NOT NULL,
    "purchaseNumber" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "supplierName" TEXT NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "supplierInvoiceNumber" TEXT,
    "containerNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "additionalCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
  );`,

  // 10. Invoice Table
  `CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" SERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "salesChannel" TEXT NOT NULL DEFAULT 'Website',
    "externalOrderId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "buyerPhone" TEXT,
    "billingAddress" TEXT,
    "shippingAddress" TEXT,
    "warehouseId" INTEGER,
    "warehouseName" TEXT,
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "additionalCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "notes" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
  );`,

  // 11. SalesChannel Table
  `CREATE TABLE IF NOT EXISTS "SalesChannel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MARKETPLACE',
    "website" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesChannel_pkey" PRIMARY KEY ("id")
  );`,

  // 12. StockLedger Table
  `CREATE TABLE IF NOT EXISTS "StockLedger" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "referenceDocument" TEXT,
    "quantityChange" INTEGER NOT NULL,
    "previousBalance" INTEGER NOT NULL DEFAULT 0,
    "newBalance" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
  );`,

  // 13. ImportShipment Table
  `CREATE TABLE IF NOT EXISTS "ImportShipment" (
    "id" SERIAL NOT NULL,
    "importNumber" TEXT NOT NULL,
    "supplierId" INTEGER,
    "supplierName" TEXT,
    "supplierInvoiceNumber" TEXT,
    "purchaseId" INTEGER,
    "purchaseNumber" TEXT,
    "shipmentReference" TEXT,
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouseId" INTEGER NOT NULL DEFAULT 1,
    "warehouseName" TEXT NOT NULL DEFAULT 'Central Distribution Center (CDC)',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "items" JSONB NOT NULL,
    "expenseHeads" JSONB NOT NULL,
    "totalProductCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAdditionalCosts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLandedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "documentName" TEXT,
    "documentExtracted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportShipment_pkey" PRIMARY KEY ("id")
  );`,

  // 14. Unique Indexes
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Role_code_key" ON "Role"("code");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Category_code_key" ON "Category"("code");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Warehouse_warehouseCode_key" ON "Warehouse"("warehouseCode");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_supplierCode_key" ON "Supplier"("supplierCode");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_purchaseNumber_key" ON "Purchase"("purchaseNumber");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SalesChannel_name_key" ON "SalesChannel"("name");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SalesChannel_code_key" ON "SalesChannel"("code");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ImportShipment_importNumber_key" ON "ImportShipment"("importNumber");`,

  // 15. Seed Administrator Role
  `INSERT INTO "Role" ("id", "name", "code", "description", "isSystem", "status", "modules", "permissions", "createdAt", "updatedAt")
   VALUES (
     'role-admin',
     'Administrator',
     'ADMIN',
     'Full system control with administrative privileges across all modules.',
     true,
     'ACTIVE',
     '["dashboard", "invoices", "purchases", "inventory", "imports", "products", "categories", "sales-channels", "suppliers", "users", "roles", "reports", "settings"]'::jsonb,
     '{"dashboard": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "invoices": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "purchases": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "inventory": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "imports": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "products": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "categories": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "sales-channels": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "suppliers": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "users": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "roles": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "reports": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}, "settings": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}}'::jsonb,
     NOW(),
     NOW()
   )
   ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW();`,

  // 16. Seed Single Administrator User (admin@sundarafurnishings.com / Admin@123)
  `INSERT INTO "User" ("name", "email", "password", "role", "roleTitle", "roleId", "status", "initials", "avatarBg", "requirePasswordChange", "isActive", "createdAt", "updatedAt")
   VALUES (
     'Admin User',
     'admin@sundarafurnishings.com',
     '$argon2id$v=19$m=65536,p=4,t=3$VqUk7ZZkyXuR06v26D3C/g$fUYHS/Igz8d0WJ3HkPy7nWHYlLAQknaeJ8DcQ8WvyyI',
     'ADMIN',
     'Administrator',
     'role-admin',
     'ACTIVE',
     'AD',
     'bg-emerald-700 text-white',
     false,
     true,
     NOW(),
     NOW()
   )
   ON CONFLICT ("email") DO UPDATE SET
     "password" = EXCLUDED."password",
     "role" = 'ADMIN',
     "roleTitle" = 'Administrator',
     "roleId" = 'role-admin',
     "isActive" = true,
     "updatedAt" = NOW();`,

  // 17. Seed Default Company Settings
  `INSERT INTO "Setting" ("id", "companyName", "corporateName", "ein", "salesTaxPermit", "address", "city", "state", "zipCode", "phone", "email", "defaultTaxRate", "taxCalculationMode", "taxLabel", "logoUrl", "createdAt", "updatedAt")
   VALUES (
     1,
     'Sundara Furnishings LLC',
     'Sundara Furnishings & Home Decor LLC',
     '84-2910394',
     'NC-DOR-098231',
     '4820 South Blvd, Suite 200',
     'Charlotte',
     'NC',
     '28217',
     '+1 (704) 555-0199',
     'billing@sundarafurnishings.com',
     8.25,
     'EXCLUSIVE',
     'Sales Tax',
     '/logo.png',
     NOW(),
     NOW()
   )
   ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW();`,
];

async function executeQueries() {
  console.log("🚀 Executing DDL and Seeding on Neon via HTTP API...");

  for (let i = 0; i < sqlQueries.length; i++) {
    const q = sqlQueries[i];
    const preview = q.trim().split("\n")[0].substring(0, 50);

    const res = await fetch(
      "https://ep-red-sea-bdc6yik4.c-8.us-east-2.aws.neon.tech/sql",
      {
        method: "POST",
        headers: {
          "Neon-Connection-String": connectionString,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: q }),
      }
    );

    const json = await res.json();
    if (!res.ok) {
      console.error(`❌ Query ${i + 1} Failed [${preview}]:`, json);
      process.exit(1);
    }
    console.log(`✅ [${i + 1}/${sqlQueries.length}] Executed: ${preview}...`);
  }

  // Verify created tables
  const verifyRes = await fetch(
    "https://ep-red-sea-bdc6yik4.c-8.us-east-2.aws.neon.tech/sql",
    {
      method: "POST",
      headers: {
        "Neon-Connection-String": connectionString,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query:
          "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';",
      }),
    }
  );

  const verifyJson = await verifyRes.json();
  const tables = (verifyJson.rows || []).map((r) => r.tablename);
  console.log("🎉 NEON SETUP COMPLETED! Tables in database:", tables);

  // Verify Admin user
  const userRes = await fetch(
    "https://ep-red-sea-bdc6yik4.c-8.us-east-2.aws.neon.tech/sql",
    {
      method: "POST",
      headers: {
        "Neon-Connection-String": connectionString,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "SELECT id, name, email, role, status FROM \"User\";",
      }),
    }
  );
  const userJson = await userRes.json();
  console.log("👤 Admin User in Neon:", userJson.rows);
}

executeQueries().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});

