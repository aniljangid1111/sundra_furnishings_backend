// src/app.ts
import express from "express";
import cors from "cors";

// src/routes/index.ts
import { Router as Router16 } from "express";

// src/routes/health.routes.ts
import { Router } from "express";

// src/database/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": '// Prisma Client generator\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\n// PostgreSQL database\ndatasource db {\n  provider = "postgresql"\n}\n\n// Application users & accounts\nmodel User {\n  id                    Int      @id @default(autoincrement())\n  name                  String\n  email                 String   @unique\n  mobile                String?\n  password              String\n  role                  UserRole @default(ADMIN)\n  roleTitle             String   @default("Administrator")\n  roleId                String   @default("role-admin")\n  status                String   @default("ACTIVE") // ACTIVE | INACTIVE\n  initials              String?\n  avatarBg              String?  @default("bg-emerald-700 text-white")\n  requirePasswordChange Boolean  @default(false)\n  isActive              Boolean  @default(true)\n  createdAt             DateTime @default(now())\n  updatedAt             DateTime @updatedAt\n}\n\n// User roles\nenum UserRole {\n  ADMIN\n  EMPLOYEE\n}\n\n// User roles & granular module permissions\nmodel Role {\n  id          String   @id // e.g. "role-admin", "role-sales-mgr" or auto-generated "role-custom-..."\n  name        String   @unique\n  code        String   @unique\n  description String?\n  isSystem    Boolean  @default(false)\n  status      String   @default("ACTIVE") // ACTIVE | INACTIVE\n  modules     Json // List of enabled module keys: ["dashboard", "invoice", ...]\n  permissions Json // Object: moduleKey -> { canView, canCreate, canEdit, canDelete }\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n}\n\n// Application business settings & company profile\nmodel Setting {\n  id                 Int      @id @default(autoincrement())\n  companyName        String   @default("Sundara Furnishings LLC")\n  corporateName      String   @default("Sundara Furnishings & Home Decor LLC")\n  ein                String   @default("84-2910394")\n  salesTaxPermit     String   @default("NC-DOR-098231")\n  address            String   @default("4820 South Blvd, Suite 200")\n  city               String   @default("Charlotte")\n  state              String   @default("NC")\n  zipCode            String   @default("28217")\n  phone              String   @default("+1 (704) 555-0199")\n  email              String   @default("billing@sundarafurnishings.com")\n  logoUrl            String?\n  defaultTaxRate     Float    @default(8.25)\n  taxCalculationMode String   @default("EXCLUSIVE")\n  taxLabel           String   @default("Sales Tax")\n  taxSlabs           Json?\n  paymentTerms       Json?\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n}\n\n// Product category master\nmodel Category {\n  id          Int       @id @default(autoincrement())\n  name        String    @unique\n  code        String    @unique\n  description String?\n  status      String    @default("ACTIVE") // ACTIVE | INACTIVE\n  products    Product[]\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n}\n\n// Product catalogue master\nmodel Product {\n  id            Int       @id @default(autoincrement())\n  name          String\n  sku           String    @unique\n  categoryId    Int?\n  category      Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)\n  uom           String    @default("PCS")\n  costPrice     Float     @default(0)\n  sellingPrice  Float     @default(0)\n  stock         Int       @default(0)\n  reorderLevel  Int       @default(10)\n  taxRate       Float     @default(8.25)\n  status        String    @default("ACTIVE") // ACTIVE | INACTIVE\n  imageUrl      String?\n  salesChannels Json?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n}\n\n// Warehouse facility master\nmodel Warehouse {\n  id            Int      @id @default(autoincrement())\n  warehouseCode String   @unique\n  name          String\n  address       String\n  city          String\n  state         String\n  postalCode    String\n  country       String   @default("United States")\n  status        String   @default("ACTIVE") // ACTIVE | INACTIVE\n  notes         String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n}\n\n// Supplier & Vendor master\nmodel Supplier {\n  id             Int      @id @default(autoincrement())\n  supplierCode   String   @unique\n  supplierType   String   @default("BUSINESS") // BUSINESS | INDIVIDUAL\n  companyName    String\n  contactPerson  String\n  email          String\n  phone          String\n  alternatePhone String?\n  taxId          String?\n  paymentTerms   String   @default("Net 30")\n  openingBalance Float    @default(0)\n  addressLine1   String\n  addressLine2   String?\n  city           String\n  state          String\n  postalCode     String\n  country        String   @default("United States")\n  notes          String?\n  status         String   @default("ACTIVE") // ACTIVE | INACTIVE\n  createdAt      DateTime @default(now())\n  updatedAt      DateTime @updatedAt\n}\n\n// Purchase order & procurement\nmodel Purchase {\n  id                    Int       @id @default(autoincrement())\n  purchaseNumber        String    @unique\n  supplierId            Int\n  supplierName          String\n  warehouseId           Int\n  warehouseName         String\n  purchaseDate          DateTime  @default(now())\n  expectedDate          DateTime?\n  supplierInvoiceNumber String?\n  containerNumber       String?\n  status                String    @default("DRAFT") // DRAFT | ORDERED | RECEIVED | CANCELLED\n  items                 Json // Array of PurchaseItem\n  subtotal              Float     @default(0)\n  discount              Float     @default(0)\n  tax                   Float     @default(0)\n  additionalCharges     Float     @default(0)\n  grandTotal            Float     @default(0)\n  amountPaid            Float     @default(0)\n  balanceDue            Float     @default(0)\n  notes                 String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n}\n\n// Sales invoice & billing\nmodel Invoice {\n  id                 Int       @id @default(autoincrement())\n  invoiceNumber      String    @unique\n  invoiceDate        DateTime  @default(now())\n  dueDate            DateTime?\n  salesChannel       String    @default("Website")\n  externalOrderId    String? // Optional online platform Order ID / Ref #\n  buyerName          String\n  buyerEmail         String?\n  buyerPhone         String?\n  billingAddress     String?\n  shippingAddress    String?\n  warehouseId        Int?\n  warehouseName      String?\n  items              Json // Array of InvoiceLineItem\n  subtotal           Float     @default(0)\n  discountTotal      Float     @default(0)\n  taxTotal           Float     @default(0)\n  shippingCharges    Float     @default(0)\n  additionalCharges  Float     @default(0)\n  grandTotal         Float     @default(0)\n  amountPaid         Float     @default(0)\n  balanceDue         Float     @default(0)\n  paymentStatus      String    @default("PENDING") // PAID | PARTIALLY_PAID | PENDING | OVERDUE\n  paymentMethod      String? // CASH | BANK_TRANSFER | CREDIT_CARD | CHECK\n  status             String    @default("ISSUED") // DRAFT | ISSUED | CANCELLED\n  notes              String?\n  termsAndConditions String?\n  createdAt          DateTime  @default(now())\n  updatedAt          DateTime  @updatedAt\n}\n\n// Sales channels & multi-channel marketplaces\nmodel SalesChannel {\n  id          Int      @id @default(autoincrement())\n  name        String   @unique\n  code        String   @unique\n  type        String   @default("MARKETPLACE") // MARKETPLACE | OWN_WEBSITE | RETAIL\n  website     String?\n  description String?\n  status      String   @default("ACTIVE") // ACTIVE | INACTIVE\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n}\n\n// Real-time stock movements & inventory ledger\nmodel StockLedger {\n  id                Int      @id @default(autoincrement())\n  date              DateTime @default(now())\n  productId         Int\n  sku               String\n  productName       String\n  warehouseId       Int\n  warehouseName     String\n  movementType      String // PURCHASE_RECEIPT | SALES_INVOICE | SALES_RETURN | PURCHASE_CORRECTION | INVENTORY_ADJUSTMENT\n  referenceDocument String? // e.g. PO-2026-001, INV-2026-001, ADJ-2026-001\n  quantityChange    Int // e.g. +25, -2\n  previousBalance   Int      @default(0)\n  newBalance        Int      @default(0)\n  notes             String?\n  createdAt         DateTime @default(now())\n}\n\n// Landed cost & overseas container imports\nmodel ImportShipment {\n  id                    Int      @id @default(autoincrement())\n  importNumber          String   @unique\n  supplierId            Int?\n  supplierName          String?\n  supplierInvoiceNumber String?\n  purchaseId            Int?\n  purchaseNumber        String?\n  shipmentReference     String? // e.g. BOL-MSC-774129\n  importDate            DateTime @default(now())\n  warehouseId           Int      @default(1)\n  warehouseName         String   @default("Central Distribution Center (CDC)")\n  status                String   @default("DRAFT") // DRAFT | PROCESSING | REVIEW_REQUIRED | COMPLETED | CANCELLED\n  items                 Json // Array of ImportItem\n  expenseHeads          Json // Array of ImportExpenseHead\n  totalProductCost      Float    @default(0)\n  totalAdditionalCosts  Float    @default(0)\n  totalLandedCost       Float    @default(0)\n  documentName          String?\n  documentExtracted     Boolean  @default(false)\n  notes                 String?\n  createdAt             DateTime @default(now())\n  updatedAt             DateTime @updatedAt\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"mobile","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"roleTitle","kind":"scalar","type":"String"},{"name":"roleId","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"initials","kind":"scalar","type":"String"},{"name":"avatarBg","kind":"scalar","type":"String"},{"name":"requirePasswordChange","kind":"scalar","type":"Boolean"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Role":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isSystem","kind":"scalar","type":"Boolean"},{"name":"status","kind":"scalar","type":"String"},{"name":"modules","kind":"scalar","type":"Json"},{"name":"permissions","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Setting":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"companyName","kind":"scalar","type":"String"},{"name":"corporateName","kind":"scalar","type":"String"},{"name":"ein","kind":"scalar","type":"String"},{"name":"salesTaxPermit","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"state","kind":"scalar","type":"String"},{"name":"zipCode","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"defaultTaxRate","kind":"scalar","type":"Float"},{"name":"taxCalculationMode","kind":"scalar","type":"String"},{"name":"taxLabel","kind":"scalar","type":"String"},{"name":"taxSlabs","kind":"scalar","type":"Json"},{"name":"paymentTerms","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"products","kind":"object","type":"Product","relationName":"CategoryToProduct"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Product":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"name","kind":"scalar","type":"String"},{"name":"sku","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"Int"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToProduct"},{"name":"uom","kind":"scalar","type":"String"},{"name":"costPrice","kind":"scalar","type":"Float"},{"name":"sellingPrice","kind":"scalar","type":"Float"},{"name":"stock","kind":"scalar","type":"Int"},{"name":"reorderLevel","kind":"scalar","type":"Int"},{"name":"taxRate","kind":"scalar","type":"Float"},{"name":"status","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"salesChannels","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Warehouse":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"warehouseCode","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"state","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Supplier":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"supplierCode","kind":"scalar","type":"String"},{"name":"supplierType","kind":"scalar","type":"String"},{"name":"companyName","kind":"scalar","type":"String"},{"name":"contactPerson","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"alternatePhone","kind":"scalar","type":"String"},{"name":"taxId","kind":"scalar","type":"String"},{"name":"paymentTerms","kind":"scalar","type":"String"},{"name":"openingBalance","kind":"scalar","type":"Float"},{"name":"addressLine1","kind":"scalar","type":"String"},{"name":"addressLine2","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"state","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Purchase":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"purchaseNumber","kind":"scalar","type":"String"},{"name":"supplierId","kind":"scalar","type":"Int"},{"name":"supplierName","kind":"scalar","type":"String"},{"name":"warehouseId","kind":"scalar","type":"Int"},{"name":"warehouseName","kind":"scalar","type":"String"},{"name":"purchaseDate","kind":"scalar","type":"DateTime"},{"name":"expectedDate","kind":"scalar","type":"DateTime"},{"name":"supplierInvoiceNumber","kind":"scalar","type":"String"},{"name":"containerNumber","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"items","kind":"scalar","type":"Json"},{"name":"subtotal","kind":"scalar","type":"Float"},{"name":"discount","kind":"scalar","type":"Float"},{"name":"tax","kind":"scalar","type":"Float"},{"name":"additionalCharges","kind":"scalar","type":"Float"},{"name":"grandTotal","kind":"scalar","type":"Float"},{"name":"amountPaid","kind":"scalar","type":"Float"},{"name":"balanceDue","kind":"scalar","type":"Float"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"Invoice":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"invoiceNumber","kind":"scalar","type":"String"},{"name":"invoiceDate","kind":"scalar","type":"DateTime"},{"name":"dueDate","kind":"scalar","type":"DateTime"},{"name":"salesChannel","kind":"scalar","type":"String"},{"name":"externalOrderId","kind":"scalar","type":"String"},{"name":"buyerName","kind":"scalar","type":"String"},{"name":"buyerEmail","kind":"scalar","type":"String"},{"name":"buyerPhone","kind":"scalar","type":"String"},{"name":"billingAddress","kind":"scalar","type":"String"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"warehouseId","kind":"scalar","type":"Int"},{"name":"warehouseName","kind":"scalar","type":"String"},{"name":"items","kind":"scalar","type":"Json"},{"name":"subtotal","kind":"scalar","type":"Float"},{"name":"discountTotal","kind":"scalar","type":"Float"},{"name":"taxTotal","kind":"scalar","type":"Float"},{"name":"shippingCharges","kind":"scalar","type":"Float"},{"name":"additionalCharges","kind":"scalar","type":"Float"},{"name":"grandTotal","kind":"scalar","type":"Float"},{"name":"amountPaid","kind":"scalar","type":"Float"},{"name":"balanceDue","kind":"scalar","type":"Float"},{"name":"paymentStatus","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"termsAndConditions","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"SalesChannel":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"website","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"StockLedger":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"productId","kind":"scalar","type":"Int"},{"name":"sku","kind":"scalar","type":"String"},{"name":"productName","kind":"scalar","type":"String"},{"name":"warehouseId","kind":"scalar","type":"Int"},{"name":"warehouseName","kind":"scalar","type":"String"},{"name":"movementType","kind":"scalar","type":"String"},{"name":"referenceDocument","kind":"scalar","type":"String"},{"name":"quantityChange","kind":"scalar","type":"Int"},{"name":"previousBalance","kind":"scalar","type":"Int"},{"name":"newBalance","kind":"scalar","type":"Int"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null},"ImportShipment":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"importNumber","kind":"scalar","type":"String"},{"name":"supplierId","kind":"scalar","type":"Int"},{"name":"supplierName","kind":"scalar","type":"String"},{"name":"supplierInvoiceNumber","kind":"scalar","type":"String"},{"name":"purchaseId","kind":"scalar","type":"Int"},{"name":"purchaseNumber","kind":"scalar","type":"String"},{"name":"shipmentReference","kind":"scalar","type":"String"},{"name":"importDate","kind":"scalar","type":"DateTime"},{"name":"warehouseId","kind":"scalar","type":"Int"},{"name":"warehouseName","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"items","kind":"scalar","type":"Json"},{"name":"expenseHeads","kind":"scalar","type":"Json"},{"name":"totalProductCost","kind":"scalar","type":"Float"},{"name":"totalAdditionalCosts","kind":"scalar","type":"Float"},{"name":"totalLandedCost","kind":"scalar","type":"Float"},{"name":"documentName","kind":"scalar","type":"String"},{"name":"documentExtracted","kind":"scalar","type":"Boolean"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null,"schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","User.findUnique","User.findUniqueOrThrow","orderBy","cursor","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_count","_avg","_sum","_min","_max","User.groupBy","User.aggregate","Role.findUnique","Role.findUniqueOrThrow","Role.findFirst","Role.findFirstOrThrow","Role.findMany","Role.createOne","Role.createMany","Role.createManyAndReturn","Role.updateOne","Role.updateMany","Role.updateManyAndReturn","Role.upsertOne","Role.deleteOne","Role.deleteMany","Role.groupBy","Role.aggregate","Setting.findUnique","Setting.findUniqueOrThrow","Setting.findFirst","Setting.findFirstOrThrow","Setting.findMany","Setting.createOne","Setting.createMany","Setting.createManyAndReturn","Setting.updateOne","Setting.updateMany","Setting.updateManyAndReturn","Setting.upsertOne","Setting.deleteOne","Setting.deleteMany","Setting.groupBy","Setting.aggregate","category","products","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Product.findUnique","Product.findUniqueOrThrow","Product.findFirst","Product.findFirstOrThrow","Product.findMany","Product.createOne","Product.createMany","Product.createManyAndReturn","Product.updateOne","Product.updateMany","Product.updateManyAndReturn","Product.upsertOne","Product.deleteOne","Product.deleteMany","Product.groupBy","Product.aggregate","Warehouse.findUnique","Warehouse.findUniqueOrThrow","Warehouse.findFirst","Warehouse.findFirstOrThrow","Warehouse.findMany","Warehouse.createOne","Warehouse.createMany","Warehouse.createManyAndReturn","Warehouse.updateOne","Warehouse.updateMany","Warehouse.updateManyAndReturn","Warehouse.upsertOne","Warehouse.deleteOne","Warehouse.deleteMany","Warehouse.groupBy","Warehouse.aggregate","Supplier.findUnique","Supplier.findUniqueOrThrow","Supplier.findFirst","Supplier.findFirstOrThrow","Supplier.findMany","Supplier.createOne","Supplier.createMany","Supplier.createManyAndReturn","Supplier.updateOne","Supplier.updateMany","Supplier.updateManyAndReturn","Supplier.upsertOne","Supplier.deleteOne","Supplier.deleteMany","Supplier.groupBy","Supplier.aggregate","Purchase.findUnique","Purchase.findUniqueOrThrow","Purchase.findFirst","Purchase.findFirstOrThrow","Purchase.findMany","Purchase.createOne","Purchase.createMany","Purchase.createManyAndReturn","Purchase.updateOne","Purchase.updateMany","Purchase.updateManyAndReturn","Purchase.upsertOne","Purchase.deleteOne","Purchase.deleteMany","Purchase.groupBy","Purchase.aggregate","Invoice.findUnique","Invoice.findUniqueOrThrow","Invoice.findFirst","Invoice.findFirstOrThrow","Invoice.findMany","Invoice.createOne","Invoice.createMany","Invoice.createManyAndReturn","Invoice.updateOne","Invoice.updateMany","Invoice.updateManyAndReturn","Invoice.upsertOne","Invoice.deleteOne","Invoice.deleteMany","Invoice.groupBy","Invoice.aggregate","SalesChannel.findUnique","SalesChannel.findUniqueOrThrow","SalesChannel.findFirst","SalesChannel.findFirstOrThrow","SalesChannel.findMany","SalesChannel.createOne","SalesChannel.createMany","SalesChannel.createManyAndReturn","SalesChannel.updateOne","SalesChannel.updateMany","SalesChannel.updateManyAndReturn","SalesChannel.upsertOne","SalesChannel.deleteOne","SalesChannel.deleteMany","SalesChannel.groupBy","SalesChannel.aggregate","StockLedger.findUnique","StockLedger.findUniqueOrThrow","StockLedger.findFirst","StockLedger.findFirstOrThrow","StockLedger.findMany","StockLedger.createOne","StockLedger.createMany","StockLedger.createManyAndReturn","StockLedger.updateOne","StockLedger.updateMany","StockLedger.updateManyAndReturn","StockLedger.upsertOne","StockLedger.deleteOne","StockLedger.deleteMany","StockLedger.groupBy","StockLedger.aggregate","ImportShipment.findUnique","ImportShipment.findUniqueOrThrow","ImportShipment.findFirst","ImportShipment.findFirstOrThrow","ImportShipment.findMany","ImportShipment.createOne","ImportShipment.createMany","ImportShipment.createManyAndReturn","ImportShipment.updateOne","ImportShipment.updateMany","ImportShipment.updateManyAndReturn","ImportShipment.upsertOne","ImportShipment.deleteOne","ImportShipment.deleteMany","ImportShipment.groupBy","ImportShipment.aggregate","AND","OR","NOT","id","importNumber","supplierId","supplierName","supplierInvoiceNumber","purchaseId","purchaseNumber","shipmentReference","importDate","warehouseId","warehouseName","status","items","expenseHeads","totalProductCost","totalAdditionalCosts","totalLandedCost","documentName","documentExtracted","notes","createdAt","updatedAt","equals","not","in","notIn","lt","lte","gt","gte","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","contains","startsWith","endsWith","date","productId","sku","productName","movementType","referenceDocument","quantityChange","previousBalance","newBalance","name","code","type","website","description","invoiceNumber","invoiceDate","dueDate","salesChannel","externalOrderId","buyerName","buyerEmail","buyerPhone","billingAddress","shippingAddress","subtotal","discountTotal","taxTotal","shippingCharges","additionalCharges","grandTotal","amountPaid","balanceDue","paymentStatus","paymentMethod","termsAndConditions","purchaseDate","expectedDate","containerNumber","discount","tax","supplierCode","supplierType","companyName","contactPerson","email","phone","alternatePhone","taxId","paymentTerms","openingBalance","addressLine1","addressLine2","city","state","postalCode","country","warehouseCode","address","categoryId","uom","costPrice","sellingPrice","stock","reorderLevel","taxRate","imageUrl","salesChannels","every","some","none","corporateName","ein","salesTaxPermit","zipCode","logoUrl","defaultTaxRate","taxCalculationMode","taxLabel","taxSlabs","isSystem","modules","permissions","mobile","password","UserRole","role","roleTitle","roleId","initials","avatarBg","requirePasswordChange","isActive","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "0gN4wAESzgEAAPUCADDPAQAABAAQ0AEAAPUCADDRAQIAAAAB3AEBAM0CACHlAUAA0AIAIeYBQADQAgAhgQIBAM0CACGkAgEAAAABygIBAM8CACHLAgEAzQIAIc0CAAD2As0CIs4CAQDNAgAhzwIBAM0CACHQAgEAzwIAIdECAQDPAgAh0gIgANMCACHTAiAA0wIAIQEAAAABACABAAAAAQAgEs4BAAD1AgAwzwEAAAQAENABAAD1AgAw0QECAMwCACHcAQEAzQIAIeUBQADQAgAh5gFAANACACGBAgEAzQIAIaQCAQDNAgAhygIBAM8CACHLAgEAzQIAIc0CAAD2As0CIs4CAQDNAgAhzwIBAM0CACHQAgEAzwIAIdECAQDPAgAh0gIgANMCACHTAiAA0wIAIQPKAgAA9wIAINACAAD3AgAg0QIAAPcCACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAP0QECAAAAAdwBAQAAAAHlAUAAAAAB5gFAAAAAAYECAQAAAAGkAgEAAAABygIBAAAAAcsCAQAAAAHNAgAAAM0CAs4CAQAAAAHPAgEAAAAB0AIBAAAAAdECAQAAAAHSAiAAAAAB0wIgAAAAAQEIAAAJACAP0QECAAAAAdwBAQAAAAHlAUAAAAAB5gFAAAAAAYECAQAAAAGkAgEAAAABygIBAAAAAcsCAQAAAAHNAgAAAM0CAs4CAQAAAAHPAgEAAAAB0AIBAAAAAdECAQAAAAHSAiAAAAAB0wIgAAAAAQEIAAALADABCAAACwAwD9EBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAhgQIBAP0CACGkAgEA_QIAIcoCAQD_AgAhywIBAP0CACHNAgAAzAPNAiLOAgEA_QIAIc8CAQD9AgAh0AIBAP8CACHRAgEA_wIAIdICIACDAwAh0wIgAIMDACECAAAAAQAgCAAADgAgD9EBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAhgQIBAP0CACGkAgEA_QIAIcoCAQD_AgAhywIBAP0CACHNAgAAzAPNAiLOAgEA_QIAIc8CAQD9AgAh0AIBAP8CACHRAgEA_wIAIdICIACDAwAh0wIgAIMDACECAAAABAAgCAAAEAAgAgAAAAQAIAgAABAAIAMAAAABACAPAAAJACAQAAAOACABAAAAAQAgAQAAAAQAIAgVAADHAwAgFgAAyAMAIBcAAMsDACAYAADKAwAgGQAAyQMAIMoCAAD3AgAg0AIAAPcCACDRAgAA9wIAIBLOAQAA8QIAMM8BAAAXABDQAQAA8QIAMNEBAgCzAgAh3AEBALQCACHlAUAAtwIAIeYBQAC3AgAhgQIBALQCACGkAgEAtAIAIcoCAQC2AgAhywIBALQCACHNAgAA8gLNAiLOAgEAtAIAIc8CAQC0AgAh0AIBALYCACHRAgEAtgIAIdICIAC6AgAh0wIgALoCACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIA3OAQAA8AIAMM8BAAAdABDQAQAA8AIAMNEBAQAAAAHcAQEAzQIAIeUBQADQAgAh5gFAANACACGBAgEAAAABggIBAAAAAYUCAQDPAgAhxwIgANMCACHIAgAA0QIAIMkCAADRAgAgAQAAABoAIAEAAAAaACANzgEAAPACADDPAQAAHQAQ0AEAAPACADDRAQEAzQIAIdwBAQDNAgAh5QFAANACACHmAUAA0AIAIYECAQDNAgAhggIBAM0CACGFAgEAzwIAIccCIADTAgAhyAIAANECACDJAgAA0QIAIAGFAgAA9wIAIAMAAAAdACADAAAeADAEAAAaACADAAAAHQAgAwAAHgAwBAAAGgAgAwAAAB0AIAMAAB4AMAQAABoAIArRAQEAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAYICAQAAAAGFAgEAAAABxwIgAAAAAcgCgAAAAAHJAoAAAAABAQgAACIAIArRAQEAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAYICAQAAAAGFAgEAAAABxwIgAAAAAcgCgAAAAAHJAoAAAAABAQgAACQAMAEIAAAkADAK0QEBAP0CACHcAQEA_QIAIeUBQACAAwAh5gFAAIADACGBAgEA_QIAIYICAQD9AgAhhQIBAP8CACHHAiAAgwMAIcgCgAAAAAHJAoAAAAABAgAAABoAIAgAACcAIArRAQEA_QIAIdwBAQD9AgAh5QFAAIADACHmAUAAgAMAIYECAQD9AgAhggIBAP0CACGFAgEA_wIAIccCIACDAwAhyAKAAAAAAckCgAAAAAECAAAAHQAgCAAAKQAgAgAAAB0AIAgAACkAIAMAAAAaACAPAAAiACAQAAAnACABAAAAGgAgAQAAAB0AIAQVAADEAwAgGAAAxgMAIBkAAMUDACCFAgAA9wIAIA3OAQAA7wIAMM8BAAAwABDQAQAA7wIAMNEBAQC0AgAh3AEBALQCACHlAUAAtwIAIeYBQAC3AgAhgQIBALQCACGCAgEAtAIAIYUCAQC2AgAhxwIgALoCACHIAgAAuAIAIMkCAAC4AgAgAwAAAB0AIAMAAC8AMBQAADAAIAMAAAAdACADAAAeADAEAAAaACAWzgEAAO4CADDPAQAANgAQ0AEAAO4CADDRAQIAAAAB5QFAANACACHmAUAA0AIAIaICAQDNAgAhpAIBAM0CACGlAgEAzQIAIagCAADrAgAgrAIBAM0CACGtAgEAzQIAIbECAQDNAgAhvgIBAM0CACG_AgEAzQIAIcACAQDNAgAhwQIBAM0CACHCAgEAzwIAIcMCCADSAgAhxAIBAM0CACHFAgEAzQIAIcYCAADrAgAgAQAAADMAIAEAAAAzACAWzgEAAO4CADDPAQAANgAQ0AEAAO4CADDRAQIAzAIAIeUBQADQAgAh5gFAANACACGiAgEAzQIAIaQCAQDNAgAhpQIBAM0CACGoAgAA6wIAIKwCAQDNAgAhrQIBAM0CACGxAgEAzQIAIb4CAQDNAgAhvwIBAM0CACHAAgEAzQIAIcECAQDNAgAhwgIBAM8CACHDAggA0gIAIcQCAQDNAgAhxQIBAM0CACHGAgAA6wIAIAOoAgAA9wIAIMICAAD3AgAgxgIAAPcCACADAAAANgAgAwAANwAwBAAAMwAgAwAAADYAIAMAADcAMAQAADMAIAMAAAA2ACADAAA3ADAEAAAzACAT0QECAAAAAeUBQAAAAAHmAUAAAAABogIBAAAAAaQCAQAAAAGlAgEAAAABqAKAAAAAAawCAQAAAAGtAgEAAAABsQIBAAAAAb4CAQAAAAG_AgEAAAABwAIBAAAAAcECAQAAAAHCAgEAAAABwwIIAAAAAcQCAQAAAAHFAgEAAAABxgKAAAAAAQEIAAA7ACAT0QECAAAAAeUBQAAAAAHmAUAAAAABogIBAAAAAaQCAQAAAAGlAgEAAAABqAKAAAAAAawCAQAAAAGtAgEAAAABsQIBAAAAAb4CAQAAAAG_AgEAAAABwAIBAAAAAcECAQAAAAHCAgEAAAABwwIIAAAAAcQCAQAAAAHFAgEAAAABxgKAAAAAAQEIAAA9ADABCAAAPQAwE9EBAgCBAwAh5QFAAIADACHmAUAAgAMAIaICAQD9AgAhpAIBAP0CACGlAgEA_QIAIagCgAAAAAGsAgEA_QIAIa0CAQD9AgAhsQIBAP0CACG-AgEA_QIAIb8CAQD9AgAhwAIBAP0CACHBAgEA_QIAIcICAQD_AgAhwwIIAIIDACHEAgEA_QIAIcUCAQD9AgAhxgKAAAAAAQIAAAAzACAIAABAACAT0QECAIEDACHlAUAAgAMAIeYBQACAAwAhogIBAP0CACGkAgEA_QIAIaUCAQD9AgAhqAKAAAAAAawCAQD9AgAhrQIBAP0CACGxAgEA_QIAIb4CAQD9AgAhvwIBAP0CACHAAgEA_QIAIcECAQD9AgAhwgIBAP8CACHDAggAggMAIcQCAQD9AgAhxQIBAP0CACHGAoAAAAABAgAAADYAIAgAAEIAIAIAAAA2ACAIAABCACADAAAAMwAgDwAAOwAgEAAAQAAgAQAAADMAIAEAAAA2ACAIFQAAvwMAIBYAAMADACAXAADDAwAgGAAAwgMAIBkAAMEDACCoAgAA9wIAIMICAAD3AgAgxgIAAPcCACAWzgEAAO0CADDPAQAASQAQ0AEAAO0CADDRAQIAswIAIeUBQAC3AgAh5gFAALcCACGiAgEAtAIAIaQCAQC0AgAhpQIBALQCACGoAgAA5QIAIKwCAQC0AgAhrQIBALQCACGxAgEAtAIAIb4CAQC0AgAhvwIBALQCACHAAgEAtAIAIcECAQC0AgAhwgIBALYCACHDAggAuQIAIcQCAQC0AgAhxQIBALQCACHGAgAA5QIAIAMAAAA2ACADAABIADAUAABJACADAAAANgAgAwAANwAwBAAAMwAgCz0AAOkCACDOAQAA6AIAMM8BAABSABDQAQAA6AIAMNEBAgAAAAHcAQEAzQIAIeUBQADQAgAh5gFAANACACGBAgEAAAABggIBAAAAAYUCAQDPAgAhAQAAAEwAIBM8AADsAgAgzgEAAOoCADDPAQAATgAQ0AEAAOoCADDRAQIAzAIAIdwBAQDNAgAh5QFAANACACHmAUAA0AIAIfoBAQDNAgAhgQIBAM0CACGyAgIAzgIAIbMCAQDNAgAhtAIIANICACG1AggA0gIAIbYCAgDMAgAhtwICAMwCACG4AggA0gIAIbkCAQDPAgAhugIAAOsCACAEPAAAvgMAILICAAD3AgAguQIAAPcCACC6AgAA9wIAIBM8AADsAgAgzgEAAOoCADDPAQAATgAQ0AEAAOoCADDRAQIAAAAB3AEBAM0CACHlAUAA0AIAIeYBQADQAgAh-gEBAAAAAYECAQDNAgAhsgICAM4CACGzAgEAzQIAIbQCCADSAgAhtQIIANICACG2AgIAzAIAIbcCAgDMAgAhuAIIANICACG5AgEAzwIAIboCAADrAgAgAwAAAE4AIAMAAE8AMAQAAFAAIAs9AADpAgAgzgEAAOgCADDPAQAAUgAQ0AEAAOgCADDRAQIAzAIAIdwBAQDNAgAh5QFAANACACHmAUAA0AIAIYECAQDNAgAhggIBAM0CACGFAgEAzwIAIQEAAABSACABAAAATgAgAQAAAEwAIAI9AAC9AwAghQIAAPcCACADAAAAUgAgAwAAVgAwBAAATAAgAwAAAFIAIAMAAFYAMAQAAEwAIAMAAABSACADAABWADAEAABMACAIPQAAvAMAINEBAgAAAAHcAQEAAAAB5QFAAAAAAeYBQAAAAAGBAgEAAAABggIBAAAAAYUCAQAAAAEBCAAAWgAgB9EBAgAAAAHcAQEAAAAB5QFAAAAAAeYBQAAAAAGBAgEAAAABggIBAAAAAYUCAQAAAAEBCAAAXAAwAQgAAFwAMAg9AACvAwAg0QECAIEDACHcAQEA_QIAIeUBQACAAwAh5gFAAIADACGBAgEA_QIAIYICAQD9AgAhhQIBAP8CACECAAAATAAgCAAAXwAgB9EBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAhgQIBAP0CACGCAgEA_QIAIYUCAQD_AgAhAgAAAFIAIAgAAGEAIAIAAABSACAIAABhACADAAAATAAgDwAAWgAgEAAAXwAgAQAAAEwAIAEAAABSACAGFQAAqgMAIBYAAKsDACAXAACuAwAgGAAArQMAIBkAAKwDACCFAgAA9wIAIArOAQAA5wIAMM8BAABoABDQAQAA5wIAMNEBAgCzAgAh3AEBALQCACHlAUAAtwIAIeYBQAC3AgAhgQIBALQCACGCAgEAtAIAIYUCAQC2AgAhAwAAAFIAIAMAAGcAMBQAAGgAIAMAAABSACADAABWADAEAABMACABAAAAUAAgAQAAAFAAIAMAAABOACADAABPADAEAABQACADAAAATgAgAwAATwAwBAAAUAAgAwAAAE4AIAMAAE8AMAQAAFAAIBA8AACpAwAg0QECAAAAAdwBAQAAAAHlAUAAAAAB5gFAAAAAAfoBAQAAAAGBAgEAAAABsgICAAAAAbMCAQAAAAG0AggAAAABtQIIAAAAAbYCAgAAAAG3AgIAAAABuAIIAAAAAbkCAQAAAAG6AoAAAAABAQgAAHAAIA_RAQIAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAAB-gEBAAAAAYECAQAAAAGyAgIAAAABswIBAAAAAbQCCAAAAAG1AggAAAABtgICAAAAAbcCAgAAAAG4AggAAAABuQIBAAAAAboCgAAAAAEBCAAAcgAwAQgAAHIAMAEAAABSACAQPAAAqAMAINEBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAh-gEBAP0CACGBAgEA_QIAIbICAgD-AgAhswIBAP0CACG0AggAggMAIbUCCACCAwAhtgICAIEDACG3AgIAgQMAIbgCCACCAwAhuQIBAP8CACG6AoAAAAABAgAAAFAAIAgAAHYAIA_RAQIAgQMAIdwBAQD9AgAh5QFAAIADACHmAUAAgAMAIfoBAQD9AgAhgQIBAP0CACGyAgIA_gIAIbMCAQD9AgAhtAIIAIIDACG1AggAggMAIbYCAgCBAwAhtwICAIEDACG4AggAggMAIbkCAQD_AgAhugKAAAAAAQIAAABOACAIAAB4ACACAAAATgAgCAAAeAAgAQAAAFIAIAMAAABQACAPAABwACAQAAB2ACABAAAAUAAgAQAAAE4AIAgVAACjAwAgFgAApAMAIBcAAKcDACAYAACmAwAgGQAApQMAILICAAD3AgAguQIAAPcCACC6AgAA9wIAIBLOAQAA5AIAMM8BAACAAQAQ0AEAAOQCADDRAQIAswIAIdwBAQC0AgAh5QFAALcCACHmAUAAtwIAIfoBAQC0AgAhgQIBALQCACGyAgIAtQIAIbMCAQC0AgAhtAIIALkCACG1AggAuQIAIbYCAgCzAgAhtwICALMCACG4AggAuQIAIbkCAQC2AgAhugIAAOUCACADAAAATgAgAwAAfwAwFAAAgAEAIAMAAABOACADAABPADAEAABQACAPzgEAAOMCADDPAQAAhgEAENABAADjAgAw0QECAAAAAdwBAQDNAgAh5AEBAM8CACHlAUAA0AIAIeYBQADQAgAhgQIBAM0CACGsAgEAzQIAIa0CAQDNAgAhrgIBAM0CACGvAgEAzQIAIbACAQAAAAGxAgEAzQIAIQEAAACDAQAgAQAAAIMBACAPzgEAAOMCADDPAQAAhgEAENABAADjAgAw0QECAMwCACHcAQEAzQIAIeQBAQDPAgAh5QFAANACACHmAUAA0AIAIYECAQDNAgAhrAIBAM0CACGtAgEAzQIAIa4CAQDNAgAhrwIBAM0CACGwAgEAzQIAIbECAQDNAgAhAeQBAAD3AgAgAwAAAIYBACADAACHAQAwBAAAgwEAIAMAAACGAQAgAwAAhwEAMAQAAIMBACADAAAAhgEAIAMAAIcBADAEAACDAQAgDNEBAgAAAAHcAQEAAAAB5AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAawCAQAAAAGtAgEAAAABrgIBAAAAAa8CAQAAAAGwAgEAAAABsQIBAAAAAQEIAACLAQAgDNEBAgAAAAHcAQEAAAAB5AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAawCAQAAAAGtAgEAAAABrgIBAAAAAa8CAQAAAAGwAgEAAAABsQIBAAAAAQEIAACNAQAwAQgAAI0BADAM0QECAIEDACHcAQEA_QIAIeQBAQD_AgAh5QFAAIADACHmAUAAgAMAIYECAQD9AgAhrAIBAP0CACGtAgEA_QIAIa4CAQD9AgAhrwIBAP0CACGwAgEA_QIAIbECAQD9AgAhAgAAAIMBACAIAACQAQAgDNEBAgCBAwAh3AEBAP0CACHkAQEA_wIAIeUBQACAAwAh5gFAAIADACGBAgEA_QIAIawCAQD9AgAhrQIBAP0CACGuAgEA_QIAIa8CAQD9AgAhsAIBAP0CACGxAgEA_QIAIQIAAACGAQAgCAAAkgEAIAIAAACGAQAgCAAAkgEAIAMAAACDAQAgDwAAiwEAIBAAAJABACABAAAAgwEAIAEAAACGAQAgBhUAAJ4DACAWAACfAwAgFwAAogMAIBgAAKEDACAZAACgAwAg5AEAAPcCACAPzgEAAOICADDPAQAAmQEAENABAADiAgAw0QECALMCACHcAQEAtAIAIeQBAQC2AgAh5QFAALcCACHmAUAAtwIAIYECAQC0AgAhrAIBALQCACGtAgEAtAIAIa4CAQC0AgAhrwIBALQCACGwAgEAtAIAIbECAQC0AgAhAwAAAIYBACADAACYAQAwFAAAmQEAIAMAAACGAQAgAwAAhwEAMAQAAIMBACAYzgEAAOECADDPAQAAnwEAENABAADhAgAw0QECAAAAAdwBAQDNAgAh5AEBAM8CACHlAUAA0AIAIeYBQADQAgAhoAIBAAAAAaECAQDNAgAhogIBAM0CACGjAgEAzQIAIaQCAQDNAgAhpQIBAM0CACGmAgEAzwIAIacCAQDPAgAhqAIBAM0CACGpAggA0gIAIaoCAQDNAgAhqwIBAM8CACGsAgEAzQIAIa0CAQDNAgAhrgIBAM0CACGvAgEAzQIAIQEAAACcAQAgAQAAAJwBACAYzgEAAOECADDPAQAAnwEAENABAADhAgAw0QECAMwCACHcAQEAzQIAIeQBAQDPAgAh5QFAANACACHmAUAA0AIAIaACAQDNAgAhoQIBAM0CACGiAgEAzQIAIaMCAQDNAgAhpAIBAM0CACGlAgEAzQIAIaYCAQDPAgAhpwIBAM8CACGoAgEAzQIAIakCCADSAgAhqgIBAM0CACGrAgEAzwIAIawCAQDNAgAhrQIBAM0CACGuAgEAzQIAIa8CAQDNAgAhBOQBAAD3AgAgpgIAAPcCACCnAgAA9wIAIKsCAAD3AgAgAwAAAJ8BACADAACgAQAwBAAAnAEAIAMAAACfAQAgAwAAoAEAMAQAAJwBACADAAAAnwEAIAMAAKABADAEAACcAQAgFdEBAgAAAAHcAQEAAAAB5AEBAAAAAeUBQAAAAAHmAUAAAAABoAIBAAAAAaECAQAAAAGiAgEAAAABowIBAAAAAaQCAQAAAAGlAgEAAAABpgIBAAAAAacCAQAAAAGoAgEAAAABqQIIAAAAAaoCAQAAAAGrAgEAAAABrAIBAAAAAa0CAQAAAAGuAgEAAAABrwIBAAAAAQEIAACkAQAgFdEBAgAAAAHcAQEAAAAB5AEBAAAAAeUBQAAAAAHmAUAAAAABoAIBAAAAAaECAQAAAAGiAgEAAAABowIBAAAAAaQCAQAAAAGlAgEAAAABpgIBAAAAAacCAQAAAAGoAgEAAAABqQIIAAAAAaoCAQAAAAGrAgEAAAABrAIBAAAAAa0CAQAAAAGuAgEAAAABrwIBAAAAAQEIAACmAQAwAQgAAKYBADAV0QECAIEDACHcAQEA_QIAIeQBAQD_AgAh5QFAAIADACHmAUAAgAMAIaACAQD9AgAhoQIBAP0CACGiAgEA_QIAIaMCAQD9AgAhpAIBAP0CACGlAgEA_QIAIaYCAQD_AgAhpwIBAP8CACGoAgEA_QIAIakCCACCAwAhqgIBAP0CACGrAgEA_wIAIawCAQD9AgAhrQIBAP0CACGuAgEA_QIAIa8CAQD9AgAhAgAAAJwBACAIAACpAQAgFdEBAgCBAwAh3AEBAP0CACHkAQEA_wIAIeUBQACAAwAh5gFAAIADACGgAgEA_QIAIaECAQD9AgAhogIBAP0CACGjAgEA_QIAIaQCAQD9AgAhpQIBAP0CACGmAgEA_wIAIacCAQD_AgAhqAIBAP0CACGpAggAggMAIaoCAQD9AgAhqwIBAP8CACGsAgEA_QIAIa0CAQD9AgAhrgIBAP0CACGvAgEA_QIAIQIAAACfAQAgCAAAqwEAIAIAAACfAQAgCAAAqwEAIAMAAACcAQAgDwAApAEAIBAAAKkBACABAAAAnAEAIAEAAACfAQAgCRUAAJkDACAWAACaAwAgFwAAnQMAIBgAAJwDACAZAACbAwAg5AEAAPcCACCmAgAA9wIAIKcCAAD3AgAgqwIAAPcCACAYzgEAAOACADDPAQAAsgEAENABAADgAgAw0QECALMCACHcAQEAtAIAIeQBAQC2AgAh5QFAALcCACHmAUAAtwIAIaACAQC0AgAhoQIBALQCACGiAgEAtAIAIaMCAQC0AgAhpAIBALQCACGlAgEAtAIAIaYCAQC2AgAhpwIBALYCACGoAgEAtAIAIakCCAC5AgAhqgIBALQCACGrAgEAtgIAIawCAQC0AgAhrQIBALQCACGuAgEAtAIAIa8CAQC0AgAhAwAAAJ8BACADAACxAQAwFAAAsgEAIAMAAACfAQAgAwAAoAEAMAQAAJwBACAZzgEAAN8CADDPAQAAuAEAENABAADfAgAw0QECAAAAAdMBAgDMAgAh1AEBAM0CACHVAQEAzwIAIdcBAQAAAAHaAQIAzAIAIdsBAQDNAgAh3AEBAM0CACHdAQAA0QIAIOQBAQDPAgAh5QFAANACACHmAUAA0AIAIZACCADSAgAhlAIIANICACGVAggA0gIAIZYCCADSAgAhlwIIANICACGbAkAA0AIAIZwCQADdAgAhnQIBAM8CACGeAggA0gIAIZ8CCADSAgAhAQAAALUBACABAAAAtQEAIBnOAQAA3wIAMM8BAAC4AQAQ0AEAAN8CADDRAQIAzAIAIdMBAgDMAgAh1AEBAM0CACHVAQEAzwIAIdcBAQDNAgAh2gECAMwCACHbAQEAzQIAIdwBAQDNAgAh3QEAANECACDkAQEAzwIAIeUBQADQAgAh5gFAANACACGQAggA0gIAIZQCCADSAgAhlQIIANICACGWAggA0gIAIZcCCADSAgAhmwJAANACACGcAkAA3QIAIZ0CAQDPAgAhngIIANICACGfAggA0gIAIQTVAQAA9wIAIOQBAAD3AgAgnAIAAPcCACCdAgAA9wIAIAMAAAC4AQAgAwAAuQEAMAQAALUBACADAAAAuAEAIAMAALkBADAEAAC1AQAgAwAAALgBACADAAC5AQAwBAAAtQEAIBbRAQIAAAAB0wECAAAAAdQBAQAAAAHVAQEAAAAB1wEBAAAAAdoBAgAAAAHbAQEAAAAB3AEBAAAAAd0BgAAAAAHkAQEAAAAB5QFAAAAAAeYBQAAAAAGQAggAAAABlAIIAAAAAZUCCAAAAAGWAggAAAABlwIIAAAAAZsCQAAAAAGcAkAAAAABnQIBAAAAAZ4CCAAAAAGfAggAAAABAQgAAL0BACAW0QECAAAAAdMBAgAAAAHUAQEAAAAB1QEBAAAAAdcBAQAAAAHaAQIAAAAB2wEBAAAAAdwBAQAAAAHdAYAAAAAB5AEBAAAAAeUBQAAAAAHmAUAAAAABkAIIAAAAAZQCCAAAAAGVAggAAAABlgIIAAAAAZcCCAAAAAGbAkAAAAABnAJAAAAAAZ0CAQAAAAGeAggAAAABnwIIAAAAAQEIAAC_AQAwAQgAAL8BADAW0QECAIEDACHTAQIAgQMAIdQBAQD9AgAh1QEBAP8CACHXAQEA_QIAIdoBAgCBAwAh2wEBAP0CACHcAQEA_QIAId0BgAAAAAHkAQEA_wIAIeUBQACAAwAh5gFAAIADACGQAggAggMAIZQCCACCAwAhlQIIAIIDACGWAggAggMAIZcCCACCAwAhmwJAAIADACGcAkAAkwMAIZ0CAQD_AgAhngIIAIIDACGfAggAggMAIQIAAAC1AQAgCAAAwgEAIBbRAQIAgQMAIdMBAgCBAwAh1AEBAP0CACHVAQEA_wIAIdcBAQD9AgAh2gECAIEDACHbAQEA_QIAIdwBAQD9AgAh3QGAAAAAAeQBAQD_AgAh5QFAAIADACHmAUAAgAMAIZACCACCAwAhlAIIAIIDACGVAggAggMAIZYCCACCAwAhlwIIAIIDACGbAkAAgAMAIZwCQACTAwAhnQIBAP8CACGeAggAggMAIZ8CCACCAwAhAgAAALgBACAIAADEAQAgAgAAALgBACAIAADEAQAgAwAAALUBACAPAAC9AQAgEAAAwgEAIAEAAAC1AQAgAQAAALgBACAJFQAAlAMAIBYAAJUDACAXAACYAwAgGAAAlwMAIBkAAJYDACDVAQAA9wIAIOQBAAD3AgAgnAIAAPcCACCdAgAA9wIAIBnOAQAA3gIAMM8BAADLAQAQ0AEAAN4CADDRAQIAswIAIdMBAgCzAgAh1AEBALQCACHVAQEAtgIAIdcBAQC0AgAh2gECALMCACHbAQEAtAIAIdwBAQC0AgAh3QEAALgCACDkAQEAtgIAIeUBQAC3AgAh5gFAALcCACGQAggAuQIAIZQCCAC5AgAhlQIIALkCACGWAggAuQIAIZcCCAC5AgAhmwJAALcCACGcAkAA2QIAIZ0CAQC2AgAhngIIALkCACGfAggAuQIAIQMAAAC4AQAgAwAAygEAMBQAAMsBACADAAAAuAEAIAMAALkBADAEAAC1AQAgIM4BAADcAgAwzwEAANEBABDQAQAA3AIAMNEBAgAAAAHaAQIAzgIAIdsBAQDPAgAh3AEBAM0CACHdAQAA0QIAIOQBAQDPAgAh5QFAANACACHmAUAA0AIAIYYCAQAAAAGHAkAA0AIAIYgCQADdAgAhiQIBAM0CACGKAgEAzwIAIYsCAQDNAgAhjAIBAM8CACGNAgEAzwIAIY4CAQDPAgAhjwIBAM8CACGQAggA0gIAIZECCADSAgAhkgIIANICACGTAggA0gIAIZQCCADSAgAhlQIIANICACGWAggA0gIAIZcCCADSAgAhmAIBAM0CACGZAgEAzwIAIZoCAQDPAgAhAQAAAM4BACABAAAAzgEAICDOAQAA3AIAMM8BAADRAQAQ0AEAANwCADDRAQIAzAIAIdoBAgDOAgAh2wEBAM8CACHcAQEAzQIAId0BAADRAgAg5AEBAM8CACHlAUAA0AIAIeYBQADQAgAhhgIBAM0CACGHAkAA0AIAIYgCQADdAgAhiQIBAM0CACGKAgEAzwIAIYsCAQDNAgAhjAIBAM8CACGNAgEAzwIAIY4CAQDPAgAhjwIBAM8CACGQAggA0gIAIZECCADSAgAhkgIIANICACGTAggA0gIAIZQCCADSAgAhlQIIANICACGWAggA0gIAIZcCCADSAgAhmAIBAM0CACGZAgEAzwIAIZoCAQDPAgAhC9oBAAD3AgAg2wEAAPcCACDkAQAA9wIAIIgCAAD3AgAgigIAAPcCACCMAgAA9wIAII0CAAD3AgAgjgIAAPcCACCPAgAA9wIAIJkCAAD3AgAgmgIAAPcCACADAAAA0QEAIAMAANIBADAEAADOAQAgAwAAANEBACADAADSAQAwBAAAzgEAIAMAAADRAQAgAwAA0gEAMAQAAM4BACAd0QECAAAAAdoBAgAAAAHbAQEAAAAB3AEBAAAAAd0BgAAAAAHkAQEAAAAB5QFAAAAAAeYBQAAAAAGGAgEAAAABhwJAAAAAAYgCQAAAAAGJAgEAAAABigIBAAAAAYsCAQAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGPAgEAAAABkAIIAAAAAZECCAAAAAGSAggAAAABkwIIAAAAAZQCCAAAAAGVAggAAAABlgIIAAAAAZcCCAAAAAGYAgEAAAABmQIBAAAAAZoCAQAAAAEBCAAA1gEAIB3RAQIAAAAB2gECAAAAAdsBAQAAAAHcAQEAAAAB3QGAAAAAAeQBAQAAAAHlAUAAAAAB5gFAAAAAAYYCAQAAAAGHAkAAAAABiAJAAAAAAYkCAQAAAAGKAgEAAAABiwIBAAAAAYwCAQAAAAGNAgEAAAABjgIBAAAAAY8CAQAAAAGQAggAAAABkQIIAAAAAZICCAAAAAGTAggAAAABlAIIAAAAAZUCCAAAAAGWAggAAAABlwIIAAAAAZgCAQAAAAGZAgEAAAABmgIBAAAAAQEIAADYAQAwAQgAANgBADAd0QECAIEDACHaAQIA_gIAIdsBAQD_AgAh3AEBAP0CACHdAYAAAAAB5AEBAP8CACHlAUAAgAMAIeYBQACAAwAhhgIBAP0CACGHAkAAgAMAIYgCQACTAwAhiQIBAP0CACGKAgEA_wIAIYsCAQD9AgAhjAIBAP8CACGNAgEA_wIAIY4CAQD_AgAhjwIBAP8CACGQAggAggMAIZECCACCAwAhkgIIAIIDACGTAggAggMAIZQCCACCAwAhlQIIAIIDACGWAggAggMAIZcCCACCAwAhmAIBAP0CACGZAgEA_wIAIZoCAQD_AgAhAgAAAM4BACAIAADbAQAgHdEBAgCBAwAh2gECAP4CACHbAQEA_wIAIdwBAQD9AgAh3QGAAAAAAeQBAQD_AgAh5QFAAIADACHmAUAAgAMAIYYCAQD9AgAhhwJAAIADACGIAkAAkwMAIYkCAQD9AgAhigIBAP8CACGLAgEA_QIAIYwCAQD_AgAhjQIBAP8CACGOAgEA_wIAIY8CAQD_AgAhkAIIAIIDACGRAggAggMAIZICCACCAwAhkwIIAIIDACGUAggAggMAIZUCCACCAwAhlgIIAIIDACGXAggAggMAIZgCAQD9AgAhmQIBAP8CACGaAgEA_wIAIQIAAADRAQAgCAAA3QEAIAIAAADRAQAgCAAA3QEAIAMAAADOAQAgDwAA1gEAIBAAANsBACABAAAAzgEAIAEAAADRAQAgEBUAAI4DACAWAACPAwAgFwAAkgMAIBgAAJEDACAZAACQAwAg2gEAAPcCACDbAQAA9wIAIOQBAAD3AgAgiAIAAPcCACCKAgAA9wIAIIwCAAD3AgAgjQIAAPcCACCOAgAA9wIAII8CAAD3AgAgmQIAAPcCACCaAgAA9wIAICDOAQAA2AIAMM8BAADkAQAQ0AEAANgCADDRAQIAswIAIdoBAgC1AgAh2wEBALYCACHcAQEAtAIAId0BAAC4AgAg5AEBALYCACHlAUAAtwIAIeYBQAC3AgAhhgIBALQCACGHAkAAtwIAIYgCQADZAgAhiQIBALQCACGKAgEAtgIAIYsCAQC0AgAhjAIBALYCACGNAgEAtgIAIY4CAQC2AgAhjwIBALYCACGQAggAuQIAIZECCAC5AgAhkgIIALkCACGTAggAuQIAIZQCCAC5AgAhlQIIALkCACGWAggAuQIAIZcCCAC5AgAhmAIBALQCACGZAgEAtgIAIZoCAQC2AgAhAwAAANEBACADAADjAQAwFAAA5AEAIAMAAADRAQAgAwAA0gEAMAQAAM4BACAMzgEAANcCADDPAQAA6gEAENABAADXAgAw0QECAAAAAdwBAQDNAgAh5QFAANACACHmAUAA0AIAIYECAQAAAAGCAgEAAAABgwIBAM0CACGEAgEAzwIAIYUCAQDPAgAhAQAAAOcBACABAAAA5wEAIAzOAQAA1wIAMM8BAADqAQAQ0AEAANcCADDRAQIAzAIAIdwBAQDNAgAh5QFAANACACHmAUAA0AIAIYECAQDNAgAhggIBAM0CACGDAgEAzQIAIYQCAQDPAgAhhQIBAM8CACEChAIAAPcCACCFAgAA9wIAIAMAAADqAQAgAwAA6wEAMAQAAOcBACADAAAA6gEAIAMAAOsBADAEAADnAQAgAwAAAOoBACADAADrAQAwBAAA5wEAIAnRAQIAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABhAIBAAAAAYUCAQAAAAEBCAAA7wEAIAnRAQIAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABhAIBAAAAAYUCAQAAAAEBCAAA8QEAMAEIAADxAQAwCdEBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAhgQIBAP0CACGCAgEA_QIAIYMCAQD9AgAhhAIBAP8CACGFAgEA_wIAIQIAAADnAQAgCAAA9AEAIAnRAQIAgQMAIdwBAQD9AgAh5QFAAIADACHmAUAAgAMAIYECAQD9AgAhggIBAP0CACGDAgEA_QIAIYQCAQD_AgAhhQIBAP8CACECAAAA6gEAIAgAAPYBACACAAAA6gEAIAgAAPYBACADAAAA5wEAIA8AAO8BACAQAAD0AQAgAQAAAOcBACABAAAA6gEAIAcVAACJAwAgFgAAigMAIBcAAI0DACAYAACMAwAgGQAAiwMAIIQCAAD3AgAghQIAAPcCACAMzgEAANYCADDPAQAA_QEAENABAADWAgAw0QECALMCACHcAQEAtAIAIeUBQAC3AgAh5gFAALcCACGBAgEAtAIAIYICAQC0AgAhgwIBALQCACGEAgEAtgIAIYUCAQC2AgAhAwAAAOoBACADAAD8AQAwFAAA_QEAIAMAAADqAQAgAwAA6wEAMAQAAOcBACARzgEAANUCADDPAQAAgwIAENABAADVAgAw0QECAAAAAdoBAgDMAgAh2wEBAM0CACHkAQEAzwIAIeUBQADQAgAh-AFAANACACH5AQIAzAIAIfoBAQDNAgAh-wEBAM0CACH8AQEAzQIAIf0BAQDPAgAh_gECAMwCACH_AQIAzAIAIYACAgDMAgAhAQAAAIACACABAAAAgAIAIBHOAQAA1QIAMM8BAACDAgAQ0AEAANUCADDRAQIAzAIAIdoBAgDMAgAh2wEBAM0CACHkAQEAzwIAIeUBQADQAgAh-AFAANACACH5AQIAzAIAIfoBAQDNAgAh-wEBAM0CACH8AQEAzQIAIf0BAQDPAgAh_gECAMwCACH_AQIAzAIAIYACAgDMAgAhAuQBAAD3AgAg_QEAAPcCACADAAAAgwIAIAMAAIQCADAEAACAAgAgAwAAAIMCACADAACEAgAwBAAAgAIAIAMAAACDAgAgAwAAhAIAMAQAAIACACAO0QECAAAAAdoBAgAAAAHbAQEAAAAB5AEBAAAAAeUBQAAAAAH4AUAAAAAB-QECAAAAAfoBAQAAAAH7AQEAAAAB_AEBAAAAAf0BAQAAAAH-AQIAAAAB_wECAAAAAYACAgAAAAEBCAAAiAIAIA7RAQIAAAAB2gECAAAAAdsBAQAAAAHkAQEAAAAB5QFAAAAAAfgBQAAAAAH5AQIAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAf4BAgAAAAH_AQIAAAABgAICAAAAAQEIAACKAgAwAQgAAIoCADAO0QECAIEDACHaAQIAgQMAIdsBAQD9AgAh5AEBAP8CACHlAUAAgAMAIfgBQACAAwAh-QECAIEDACH6AQEA_QIAIfsBAQD9AgAh_AEBAP0CACH9AQEA_wIAIf4BAgCBAwAh_wECAIEDACGAAgIAgQMAIQIAAACAAgAgCAAAjQIAIA7RAQIAgQMAIdoBAgCBAwAh2wEBAP0CACHkAQEA_wIAIeUBQACAAwAh-AFAAIADACH5AQIAgQMAIfoBAQD9AgAh-wEBAP0CACH8AQEA_QIAIf0BAQD_AgAh_gECAIEDACH_AQIAgQMAIYACAgCBAwAhAgAAAIMCACAIAACPAgAgAgAAAIMCACAIAACPAgAgAwAAAIACACAPAACIAgAgEAAAjQIAIAEAAACAAgAgAQAAAIMCACAHFQAAhAMAIBYAAIUDACAXAACIAwAgGAAAhwMAIBkAAIYDACDkAQAA9wIAIP0BAAD3AgAgEc4BAADUAgAwzwEAAJYCABDQAQAA1AIAMNEBAgCzAgAh2gECALMCACHbAQEAtAIAIeQBAQC2AgAh5QFAALcCACH4AUAAtwIAIfkBAgCzAgAh-gEBALQCACH7AQEAtAIAIfwBAQC0AgAh_QEBALYCACH-AQIAswIAIf8BAgCzAgAhgAICALMCACEDAAAAgwIAIAMAAJUCADAUAACWAgAgAwAAAIMCACADAACEAgAwBAAAgAIAIBnOAQAAywIAMM8BAACcAgAQ0AEAAMsCADDRAQIAAAAB0gEBAAAAAdMBAgDOAgAh1AEBAM8CACHVAQEAzwIAIdYBAgDOAgAh1wEBAM8CACHYAQEAzwIAIdkBQADQAgAh2gECAMwCACHbAQEAzQIAIdwBAQDNAgAh3QEAANECACDeAQAA0QIAIN8BCADSAgAh4AEIANICACHhAQgA0gIAIeIBAQDPAgAh4wEgANMCACHkAQEAzwIAIeUBQADQAgAh5gFAANACACEBAAAAmQIAIAEAAACZAgAgGc4BAADLAgAwzwEAAJwCABDQAQAAywIAMNEBAgDMAgAh0gEBAM0CACHTAQIAzgIAIdQBAQDPAgAh1QEBAM8CACHWAQIAzgIAIdcBAQDPAgAh2AEBAM8CACHZAUAA0AIAIdoBAgDMAgAh2wEBAM0CACHcAQEAzQIAId0BAADRAgAg3gEAANECACDfAQgA0gIAIeABCADSAgAh4QEIANICACHiAQEAzwIAIeMBIADTAgAh5AEBAM8CACHlAUAA0AIAIeYBQADQAgAhCNMBAAD3AgAg1AEAAPcCACDVAQAA9wIAINYBAAD3AgAg1wEAAPcCACDYAQAA9wIAIOIBAAD3AgAg5AEAAPcCACADAAAAnAIAIAMAAJ0CADAEAACZAgAgAwAAAJwCACADAACdAgAwBAAAmQIAIAMAAACcAgAgAwAAnQIAMAQAAJkCACAW0QECAAAAAdIBAQAAAAHTAQIAAAAB1AEBAAAAAdUBAQAAAAHWAQIAAAAB1wEBAAAAAdgBAQAAAAHZAUAAAAAB2gECAAAAAdsBAQAAAAHcAQEAAAAB3QGAAAAAAd4BgAAAAAHfAQgAAAAB4AEIAAAAAeEBCAAAAAHiAQEAAAAB4wEgAAAAAeQBAQAAAAHlAUAAAAAB5gFAAAAAAQEIAAChAgAgFtEBAgAAAAHSAQEAAAAB0wECAAAAAdQBAQAAAAHVAQEAAAAB1gECAAAAAdcBAQAAAAHYAQEAAAAB2QFAAAAAAdoBAgAAAAHbAQEAAAAB3AEBAAAAAd0BgAAAAAHeAYAAAAAB3wEIAAAAAeABCAAAAAHhAQgAAAAB4gEBAAAAAeMBIAAAAAHkAQEAAAAB5QFAAAAAAeYBQAAAAAEBCAAAowIAMAEIAACjAgAwFtEBAgCBAwAh0gEBAP0CACHTAQIA_gIAIdQBAQD_AgAh1QEBAP8CACHWAQIA_gIAIdcBAQD_AgAh2AEBAP8CACHZAUAAgAMAIdoBAgCBAwAh2wEBAP0CACHcAQEA_QIAId0BgAAAAAHeAYAAAAAB3wEIAIIDACHgAQgAggMAIeEBCACCAwAh4gEBAP8CACHjASAAgwMAIeQBAQD_AgAh5QFAAIADACHmAUAAgAMAIQIAAACZAgAgCAAApgIAIBbRAQIAgQMAIdIBAQD9AgAh0wECAP4CACHUAQEA_wIAIdUBAQD_AgAh1gECAP4CACHXAQEA_wIAIdgBAQD_AgAh2QFAAIADACHaAQIAgQMAIdsBAQD9AgAh3AEBAP0CACHdAYAAAAAB3gGAAAAAAd8BCACCAwAh4AEIAIIDACHhAQgAggMAIeIBAQD_AgAh4wEgAIMDACHkAQEA_wIAIeUBQACAAwAh5gFAAIADACECAAAAnAIAIAgAAKgCACACAAAAnAIAIAgAAKgCACADAAAAmQIAIA8AAKECACAQAACmAgAgAQAAAJkCACABAAAAnAIAIA0VAAD4AgAgFgAA-QIAIBcAAPwCACAYAAD7AgAgGQAA-gIAINMBAAD3AgAg1AEAAPcCACDVAQAA9wIAINYBAAD3AgAg1wEAAPcCACDYAQAA9wIAIOIBAAD3AgAg5AEAAPcCACAZzgEAALICADDPAQAArwIAENABAACyAgAw0QECALMCACHSAQEAtAIAIdMBAgC1AgAh1AEBALYCACHVAQEAtgIAIdYBAgC1AgAh1wEBALYCACHYAQEAtgIAIdkBQAC3AgAh2gECALMCACHbAQEAtAIAIdwBAQC0AgAh3QEAALgCACDeAQAAuAIAIN8BCAC5AgAh4AEIALkCACHhAQgAuQIAIeIBAQC2AgAh4wEgALoCACHkAQEAtgIAIeUBQAC3AgAh5gFAALcCACEDAAAAnAIAIAMAAK4CADAUAACvAgAgAwAAAJwCACADAACdAgAwBAAAmQIAIBnOAQAAsgIAMM8BAACvAgAQ0AEAALICADDRAQIAswIAIdIBAQC0AgAh0wECALUCACHUAQEAtgIAIdUBAQC2AgAh1gECALUCACHXAQEAtgIAIdgBAQC2AgAh2QFAALcCACHaAQIAswIAIdsBAQC0AgAh3AEBALQCACHdAQAAuAIAIN4BAAC4AgAg3wEIALkCACHgAQgAuQIAIeEBCAC5AgAh4gEBALYCACHjASAAugIAIeQBAQC2AgAh5QFAALcCACHmAUAAtwIAIQ0VAAC8AgAgFgAAvwIAIBcAALwCACAYAAC8AgAgGQAAvAIAIOcBAgAAAAHoAQIAygIAIekBAgAAAATqAQIAAAAE6wECAAAAAewBAgAAAAHtAQIAAAAB7gECAAAAAQ4VAAC8AgAgGAAAyQIAIBkAAMkCACDnAQEAAAAB6AEBAMgCACHpAQEAAAAE6gEBAAAABOsBAQAAAAHsAQEAAAAB7QEBAAAAAe4BAQAAAAH1AQEAAAAB9gEBAAAAAfcBAQAAAAENFQAAxAIAIBYAAMcCACAXAADEAgAgGAAAxAIAIBkAAMQCACDnAQIAAAAB6AECAMYCACHpAQIAAAAF6gECAAAABesBAgAAAAHsAQIAAAAB7QECAAAAAe4BAgAAAAEOFQAAxAIAIBgAAMUCACAZAADFAgAg5wEBAAAAAegBAQDDAgAh6QEBAAAABeoBAQAAAAXrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQEAAAAB9QEBAAAAAfYBAQAAAAH3AQEAAAABCxUAALwCACAYAADCAgAgGQAAwgIAIOcBQAAAAAHoAUAAwQIAIekBQAAAAATqAUAAAAAE6wFAAAAAAewBQAAAAAHtAUAAAAAB7gFAAAAAAQ8VAAC8AgAgGAAAwAIAIBkAAMACACDnAYAAAAAB6AGAAAAAAesBgAAAAAHsAYAAAAAB7QGAAAAAAe4BgAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAYAAAAAB8wGAAAAAAfQBgAAAAAENFQAAvAIAIBYAAL8CACAXAAC_AgAgGAAAvwIAIBkAAL8CACDnAQgAAAAB6AEIAL4CACHpAQgAAAAE6gEIAAAABOsBCAAAAAHsAQgAAAAB7QEIAAAAAe4BCAAAAAEFFQAAvAIAIBgAAL0CACAZAAC9AgAg5wEgAAAAAegBIAC7AgAhBRUAALwCACAYAAC9AgAgGQAAvQIAIOcBIAAAAAHoASAAuwIAIQjnAQIAAAAB6AECALwCACHpAQIAAAAE6gECAAAABOsBAgAAAAHsAQIAAAAB7QECAAAAAe4BAgAAAAEC5wEgAAAAAegBIAC9AgAhDRUAALwCACAWAAC_AgAgFwAAvwIAIBgAAL8CACAZAAC_AgAg5wEIAAAAAegBCAC-AgAh6QEIAAAABOoBCAAAAATrAQgAAAAB7AEIAAAAAe0BCAAAAAHuAQgAAAABCOcBCAAAAAHoAQgAvwIAIekBCAAAAATqAQgAAAAE6wEIAAAAAewBCAAAAAHtAQgAAAAB7gEIAAAAAQznAYAAAAAB6AGAAAAAAesBgAAAAAHsAYAAAAAB7QGAAAAAAe4BgAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAYAAAAAB8wGAAAAAAfQBgAAAAAELFQAAvAIAIBgAAMICACAZAADCAgAg5wFAAAAAAegBQADBAgAh6QFAAAAABOoBQAAAAATrAUAAAAAB7AFAAAAAAe0BQAAAAAHuAUAAAAABCOcBQAAAAAHoAUAAwgIAIekBQAAAAATqAUAAAAAE6wFAAAAAAewBQAAAAAHtAUAAAAAB7gFAAAAAAQ4VAADEAgAgGAAAxQIAIBkAAMUCACDnAQEAAAAB6AEBAMMCACHpAQEAAAAF6gEBAAAABesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BAQAAAAH1AQEAAAAB9gEBAAAAAfcBAQAAAAEI5wECAAAAAegBAgDEAgAh6QECAAAABeoBAgAAAAXrAQIAAAAB7AECAAAAAe0BAgAAAAHuAQIAAAABC-cBAQAAAAHoAQEAxQIAIekBAQAAAAXqAQEAAAAF6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEBAAAAAfUBAQAAAAH2AQEAAAAB9wEBAAAAAQ0VAADEAgAgFgAAxwIAIBcAAMQCACAYAADEAgAgGQAAxAIAIOcBAgAAAAHoAQIAxgIAIekBAgAAAAXqAQIAAAAF6wECAAAAAewBAgAAAAHtAQIAAAAB7gECAAAAAQjnAQgAAAAB6AEIAMcCACHpAQgAAAAF6gEIAAAABesBCAAAAAHsAQgAAAAB7QEIAAAAAe4BCAAAAAEOFQAAvAIAIBgAAMkCACAZAADJAgAg5wEBAAAAAegBAQDIAgAh6QEBAAAABOoBAQAAAATrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQEAAAAB9QEBAAAAAfYBAQAAAAH3AQEAAAABC-cBAQAAAAHoAQEAyQIAIekBAQAAAATqAQEAAAAE6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEBAAAAAfUBAQAAAAH2AQEAAAAB9wEBAAAAAQ0VAAC8AgAgFgAAvwIAIBcAALwCACAYAAC8AgAgGQAAvAIAIOcBAgAAAAHoAQIAygIAIekBAgAAAATqAQIAAAAE6wECAAAAAewBAgAAAAHtAQIAAAAB7gECAAAAARnOAQAAywIAMM8BAACcAgAQ0AEAAMsCADDRAQIAzAIAIdIBAQDNAgAh0wECAM4CACHUAQEAzwIAIdUBAQDPAgAh1gECAM4CACHXAQEAzwIAIdgBAQDPAgAh2QFAANACACHaAQIAzAIAIdsBAQDNAgAh3AEBAM0CACHdAQAA0QIAIN4BAADRAgAg3wEIANICACHgAQgA0gIAIeEBCADSAgAh4gEBAM8CACHjASAA0wIAIeQBAQDPAgAh5QFAANACACHmAUAA0AIAIQjnAQIAAAAB6AECALwCACHpAQIAAAAE6gECAAAABOsBAgAAAAHsAQIAAAAB7QECAAAAAe4BAgAAAAEL5wEBAAAAAegBAQDJAgAh6QEBAAAABOoBAQAAAATrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQEAAAAB9QEBAAAAAfYBAQAAAAH3AQEAAAABCOcBAgAAAAHoAQIAxAIAIekBAgAAAAXqAQIAAAAF6wECAAAAAewBAgAAAAHtAQIAAAAB7gECAAAAAQvnAQEAAAAB6AEBAMUCACHpAQEAAAAF6gEBAAAABesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BAQAAAAH1AQEAAAAB9gEBAAAAAfcBAQAAAAEI5wFAAAAAAegBQADCAgAh6QFAAAAABOoBQAAAAATrAUAAAAAB7AFAAAAAAe0BQAAAAAHuAUAAAAABDOcBgAAAAAHoAYAAAAAB6wGAAAAAAewBgAAAAAHtAYAAAAAB7gGAAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBgAAAAAHzAYAAAAAB9AGAAAAAAQjnAQgAAAAB6AEIAL8CACHpAQgAAAAE6gEIAAAABOsBCAAAAAHsAQgAAAAB7QEIAAAAAe4BCAAAAAEC5wEgAAAAAegBIAC9AgAhEc4BAADUAgAwzwEAAJYCABDQAQAA1AIAMNEBAgCzAgAh2gECALMCACHbAQEAtAIAIeQBAQC2AgAh5QFAALcCACH4AUAAtwIAIfkBAgCzAgAh-gEBALQCACH7AQEAtAIAIfwBAQC0AgAh_QEBALYCACH-AQIAswIAIf8BAgCzAgAhgAICALMCACERzgEAANUCADDPAQAAgwIAENABAADVAgAw0QECAMwCACHaAQIAzAIAIdsBAQDNAgAh5AEBAM8CACHlAUAA0AIAIfgBQADQAgAh-QECAMwCACH6AQEAzQIAIfsBAQDNAgAh_AEBAM0CACH9AQEAzwIAIf4BAgDMAgAh_wECAMwCACGAAgIAzAIAIQzOAQAA1gIAMM8BAAD9AQAQ0AEAANYCADDRAQIAswIAIdwBAQC0AgAh5QFAALcCACHmAUAAtwIAIYECAQC0AgAhggIBALQCACGDAgEAtAIAIYQCAQC2AgAhhQIBALYCACEMzgEAANcCADDPAQAA6gEAENABAADXAgAw0QECAMwCACHcAQEAzQIAIeUBQADQAgAh5gFAANACACGBAgEAzQIAIYICAQDNAgAhgwIBAM0CACGEAgEAzwIAIYUCAQDPAgAhIM4BAADYAgAwzwEAAOQBABDQAQAA2AIAMNEBAgCzAgAh2gECALUCACHbAQEAtgIAIdwBAQC0AgAh3QEAALgCACDkAQEAtgIAIeUBQAC3AgAh5gFAALcCACGGAgEAtAIAIYcCQAC3AgAhiAJAANkCACGJAgEAtAIAIYoCAQC2AgAhiwIBALQCACGMAgEAtgIAIY0CAQC2AgAhjgIBALYCACGPAgEAtgIAIZACCAC5AgAhkQIIALkCACGSAggAuQIAIZMCCAC5AgAhlAIIALkCACGVAggAuQIAIZYCCAC5AgAhlwIIALkCACGYAgEAtAIAIZkCAQC2AgAhmgIBALYCACELFQAAxAIAIBgAANsCACAZAADbAgAg5wFAAAAAAegBQADaAgAh6QFAAAAABeoBQAAAAAXrAUAAAAAB7AFAAAAAAe0BQAAAAAHuAUAAAAABCxUAAMQCACAYAADbAgAgGQAA2wIAIOcBQAAAAAHoAUAA2gIAIekBQAAAAAXqAUAAAAAF6wFAAAAAAewBQAAAAAHtAUAAAAAB7gFAAAAAAQjnAUAAAAAB6AFAANsCACHpAUAAAAAF6gFAAAAABesBQAAAAAHsAUAAAAAB7QFAAAAAAe4BQAAAAAEgzgEAANwCADDPAQAA0QEAENABAADcAgAw0QECAMwCACHaAQIAzgIAIdsBAQDPAgAh3AEBAM0CACHdAQAA0QIAIOQBAQDPAgAh5QFAANACACHmAUAA0AIAIYYCAQDNAgAhhwJAANACACGIAkAA3QIAIYkCAQDNAgAhigIBAM8CACGLAgEAzQIAIYwCAQDPAgAhjQIBAM8CACGOAgEAzwIAIY8CAQDPAgAhkAIIANICACGRAggA0gIAIZICCADSAgAhkwIIANICACGUAggA0gIAIZUCCADSAgAhlgIIANICACGXAggA0gIAIZgCAQDNAgAhmQIBAM8CACGaAgEAzwIAIQjnAUAAAAAB6AFAANsCACHpAUAAAAAF6gFAAAAABesBQAAAAAHsAUAAAAAB7QFAAAAAAe4BQAAAAAEZzgEAAN4CADDPAQAAywEAENABAADeAgAw0QECALMCACHTAQIAswIAIdQBAQC0AgAh1QEBALYCACHXAQEAtAIAIdoBAgCzAgAh2wEBALQCACHcAQEAtAIAId0BAAC4AgAg5AEBALYCACHlAUAAtwIAIeYBQAC3AgAhkAIIALkCACGUAggAuQIAIZUCCAC5AgAhlgIIALkCACGXAggAuQIAIZsCQAC3AgAhnAJAANkCACGdAgEAtgIAIZ4CCAC5AgAhnwIIALkCACEZzgEAAN8CADDPAQAAuAEAENABAADfAgAw0QECAMwCACHTAQIAzAIAIdQBAQDNAgAh1QEBAM8CACHXAQEAzQIAIdoBAgDMAgAh2wEBAM0CACHcAQEAzQIAId0BAADRAgAg5AEBAM8CACHlAUAA0AIAIeYBQADQAgAhkAIIANICACGUAggA0gIAIZUCCADSAgAhlgIIANICACGXAggA0gIAIZsCQADQAgAhnAJAAN0CACGdAgEAzwIAIZ4CCADSAgAhnwIIANICACEYzgEAAOACADDPAQAAsgEAENABAADgAgAw0QECALMCACHcAQEAtAIAIeQBAQC2AgAh5QFAALcCACHmAUAAtwIAIaACAQC0AgAhoQIBALQCACGiAgEAtAIAIaMCAQC0AgAhpAIBALQCACGlAgEAtAIAIaYCAQC2AgAhpwIBALYCACGoAgEAtAIAIakCCAC5AgAhqgIBALQCACGrAgEAtgIAIawCAQC0AgAhrQIBALQCACGuAgEAtAIAIa8CAQC0AgAhGM4BAADhAgAwzwEAAJ8BABDQAQAA4QIAMNEBAgDMAgAh3AEBAM0CACHkAQEAzwIAIeUBQADQAgAh5gFAANACACGgAgEAzQIAIaECAQDNAgAhogIBAM0CACGjAgEAzQIAIaQCAQDNAgAhpQIBAM0CACGmAgEAzwIAIacCAQDPAgAhqAIBAM0CACGpAggA0gIAIaoCAQDNAgAhqwIBAM8CACGsAgEAzQIAIa0CAQDNAgAhrgIBAM0CACGvAgEAzQIAIQ_OAQAA4gIAMM8BAACZAQAQ0AEAAOICADDRAQIAswIAIdwBAQC0AgAh5AEBALYCACHlAUAAtwIAIeYBQAC3AgAhgQIBALQCACGsAgEAtAIAIa0CAQC0AgAhrgIBALQCACGvAgEAtAIAIbACAQC0AgAhsQIBALQCACEPzgEAAOMCADDPAQAAhgEAENABAADjAgAw0QECAMwCACHcAQEAzQIAIeQBAQDPAgAh5QFAANACACHmAUAA0AIAIYECAQDNAgAhrAIBAM0CACGtAgEAzQIAIa4CAQDNAgAhrwIBAM0CACGwAgEAzQIAIbECAQDNAgAhEs4BAADkAgAwzwEAAIABABDQAQAA5AIAMNEBAgCzAgAh3AEBALQCACHlAUAAtwIAIeYBQAC3AgAh-gEBALQCACGBAgEAtAIAIbICAgC1AgAhswIBALQCACG0AggAuQIAIbUCCAC5AgAhtgICALMCACG3AgIAswIAIbgCCAC5AgAhuQIBALYCACG6AgAA5QIAIA8VAADEAgAgGAAA5gIAIBkAAOYCACDnAYAAAAAB6AGAAAAAAesBgAAAAAHsAYAAAAAB7QGAAAAAAe4BgAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAYAAAAAB8wGAAAAAAfQBgAAAAAEM5wGAAAAAAegBgAAAAAHrAYAAAAAB7AGAAAAAAe0BgAAAAAHuAYAAAAAB7wEBAAAAAfABAQAAAAHxAQEAAAAB8gGAAAAAAfMBgAAAAAH0AYAAAAABCs4BAADnAgAwzwEAAGgAENABAADnAgAw0QECALMCACHcAQEAtAIAIeUBQAC3AgAh5gFAALcCACGBAgEAtAIAIYICAQC0AgAhhQIBALYCACELPQAA6QIAIM4BAADoAgAwzwEAAFIAENABAADoAgAw0QECAMwCACHcAQEAzQIAIeUBQADQAgAh5gFAANACACGBAgEAzQIAIYICAQDNAgAhhQIBAM8CACEDuwIAAE4AILwCAABOACC9AgAATgAgEzwAAOwCACDOAQAA6gIAMM8BAABOABDQAQAA6gIAMNEBAgDMAgAh3AEBAM0CACHlAUAA0AIAIeYBQADQAgAh-gEBAM0CACGBAgEAzQIAIbICAgDOAgAhswIBAM0CACG0AggA0gIAIbUCCADSAgAhtgICAMwCACG3AgIAzAIAIbgCCADSAgAhuQIBAM8CACG6AgAA6wIAIAznAYAAAAAB6AGAAAAAAesBgAAAAAHsAYAAAAAB7QGAAAAAAe4BgAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAYAAAAAB8wGAAAAAAfQBgAAAAAENPQAA6QIAIM4BAADoAgAwzwEAAFIAENABAADoAgAw0QECAMwCACHcAQEAzQIAIeUBQADQAgAh5gFAANACACGBAgEAzQIAIYICAQDNAgAhhQIBAM8CACHUAgAAUgAg1QIAAFIAIBbOAQAA7QIAMM8BAABJABDQAQAA7QIAMNEBAgCzAgAh5QFAALcCACHmAUAAtwIAIaICAQC0AgAhpAIBALQCACGlAgEAtAIAIagCAADlAgAgrAIBALQCACGtAgEAtAIAIbECAQC0AgAhvgIBALQCACG_AgEAtAIAIcACAQC0AgAhwQIBALQCACHCAgEAtgIAIcMCCAC5AgAhxAIBALQCACHFAgEAtAIAIcYCAADlAgAgFs4BAADuAgAwzwEAADYAENABAADuAgAw0QECAMwCACHlAUAA0AIAIeYBQADQAgAhogIBAM0CACGkAgEAzQIAIaUCAQDNAgAhqAIAAOsCACCsAgEAzQIAIa0CAQDNAgAhsQIBAM0CACG-AgEAzQIAIb8CAQDNAgAhwAIBAM0CACHBAgEAzQIAIcICAQDPAgAhwwIIANICACHEAgEAzQIAIcUCAQDNAgAhxgIAAOsCACANzgEAAO8CADDPAQAAMAAQ0AEAAO8CADDRAQEAtAIAIdwBAQC0AgAh5QFAALcCACHmAUAAtwIAIYECAQC0AgAhggIBALQCACGFAgEAtgIAIccCIAC6AgAhyAIAALgCACDJAgAAuAIAIA3OAQAA8AIAMM8BAAAdABDQAQAA8AIAMNEBAQDNAgAh3AEBAM0CACHlAUAA0AIAIeYBQADQAgAhgQIBAM0CACGCAgEAzQIAIYUCAQDPAgAhxwIgANMCACHIAgAA0QIAIMkCAADRAgAgEs4BAADxAgAwzwEAABcAENABAADxAgAw0QECALMCACHcAQEAtAIAIeUBQAC3AgAh5gFAALcCACGBAgEAtAIAIaQCAQC0AgAhygIBALYCACHLAgEAtAIAIc0CAADyAs0CIs4CAQC0AgAhzwIBALQCACHQAgEAtgIAIdECAQC2AgAh0gIgALoCACHTAiAAugIAIQcVAAC8AgAgGAAA9AIAIBkAAPQCACDnAQAAAM0CAugBAADzAs0CIukBAAAAzQII6gEAAADNAggHFQAAvAIAIBgAAPQCACAZAAD0AgAg5wEAAADNAgLoAQAA8wLNAiLpAQAAAM0CCOoBAAAAzQIIBOcBAAAAzQIC6AEAAPQCzQIi6QEAAADNAgjqAQAAAM0CCBLOAQAA9QIAMM8BAAAEABDQAQAA9QIAMNEBAgDMAgAh3AEBAM0CACHlAUAA0AIAIeYBQADQAgAhgQIBAM0CACGkAgEAzQIAIcoCAQDPAgAhywIBAM0CACHNAgAA9gLNAiLOAgEAzQIAIc8CAQDNAgAh0AIBAM8CACHRAgEAzwIAIdICIADTAgAh0wIgANMCACEE5wEAAADNAgLoAQAA9ALNAiLpAQAAAM0CCOoBAAAAzQIIAAAAAAAAAdkCAQAAAAEF2QICAAAAAd8CAgAAAAHgAgIAAAAB4QICAAAAAeICAgAAAAEB2QIBAAAAAQHZAkAAAAABBdkCAgAAAAHfAgIAAAAB4AICAAAAAeECAgAAAAHiAgIAAAABBdkCCAAAAAHfAggAAAAB4AIIAAAAAeECCAAAAAHiAggAAAABAdkCIAAAAAEAAAAAAAAAAAAAAAAAAAAB2QJAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAABw8AAM4DACAQAADRAwAg1gIAAM8DACDXAgAA0AMAINoCAABSACDbAgAAUgAg3AIAAEwAIAMPAADOAwAg1gIAAM8DACDcAgAATAAgAAAAAAALDwAAsAMAMBAAALUDADDWAgAAsQMAMNcCAACyAwAw2AIAALMDACDZAgAAtAMAMNoCAAC0AwAw2wIAALQDADDcAgAAtAMAMN0CAAC2AwAw3gIAALcDADAO0QECAAAAAdwBAQAAAAHlAUAAAAAB5gFAAAAAAfoBAQAAAAGBAgEAAAABswIBAAAAAbQCCAAAAAG1AggAAAABtgICAAAAAbcCAgAAAAG4AggAAAABuQIBAAAAAboCgAAAAAECAAAAUAAgDwAAuwMAIAMAAABQACAPAAC7AwAgEAAAugMAIAEIAADNAwAwEzwAAOwCACDOAQAA6gIAMM8BAABOABDQAQAA6gIAMNEBAgAAAAHcAQEAzQIAIeUBQADQAgAh5gFAANACACH6AQEAAAABgQIBAM0CACGyAgIAzgIAIbMCAQDNAgAhtAIIANICACG1AggA0gIAIbYCAgDMAgAhtwICAMwCACG4AggA0gIAIbkCAQDPAgAhugIAAOsCACACAAAAUAAgCAAAugMAIAIAAAC4AwAgCAAAuQMAIBLOAQAAtwMAMM8BAAC4AwAQ0AEAALcDADDRAQIAzAIAIdwBAQDNAgAh5QFAANACACHmAUAA0AIAIfoBAQDNAgAhgQIBAM0CACGyAgIAzgIAIbMCAQDNAgAhtAIIANICACG1AggA0gIAIbYCAgDMAgAhtwICAMwCACG4AggA0gIAIbkCAQDPAgAhugIAAOsCACASzgEAALcDADDPAQAAuAMAENABAAC3AwAw0QECAMwCACHcAQEAzQIAIeUBQADQAgAh5gFAANACACH6AQEAzQIAIYECAQDNAgAhsgICAM4CACGzAgEAzQIAIbQCCADSAgAhtQIIANICACG2AgIAzAIAIbcCAgDMAgAhuAIIANICACG5AgEAzwIAIboCAADrAgAgDtEBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAh-gEBAP0CACGBAgEA_QIAIbMCAQD9AgAhtAIIAIIDACG1AggAggMAIbYCAgCBAwAhtwICAIEDACG4AggAggMAIbkCAQD_AgAhugKAAAAAAQ7RAQIAgQMAIdwBAQD9AgAh5QFAAIADACHmAUAAgAMAIfoBAQD9AgAhgQIBAP0CACGzAgEA_QIAIbQCCACCAwAhtQIIAIIDACG2AgIAgQMAIbcCAgCBAwAhuAIIAIIDACG5AgEA_wIAIboCgAAAAAEO0QECAAAAAdwBAQAAAAHlAUAAAAAB5gFAAAAAAfoBAQAAAAGBAgEAAAABswIBAAAAAbQCCAAAAAG1AggAAAABtgICAAAAAbcCAgAAAAG4AggAAAABuQIBAAAAAboCgAAAAAEEDwAAsAMAMNYCAACxAwAw2AIAALMDACDcAgAAtAMAMAACPQAAvQMAIIUCAAD3AgAgAAAAAAAAAAAAAAAAAAHZAgAAAM0CAg7RAQIAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAAB-gEBAAAAAYECAQAAAAGzAgEAAAABtAIIAAAAAbUCCAAAAAG2AgIAAAABtwICAAAAAbgCCAAAAAG5AgEAAAABugKAAAAAAQfRAQIAAAAB3AEBAAAAAeUBQAAAAAHmAUAAAAABgQIBAAAAAYICAQAAAAGFAgEAAAABAgAAAEwAIA8AAM4DACADAAAAUgAgDwAAzgMAIBAAANIDACAJAAAAUgAgCAAA0gMAINEBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAhgQIBAP0CACGCAgEA_QIAIYUCAQD_AgAhB9EBAgCBAwAh3AEBAP0CACHlAUAAgAMAIeYBQACAAwAhgQIBAP0CACGCAgEA_QIAIYUCAQD_AgAhAAAAAAUVAAYWAAcXAAgYAAkZAAoAAAAAAAUVAAYWAAcXAAgYAAkZAAoAAAADFQAQGAARGQASAAAAAxUAEBgAERkAEgAAAAUVABgWABkXABoYABsZABwAAAAAAAUVABgWABkXABoYABsZABwCFQAgPVEfATxTHgE9VAAAAAUVACQWACUXACYYACcZACgAAAAAAAUVACQWACUXACYYACcZACgBPHUeATx7HgUVAC0WAC4XAC8YADAZADEAAAAAAAUVAC0WAC4XAC8YADAZADEAAAAFFQA3FgA4FwA5GAA6GQA7AAAAAAAFFQA3FgA4FwA5GAA6GQA7AAAABRUAQRYAQhcAQxgARBkARQAAAAAABRUAQRYAQhcAQxgARBkARQAAAAUVAEsWAEwXAE0YAE4ZAE8AAAAAAAUVAEsWAEwXAE0YAE4ZAE8AAAAFFQBVFgBWFwBXGABYGQBZAAAAAAAFFQBVFgBWFwBXGABYGQBZAAAABRUAXxYAYBcAYRgAYhkAYwAAAAAABRUAXxYAYBcAYRgAYhkAYwAAAAUVAGkWAGoXAGsYAGwZAG0AAAAAAAUVAGkWAGoXAGsYAGwZAG0AAAAFFQBzFgB0FwB1GAB2GQB3AAAAAAAFFQBzFgB0FwB1GAB2GQB3AQIBAgMBBQYBBgcBBwgBCQoBCgwCCw0DDA8BDRECDhIEERMBEhQBExUCGhgFGxkLHBsMHRwMHh8MHyAMICEMISMMIiUCIyYNJCgMJSoCJisOJywMKC0MKS4CKjEPKzITLDQULTUULjgULzkUMDoUMTwUMj4CMz8VNEEUNUMCNkQWN0UUOEYUOUcCOkoXO0sdPk0eP1UeQFceQVgeQlkeQ1seRF0CRV4hRmAeR2ICSGMiSWQeSmUeS2YCTGkjTWopTmsfT2wfUG0fUW4fUm8fU3EfVHMCVXQqVncfV3kCWHorWXwfWn0fW34CXIEBLF2CATJehAEzX4UBM2CIATNhiQEzYooBM2OMATNkjgECZY8BNGaRATNnkwECaJQBNWmVATNqlgEza5cBAmyaATZtmwE8bp0BPW-eAT1woQE9caIBPXKjAT1zpQE9dKcBAnWoAT52qgE9d6wBAnitAT95rgE9eq8BPXuwAQJ8swFAfbQBRn62AUd_twFHgAG6AUeBAbsBR4IBvAFHgwG-AUeEAcABAoUBwQFIhgHDAUeHAcUBAogBxgFJiQHHAUeKAcgBR4sByQECjAHMAUqNAc0BUI4BzwFRjwHQAVGQAdMBUZEB1AFRkgHVAVGTAdcBUZQB2QEClQHaAVKWAdwBUZcB3gECmAHfAVOZAeABUZoB4QFRmwHiAQKcAeUBVJ0B5gFangHoAVufAekBW6AB7AFboQHtAVuiAe4BW6MB8AFbpAHyAQKlAfMBXKYB9QFbpwH3AQKoAfgBXakB-QFbqgH6AVurAfsBAqwB_gFerQH_AWSuAYECZa8BggJlsAGFAmWxAYYCZbIBhwJlswGJAmW0AYsCArUBjAJmtgGOAmW3AZACArgBkQJnuQGSAmW6AZMCZbsBlAICvAGXAmi9AZgCbr4BmgJvvwGbAm_AAZ4Cb8EBnwJvwgGgAm_DAaICb8QBpAICxQGlAnDGAacCb8cBqQICyAGqAnHJAasCb8oBrAJvywGtAgLMAbACcs0BsQJ4"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/config/env.ts
import "dotenv/config";
import { z } from "zod";
var envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5e3),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().default("sundara_billing_secure_jwt_secret_key_2026_us_standard"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().optional().default("*"),
  // Cloudinary credentials
  CLOUDINARY_CLOUD_NAME: z.string().default("nu6eolpm"),
  CLOUDINARY_API_KEY: z.string().default("861818668157252"),
  CLOUDINARY_API_SECRET: z.string().default("rkRQMqQLPTRpxgm0Yj1QFfkH3-k"),
  CLOUDINARY_FOLDER: z.string().default("sundara")
});
var parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  console.error("\u274C Invalid environment variables:", errors);
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error(`Missing required environment variables: ${JSON.stringify(errors)}`);
  }
  process.exit(1);
}
var env = parsedEnv.data;

// src/database/prisma.ts
var globalForPrisma = globalThis;
var adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});
var prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// src/controllers/health.controller.ts
var healthCheck = async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      db: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      db: "not connected",
      message: "Database server is unreachable or offline."
    });
  }
};

// src/routes/health.routes.ts
var router = Router();
router.get("/health", healthCheck);
var health_routes_default = router;

// src/routes/auth.routes.ts
import { Router as Router2 } from "express";

// src/validations/auth.validation.ts
import { z as z2 } from "zod";
var registerSchema = z2.object({
  name: z2.string().min(2, "Name must be at least 2 characters"),
  email: z2.string().email("Invalid email address").toLowerCase().trim(),
  mobile: z2.string().optional(),
  password: z2.string().min(6, "Password must be at least 6 characters"),
  role: z2.string().optional().default("EMPLOYEE")
});
var loginSchema = z2.object({
  email: z2.string().email("Invalid email address").toLowerCase().trim(),
  password: z2.string().min(1, "Password is required")
});

// src/utils/password.ts
import argon2 from "argon2";
var hashPassword = async (password) => {
  return await argon2.hash(password);
};
var verifyPassword = async (password, hash) => {
  return await argon2.verify(hash, password);
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var generateToken = (payload) => {
  const options = {
    expiresIn: env.JWT_EXPIRES_IN
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};
var verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

// src/services/auth.service.ts
var registerUser = async (name, email, password, role = "EMPLOYEE") => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    const error = new Error("Email already registered with another account");
    error.statusCode = 409;
    throw error;
  }
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return user;
};
var loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  if (!user.isActive) {
    const error = new Error("Account is suspended. Please contact administrator.");
    error.statusCode = 403;
    throw error;
  }
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  const effectiveRole = user.roleId === "role-admin" || user.role === "ADMIN" ? "ADMIN" : user.role;
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: effectiveRole
  });
  const userProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // "ADMIN"
    roleTitle: user.roleTitle || "Administrator",
    roleId: user.roleId || "role-admin",
    status: user.status,
    isActive: user.isActive,
    requirePasswordChange: user.requirePasswordChange,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  return { user: userProfile, token };
};
var getCurrentUser = async (userId) => {
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
      updatedAt: true
    }
  });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    ...user,
    role: user.roleTitle || user.role
  };
};

// src/controllers/auth.controller.ts
var register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(
      data.name,
      data.email,
      data.password,
      data.role || "EMPLOYEE"
    );
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
var login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data.email, data.password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token missing or invalid."
      });
    }
    const user = await getCurrentUser(req.user.userId);
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// src/middleware/auth.middleware.ts
var authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided."
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};
var requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN" && req.user.role !== "Administrator") {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Only Administrators have permission to perform this action."
    });
  }
  next();
};

// src/routes/auth.routes.ts
var router2 = Router2();
router2.post("/register", register);
router2.post("/login", login);
router2.get("/me", authenticate, getMe);
var auth_routes_default = router2;

// src/routes/settings.routes.ts
import { Router as Router3 } from "express";

// src/validations/settings.validation.ts
import { z as z3 } from "zod";
var taxSlabSchema = z3.object({
  id: z3.string().optional(),
  name: z3.string().min(1, "Tax slab name is required"),
  rate: z3.number().min(0, "Tax rate cannot be negative"),
  isDefault: z3.boolean().default(false),
  taxCode: z3.string().optional(),
  description: z3.string().optional().default(""),
  isActive: z3.boolean().default(true)
});
var paymentTermSchema = z3.object({
  id: z3.string().optional(),
  name: z3.string().min(1, "Payment term name is required"),
  days: z3.number().int().min(0, "Payment days must be positive"),
  description: z3.string().optional().default(""),
  isDefault: z3.boolean().default(false),
  isActive: z3.boolean().default(true)
});
var updateSettingsSchema = z3.object({
  companyName: z3.string().min(1, "Company name is required").optional(),
  corporateName: z3.string().optional(),
  ein: z3.string().optional(),
  salesTaxPermit: z3.string().optional(),
  address: z3.string().optional(),
  city: z3.string().optional(),
  state: z3.string().optional(),
  zipCode: z3.string().optional(),
  phone: z3.string().optional(),
  email: z3.string().email("Invalid billing email address").optional(),
  logoUrl: z3.string().nullable().optional(),
  defaultTaxRate: z3.number().min(0).max(100).optional(),
  taxCalculationMode: z3.enum(["EXCLUSIVE", "INCLUSIVE"]).optional(),
  taxLabel: z3.string().optional(),
  taxSlabs: z3.array(taxSlabSchema).optional(),
  paymentTerms: z3.array(paymentTermSchema).optional()
});

// src/services/settings.service.ts
import crypto from "crypto";
var defaultUSSettings = {
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
  logoUrl: "/logo.png",
  defaultTaxRate: 8.25,
  taxCalculationMode: "EXCLUSIVE",
  taxLabel: "Sales Tax",
  taxSlabs: [
    {
      id: "tax-std-825",
      name: "Standard US Sales Tax (8.25%)",
      rate: 8.25,
      isDefault: true,
      taxCode: "US-NC-COMB",
      description: "Combined State (4.75%) + Local County/City (3.50%) sales tax",
      isActive: true
    },
    {
      id: "tax-resale-0",
      name: "Wholesale / Resale Certificate (0%)",
      rate: 0,
      isDefault: false,
      taxCode: "US-RESALE-EXEMPT",
      description: "Tax-exempt wholesale purchases under active State Resale Permit",
      isActive: true
    },
    {
      id: "tax-outstate-0",
      name: "Out-of-State Non-Nexus Delivery (0%)",
      rate: 0,
      isDefault: false,
      taxCode: "US-NON-NEXUS",
      description: "Commercial shipments outside company tax nexus",
      isActive: true
    },
    {
      id: "tax-flat-700",
      name: "Interstate Retail Flat Tax (7.00%)",
      rate: 7,
      isDefault: false,
      taxCode: "US-INTERSTATE-FLAT",
      description: "Standard single flat destination rate for neighboring states",
      isActive: true
    }
  ],
  paymentTerms: [
    {
      id: "term-net-30",
      name: "Net 30",
      days: 30,
      description: "Payment due within 30 calendar days from invoice issue date",
      isDefault: true,
      isActive: true
    },
    {
      id: "term-due-receipt",
      name: "Due on Receipt",
      days: 0,
      description: "Immediate payment required upon physical invoice delivery",
      isDefault: false,
      isActive: true
    },
    {
      id: "term-net-15",
      name: "Net 15",
      days: 15,
      description: "Payment due within 15 calendar days from billing date",
      isDefault: false,
      isActive: true
    },
    {
      id: "term-net-60",
      name: "Net 60",
      days: 60,
      description: "Extended commercial financing credit terms",
      isDefault: false,
      isActive: true
    }
  ]
};
var getSystemSettings = async () => {
  let settings = await prisma.setting.findFirst({
    orderBy: { id: "asc" }
  });
  if (!settings) {
    settings = await prisma.setting.create({
      data: defaultUSSettings
    });
  }
  return settings;
};
var updateSystemSettings = async (updateData) => {
  if (Array.isArray(updateData.taxSlabs)) {
    updateData.taxSlabs = updateData.taxSlabs.map((slab) => ({
      ...slab,
      id: slab.id && slab.id.trim() !== "" ? slab.id : `tax-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`
    }));
  }
  if (Array.isArray(updateData.paymentTerms)) {
    updateData.paymentTerms = updateData.paymentTerms.map((term) => ({
      ...term,
      id: term.id && term.id.trim() !== "" ? term.id : `term-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`
    }));
  }
  let settings = await prisma.setting.findFirst({
    orderBy: { id: "asc" }
  });
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        ...defaultUSSettings,
        ...updateData
      }
    });
  } else {
    settings = await prisma.setting.update({
      where: { id: settings.id },
      data: updateData
    });
  }
  return settings;
};

// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

// src/services/upload.service.ts
var uploadBufferToCloudinary = (fileBuffer, folderName = env.CLOUDINARY_FOLDER) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto"
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};
var extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match && match[1] ? match[1] : null;
};
var deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary asset deletion failed:", error);
    return false;
  }
};

// src/controllers/settings.controller.ts
var getSettings = async (_req, res, next) => {
  try {
    const settings = await getSystemSettings();
    res.status(200).json({
      success: true,
      message: "Business settings fetched successfully",
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
var updateSettings = async (req, res, next) => {
  try {
    const rawBody = { ...req.body };
    if (req.file) {
      const currentSettings = await getSystemSettings();
      if (currentSettings?.logoUrl) {
        const oldPublicId = extractPublicIdFromUrl(currentSettings.logoUrl);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      rawBody.logoUrl = uploadResult.secureUrl;
    }
    if (typeof rawBody.defaultTaxRate === "string") {
      rawBody.defaultTaxRate = Number(rawBody.defaultTaxRate);
    }
    if (typeof rawBody.taxSlabs === "string") {
      try {
        rawBody.taxSlabs = JSON.parse(rawBody.taxSlabs);
      } catch {
      }
    }
    if (typeof rawBody.paymentTerms === "string") {
      try {
        rawBody.paymentTerms = JSON.parse(rawBody.paymentTerms);
      } catch {
      }
    }
    const validatedData = updateSettingsSchema.parse(rawBody);
    const updatedSettings = await updateSystemSettings(validatedData);
    res.status(200).json({
      success: true,
      message: "Business settings updated successfully",
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};

// src/middleware/upload.middleware.ts
import multer from "multer";
var ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml"
];
var storage = multer.memoryStorage();
var multerConfig = {
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB maximum file size
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PNG, JPG, JPEG, WEBP, and SVG images are permitted."
        )
      );
    }
  }
};
var uploadLogoMiddleware = multer(multerConfig).single("logo");
var uploadProductImageMiddleware = multer(multerConfig).single("image");

// src/routes/settings.routes.ts
var router3 = Router3();
router3.get("/", getSettings);
router3.put("/", authenticate, uploadLogoMiddleware, updateSettings);
var settings_routes_default = router3;

// src/routes/category.routes.ts
import { Router as Router4 } from "express";

// src/utils/pagination.ts
var getPaginationParams = (query, defaultLimit = 10) => {
  if (query?.limit === "all" || query?.all === "true") {
    return {
      page: 1,
      limit: 1e5,
      skip: 0,
      isPaginated: false
    };
  }
  const page = Math.max(1, parseInt(String(query?.page || 1), 10) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(String(query?.limit || defaultLimit), 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip,
    isPaginated: true
  };
};
var buildPaginationMetadata = (totalItems, page, limit) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    currentPage: page,
    totalPages,
    totalItems,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

// src/validations/category.validation.ts
import { z as z4 } from "zod";
var createCategorySchema = z4.object({
  name: z4.string().min(2, "Category name must be at least 2 characters").trim(),
  code: z4.string().min(2, "Category code must be at least 2 characters").toUpperCase().trim(),
  description: z4.string().optional(),
  status: z4.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE")
});
var updateCategorySchema = z4.object({
  name: z4.string().min(2, "Category name must be at least 2 characters").trim().optional(),
  code: z4.string().min(2, "Category code must be at least 2 characters").toUpperCase().trim().optional(),
  description: z4.string().optional(),
  status: z4.enum(["ACTIVE", "INACTIVE"]).optional()
});

// src/services/category.service.ts
var initialCategories = [
  { name: "Furniture", code: "FUR", description: "Furniture products including chairs, tables and consoles." },
  { name: "Bedding", code: "BED", description: "Bedsheets, bedding sets and related products." },
  { name: "Home Decor", code: "DEC", description: "Decorative products and accessories for the home." },
  { name: "Lighting", code: "LGT", description: "Floor lamps, table lamps and other lighting products." },
  { name: "Rugs", code: "RUG", description: "Area rugs and decorative floor coverings." }
];
var getAllCategories = async (filters, pagination) => {
  const existingCount = await prisma.category.count();
  if (existingCount === 0) {
    await prisma.category.createMany({
      data: initialCategories,
      skipDuplicates: true
    });
  }
  const whereClause = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { code: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } }
    ];
  }
  const allFiltered = await prisma.category.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { id: "asc" }
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
    totalProductCount
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
    updatedAt: c.updatedAt
  }));
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    categories: formatted,
    pagination: paginationMeta,
    kpi
  };
};
var getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    ...category,
    productCount: category._count.products
  };
};
var createCategory = async (data) => {
  const existingCode = await prisma.category.findFirst({
    where: {
      OR: [{ code: data.code }, { name: data.name }]
    }
  });
  if (existingCode) {
    const error = new Error("Category with this name or code already exists");
    error.statusCode = 409;
    throw error;
  }
  const category = await prisma.category.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description || "",
      status: data.status || "ACTIVE"
    }
  });
  return category;
};
var updateCategory = async (id, data) => {
  await getCategoryById(id);
  if (data.name || data.code) {
    const duplicate = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...data.name ? [{ name: data.name }] : [],
              ...data.code ? [{ code: data.code }] : []
            ]
          }
        ]
      }
    });
    if (duplicate) {
      const error = new Error("Another category already exists with this name or code");
      error.statusCode = 409;
      throw error;
    }
  }
  const updated = await prisma.category.update({
    where: { id },
    data
  });
  return updated;
};
var deleteCategory = async (id) => {
  await getCategoryById(id);
  const productCount = await prisma.product.count({
    where: { categoryId: id }
  });
  if (productCount > 0) {
    const error = new Error(
      `Cannot delete category. There are ${productCount} products assigned to it.`
    );
    error.statusCode = 400;
    throw error;
  }
  await prisma.category.delete({
    where: { id }
  });
  return { id };
};

// src/controllers/category.controller.ts
var getCategories = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllCategories(
      {
        search: search ? String(search) : void 0,
        status: status ? String(status) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.categories
    });
  } catch (error) {
    next(error);
  }
};
var getCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const category = await getCategoryById(id);
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var addCategory = async (req, res, next) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await createCategory(validatedData);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var editCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await updateCategory(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    next(error);
  }
};
var removeCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/category.routes.ts
var router4 = Router4();
router4.get("/", getCategories);
router4.get("/:id", getCategory);
router4.post("/", authenticate, addCategory);
router4.put("/:id", authenticate, editCategory);
router4.delete("/:id", authenticate, removeCategory);
var category_routes_default = router4;

// src/routes/product.routes.ts
import { Router as Router5 } from "express";

// src/validations/product.validation.ts
import { z as z5 } from "zod";
var createProductSchema = z5.object({
  name: z5.string().min(2, "Product name must be at least 2 characters").trim(),
  sku: z5.string().min(2, "Product SKU must be at least 2 characters").toUpperCase().trim(),
  categoryId: z5.number().int().positive().optional().nullable(),
  uom: z5.string().optional().default("PCS"),
  costPrice: z5.number().min(0, "Cost price cannot be negative").default(0),
  sellingPrice: z5.number().min(0, "Selling price cannot be negative").default(0),
  stock: z5.number().int().min(0).default(0),
  reorderLevel: z5.number().int().min(0).default(10),
  taxRate: z5.number().min(0).max(100).default(8.25),
  status: z5.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  imageUrl: z5.string().nullable().optional(),
  salesChannels: z5.array(z5.string()).optional().default([])
});
var updateProductSchema = z5.object({
  name: z5.string().min(2, "Product name must be at least 2 characters").trim().optional(),
  sku: z5.string().min(2, "Product SKU must be at least 2 characters").toUpperCase().trim().optional(),
  categoryId: z5.number().int().positive().optional().nullable(),
  uom: z5.string().optional(),
  costPrice: z5.number().min(0, "Cost price cannot be negative").optional(),
  sellingPrice: z5.number().min(0, "Selling price cannot be negative").optional(),
  stock: z5.number().int().min(0).optional(),
  reorderLevel: z5.number().int().min(0).optional(),
  taxRate: z5.number().min(0).max(100).optional(),
  status: z5.enum(["ACTIVE", "INACTIVE"]).optional(),
  imageUrl: z5.string().nullable().optional(),
  salesChannels: z5.array(z5.string()).optional()
});

// src/services/product.service.ts
var getAllProducts = async (filters, pagination) => {
  const where = {};
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search.trim(), mode: "insensitive" } },
      { sku: { contains: filters.search.trim(), mode: "insensitive" } }
    ];
  }
  if (filters?.stockFilter === "OUT_OF_STOCK") {
    where.stock = 0;
  } else if (filters?.stockFilter === "IN_STOCK") {
    where.stock = { gt: 0 };
  }
  const allFiltered = await prisma.product.findMany({
    where,
    select: {
      id: true,
      status: true,
      stock: true,
      costPrice: true,
      reorderLevel: true,
      salesChannels: true
    }
  });
  let matchedIds = null;
  if (filters?.channel && filters.channel !== "ALL") {
    matchedIds = allFiltered.filter((p) => {
      const ch = p.salesChannels;
      return Array.isArray(ch) && ch.includes(filters.channel);
    }).map((p) => p.id);
    where.id = { in: matchedIds };
  }
  const finalPool = matchedIds ? allFiltered.filter((p) => matchedIds.includes(p.id)) : allFiltered;
  const totalItems = finalPool.length;
  const totalProducts = totalItems;
  const activeProducts = finalPool.filter((p) => p.status === "ACTIVE").length;
  const inactiveProducts = finalPool.filter((p) => p.status === "INACTIVE").length;
  const outOfStockProducts = finalPool.filter((p) => p.stock === 0).length;
  const lowStockProducts = finalPool.filter(
    (p) => p.stock > 0 && p.stock <= (p.reorderLevel || 10)
  ).length;
  const totalInventoryValue = finalPool.reduce(
    (sum, p) => sum + p.stock * p.costPrice,
    0
  );
  const kpi = {
    totalProducts,
    activeProducts,
    inactiveProducts,
    lowStockProducts,
    outOfStockProducts,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100
  };
  const products = await prisma.product.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    },
    ...pagination && {
      skip: pagination.skip,
      take: pagination.limit
    }
  });
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    products,
    pagination: paginationMeta,
    kpi
  };
};
var getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true
    }
  });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
};
var createProduct = async (data) => {
  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku }
  });
  if (existingSku) {
    const error = new Error(`Product with SKU '${data.sku}' already exists`);
    error.statusCode = 409;
    throw error;
  }
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!categoryExists) {
      const error = new Error(
        `Category with ID ${data.categoryId} does not exist. Call GET /api/categories to see available categories.`
      );
      error.statusCode = 400;
      throw error;
    }
  }
  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId || null,
      uom: data.uom || "PCS",
      costPrice: data.costPrice ?? 0,
      sellingPrice: data.sellingPrice ?? 0,
      stock: data.stock ?? 0,
      reorderLevel: data.reorderLevel ?? 10,
      taxRate: data.taxRate ?? 8.25,
      status: data.status || "ACTIVE",
      imageUrl: data.imageUrl || null,
      salesChannels: data.salesChannels || []
    },
    include: {
      category: true
    }
  });
  return product;
};
var updateProduct = async (id, data) => {
  await getProductById(id);
  if (data.sku) {
    const existingSku = await prisma.product.findFirst({
      where: {
        AND: [{ id: { not: id } }, { sku: data.sku }]
      }
    });
    if (existingSku) {
      const error = new Error(`Another product already has SKU '${data.sku}'`);
      error.statusCode = 409;
      throw error;
    }
  }
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!categoryExists) {
      const error = new Error(
        `Category with ID ${data.categoryId} does not exist. Call GET /api/categories to see available categories.`
      );
      error.statusCode = 400;
      throw error;
    }
  }
  const updated = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true
    }
  });
  return updated;
};
var deleteProduct = async (id) => {
  const product = await getProductById(id);
  if (product.imageUrl) {
    const publicId = extractPublicIdFromUrl(product.imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }
  await prisma.product.delete({
    where: { id }
  });
  return { id };
};

// src/controllers/product.controller.ts
var parseMultipartFields = (body) => {
  const parsed = { ...body };
  if (typeof parsed.costPrice === "string") parsed.costPrice = Number(parsed.costPrice);
  if (typeof parsed.sellingPrice === "string") parsed.sellingPrice = Number(parsed.sellingPrice);
  if (typeof parsed.stock === "string") parsed.stock = Number(parsed.stock);
  if (typeof parsed.reorderLevel === "string") parsed.reorderLevel = Number(parsed.reorderLevel);
  if (typeof parsed.taxRate === "string") parsed.taxRate = Number(parsed.taxRate);
  if (typeof parsed.categoryId === "string") {
    const trimmed = parsed.categoryId.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined") {
      parsed.categoryId = null;
    } else {
      parsed.categoryId = Number(trimmed);
    }
  }
  if (typeof parsed.salesChannels === "string") {
    try {
      parsed.salesChannels = JSON.parse(parsed.salesChannels);
    } catch {
      parsed.salesChannels = parsed.salesChannels.split(",").map((s) => s.trim());
    }
  }
  return parsed;
};
var getProducts = async (req, res, next) => {
  try {
    const { search, categoryId, status, channel, stockFilter } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllProducts(
      {
        search: search ? String(search) : void 0,
        categoryId: categoryId ? Number(categoryId) : void 0,
        status: status ? String(status) : void 0,
        channel: channel ? String(channel) : void 0,
        stockFilter: stockFilter ? String(stockFilter) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.products
    });
  } catch (error) {
    next(error);
  }
};
var getProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const product = await getProductById(id);
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};
var addProduct = async (req, res, next) => {
  try {
    const rawBody = parseMultipartFields(req.body);
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "sundara/products"
      );
      rawBody.imageUrl = uploadResult.secureUrl;
    }
    const validatedData = createProductSchema.parse(rawBody);
    const product = await createProduct(validatedData);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};
var editProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rawBody = parseMultipartFields(req.body);
    if (req.file) {
      const existingProduct = await getProductById(id);
      if (existingProduct.imageUrl) {
        const oldPublicId = extractPublicIdFromUrl(existingProduct.imageUrl);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "sundara/products"
      );
      rawBody.imageUrl = uploadResult.secureUrl;
    }
    const validatedData = updateProductSchema.parse(rawBody);
    const updatedProduct = await updateProduct(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};
var removeProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteProduct(id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/product.routes.ts
var router5 = Router5();
router5.get("/", getProducts);
router5.get("/:id", getProduct);
router5.post("/", authenticate, uploadProductImageMiddleware, addProduct);
router5.put("/:id", authenticate, uploadProductImageMiddleware, editProduct);
router5.delete("/:id", authenticate, removeProduct);
var product_routes_default = router5;

// src/routes/warehouse.routes.ts
import { Router as Router6 } from "express";

// src/validations/warehouse.validation.ts
import { z as z6 } from "zod";
var createWarehouseSchema = z6.object({
  warehouseCode: z6.string().min(2, "Warehouse code must be at least 2 characters").toUpperCase().trim(),
  name: z6.string().min(2, "Warehouse name must be at least 2 characters").trim(),
  address: z6.string().min(2, "Address is required").trim(),
  city: z6.string().min(2, "City is required").trim(),
  state: z6.string().min(2, "State is required").trim(),
  postalCode: z6.string().min(2, "Postal code is required").trim(),
  country: z6.string().optional().default("United States"),
  status: z6.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  notes: z6.string().optional().default("")
});
var updateWarehouseSchema = z6.object({
  warehouseCode: z6.string().min(2).toUpperCase().trim().optional(),
  name: z6.string().min(2).trim().optional(),
  address: z6.string().min(2).trim().optional(),
  city: z6.string().min(2).trim().optional(),
  state: z6.string().min(2).trim().optional(),
  postalCode: z6.string().min(2).trim().optional(),
  country: z6.string().optional(),
  status: z6.enum(["ACTIVE", "INACTIVE"]).optional(),
  notes: z6.string().optional()
});

// src/services/warehouse.service.ts
var initialWarehouses = [
  {
    warehouseCode: "WH-01",
    name: "Central Distribution Center (CDC)",
    address: "4800 E 48th Ave, Bay 6",
    city: "Denver",
    state: "CO",
    postalCode: "80216",
    country: "United States",
    status: "ACTIVE",
    notes: "Main cross-docking and inventory storage hub for solid wood dining and living furniture."
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
    notes: "Serving Northeast residential orders, designer direct shipments, and retail replenishment."
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
    notes: "Specialized in lighting fixtures, textiles, bedding stock, and imported decor accessories."
  }
];
var getAllWarehouses = async (filters, pagination) => {
  const existingCount = await prisma.warehouse.count();
  if (existingCount === 0) {
    await prisma.warehouse.createMany({
      data: initialWarehouses,
      skipDuplicates: true
    });
  }
  const whereClause = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { warehouseCode: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { state: { contains: term, mode: "insensitive" } }
    ];
  }
  const allFiltered = await prisma.warehouse.findMany({
    where: whereClause,
    orderBy: { id: "asc" }
  });
  const totalWarehouses = allFiltered.length;
  const activeWarehouses = allFiltered.filter((w) => w.status === "ACTIVE").length;
  const inactiveWarehouses = allFiltered.filter((w) => w.status === "INACTIVE").length;
  const kpi = {
    totalWarehouses,
    activeWarehouses,
    inactiveWarehouses
  };
  const totalItems = allFiltered.length;
  let pagedWarehouses = allFiltered;
  if (pagination && pagination.isPaginated) {
    pagedWarehouses = allFiltered.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    warehouses: pagedWarehouses,
    pagination: paginationMeta,
    kpi
  };
};
var getWarehouseById = async (id) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id }
  });
  if (!warehouse) {
    const error = new Error("Warehouse facility not found");
    error.statusCode = 404;
    throw error;
  }
  return warehouse;
};
var createWarehouse = async (data) => {
  const existing = await prisma.warehouse.findUnique({
    where: { warehouseCode: data.warehouseCode }
  });
  if (existing) {
    const error = new Error(`Warehouse with code '${data.warehouseCode}' already exists`);
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
      notes: data.notes || ""
    }
  });
  return warehouse;
};
var updateWarehouse = async (id, data) => {
  await getWarehouseById(id);
  if (data.warehouseCode) {
    const duplicate = await prisma.warehouse.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { warehouseCode: data.warehouseCode }
        ]
      }
    });
    if (duplicate) {
      const error = new Error(`Warehouse code '${data.warehouseCode}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }
  const updated = await prisma.warehouse.update({
    where: { id },
    data
  });
  return updated;
};
var deleteWarehouse = async (id) => {
  await getWarehouseById(id);
  await prisma.warehouse.delete({
    where: { id }
  });
  return { id };
};

// src/controllers/warehouse.controller.ts
var getWarehouses = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllWarehouses(
      {
        search: search ? String(search) : void 0,
        status: status ? String(status) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.warehouses
    });
  } catch (error) {
    next(error);
  }
};
var getWarehouse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const warehouse = await getWarehouseById(id);
    res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};
var addWarehouse = async (req, res, next) => {
  try {
    const validatedData = createWarehouseSchema.parse(req.body);
    const warehouse = await createWarehouse(validatedData);
    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};
var editWarehouse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateWarehouseSchema.parse(req.body);
    const warehouse = await updateWarehouse(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};
var removeWarehouse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteWarehouse(id);
    res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/warehouse.routes.ts
var router6 = Router6();
router6.get("/", getWarehouses);
router6.get("/:id", getWarehouse);
router6.post("/", authenticate, addWarehouse);
router6.put("/:id", authenticate, editWarehouse);
router6.delete("/:id", authenticate, removeWarehouse);
var warehouse_routes_default = router6;

// src/routes/supplier.routes.ts
import { Router as Router7 } from "express";

// src/validations/supplier.validation.ts
import { z as z7 } from "zod";
var createSupplierSchema = z7.object({
  supplierCode: z7.string().min(2, "Supplier code must be at least 2 characters").toUpperCase().trim(),
  supplierType: z7.enum(["BUSINESS", "INDIVIDUAL"]).optional().default("BUSINESS"),
  companyName: z7.string().min(2, "Company name is required").trim(),
  contactPerson: z7.string().min(2, "Contact person is required").trim(),
  email: z7.string().email("Invalid email address").toLowerCase().trim(),
  phone: z7.string().min(5, "Valid phone number is required").trim(),
  alternatePhone: z7.string().optional().default(""),
  taxId: z7.string().optional().default(""),
  paymentTerms: z7.string().optional().default("Net 30"),
  openingBalance: z7.number().default(0),
  addressLine1: z7.string().min(2, "Address line 1 is required").trim(),
  addressLine2: z7.string().optional().default(""),
  city: z7.string().min(2, "City is required").trim(),
  state: z7.string().min(2, "State is required").trim(),
  postalCode: z7.string().min(2, "Postal code is required").trim(),
  country: z7.string().optional().default("United States"),
  notes: z7.string().optional().default(""),
  status: z7.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE")
});
var updateSupplierSchema = z7.object({
  supplierCode: z7.string().min(2).toUpperCase().trim().optional(),
  supplierType: z7.enum(["BUSINESS", "INDIVIDUAL"]).optional(),
  companyName: z7.string().min(2).trim().optional(),
  contactPerson: z7.string().min(2).trim().optional(),
  email: z7.string().email().toLowerCase().trim().optional(),
  phone: z7.string().min(5).trim().optional(),
  alternatePhone: z7.string().optional(),
  taxId: z7.string().optional(),
  paymentTerms: z7.string().optional(),
  openingBalance: z7.number().optional(),
  addressLine1: z7.string().min(2).trim().optional(),
  addressLine2: z7.string().optional(),
  city: z7.string().min(2).trim().optional(),
  state: z7.string().min(2).trim().optional(),
  postalCode: z7.string().min(2).trim().optional(),
  country: z7.string().optional(),
  notes: z7.string().optional(),
  status: z7.enum(["ACTIVE", "INACTIVE"]).optional()
});

// src/services/supplier.service.ts
var initialSuppliers = [
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
    status: "ACTIVE"
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
    status: "ACTIVE"
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
    status: "ACTIVE"
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
    status: "ACTIVE"
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
    status: "ACTIVE"
  }
];
var getAllSuppliers = async (filters, pagination) => {
  const existingCount = await prisma.supplier.count();
  if (existingCount === 0) {
    await prisma.supplier.createMany({
      data: initialSuppliers,
      skipDuplicates: true
    });
  }
  const where = {};
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    where.OR = [
      { companyName: { contains: term, mode: "insensitive" } },
      { supplierCode: { contains: term, mode: "insensitive" } },
      { contactPerson: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } }
    ];
  }
  const allFiltered = await prisma.supplier.findMany({
    where,
    orderBy: { id: "asc" }
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
    totalOpeningBalance: Math.round(totalOpeningBalance * 100) / 100
  };
  const totalItems = allFiltered.length;
  let pagedSuppliers = allFiltered;
  if (pagination && pagination.isPaginated) {
    pagedSuppliers = allFiltered.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    suppliers: pagedSuppliers,
    pagination: paginationMeta,
    kpi
  };
};
var getSupplierById = async (id) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id }
  });
  if (!supplier) {
    const error = new Error("Supplier not found");
    error.statusCode = 404;
    throw error;
  }
  return supplier;
};
var createSupplier = async (data) => {
  const existing = await prisma.supplier.findUnique({
    where: { supplierCode: data.supplierCode }
  });
  if (existing) {
    const error = new Error(`Supplier with code '${data.supplierCode}' already exists`);
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
      status: data.status || "ACTIVE"
    }
  });
  return supplier;
};
var updateSupplier = async (id, data) => {
  await getSupplierById(id);
  if (data.supplierCode) {
    const duplicate = await prisma.supplier.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { supplierCode: data.supplierCode }
        ]
      }
    });
    if (duplicate) {
      const error = new Error(`Supplier code '${data.supplierCode}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }
  const updated = await prisma.supplier.update({
    where: { id },
    data
  });
  return updated;
};
var deleteSupplier = async (id) => {
  await getSupplierById(id);
  await prisma.supplier.delete({
    where: { id }
  });
  return { id };
};

// src/controllers/supplier.controller.ts
var getSuppliers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllSuppliers(
      {
        search: search ? String(search) : void 0,
        status: status ? String(status) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Suppliers fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.suppliers
    });
  } catch (error) {
    next(error);
  }
};
var getSupplier = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const supplier = await getSupplierById(id);
    res.status(200).json({
      success: true,
      message: "Supplier fetched successfully",
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
var addSupplier = async (req, res, next) => {
  try {
    const validatedData = createSupplierSchema.parse(req.body);
    const supplier = await createSupplier(validatedData);
    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
var editSupplier = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateSupplierSchema.parse(req.body);
    const supplier = await updateSupplier(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
var removeSupplier = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteSupplier(id);
    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/supplier.routes.ts
var router7 = Router7();
router7.get("/", getSuppliers);
router7.get("/:id", getSupplier);
router7.post("/", authenticate, addSupplier);
router7.put("/:id", authenticate, editSupplier);
router7.delete("/:id", authenticate, removeSupplier);
var supplier_routes_default = router7;

// src/routes/purchase.routes.ts
import { Router as Router8 } from "express";

// src/validations/purchase.validation.ts
import { z as z8 } from "zod";
var purchaseItemSchema = z8.object({
  id: z8.union([z8.number(), z8.string()]).optional(),
  productId: z8.number().int().positive("Valid product ID required"),
  sku: z8.string().optional(),
  productName: z8.string().optional(),
  quantity: z8.number().min(1, "Quantity must be at least 1"),
  unitCost: z8.number().min(0, "Unit cost cannot be negative").optional(),
  discount: z8.number().min(0).default(0).optional(),
  taxRate: z8.number().min(0).default(8.25).optional(),
  lineTotal: z8.number().min(0).optional(),
  receivedQuantity: z8.number().min(0).default(0).optional()
});
var createPurchaseSchema = z8.object({
  purchaseNumber: z8.string().optional(),
  // Auto-generated by backend e.g. PO-2026-003
  supplierId: z8.number().int().positive("Supplier ID is required"),
  supplierName: z8.string().optional(),
  // Auto-resolved by backend from supplierId if omitted
  warehouseId: z8.number().int().positive("Warehouse ID is required"),
  warehouseName: z8.string().optional(),
  // Auto-resolved by backend from warehouseId if omitted
  purchaseDate: z8.string().optional(),
  expectedDate: z8.string().optional(),
  supplierInvoiceNumber: z8.string().optional(),
  containerNumber: z8.string().optional(),
  status: z8.enum(["DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]).default("DRAFT"),
  items: z8.array(purchaseItemSchema).min(1, "At least one item is required in purchase order"),
  subtotal: z8.number().min(0).optional(),
  discount: z8.number().min(0).default(0).optional(),
  tax: z8.number().min(0).default(0).optional(),
  additionalCharges: z8.number().min(0).default(0).optional(),
  grandTotal: z8.number().min(0).optional(),
  amountPaid: z8.number().min(0).default(0).optional(),
  balanceDue: z8.number().min(0).optional(),
  notes: z8.string().optional()
});
var updatePurchaseSchema = createPurchaseSchema.partial();

// src/utils/dateFilter.ts
var parseDateRangeFilter = (timeRange, startDate, endDate) => {
  const range = (timeRange || "").toUpperCase().trim();
  const now = /* @__PURE__ */ new Date();
  if (range === "CUSTOM" || !range && (startDate || endDate)) {
    if (!startDate && !endDate) return void 0;
    const filter = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filter.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.lte = end;
    }
    return filter;
  }
  if (range === "TODAY") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (range === "7D") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }
  if (range === "30D") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }
  if (range === "THIS_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (range === "LAST_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (range === "THIS_YEAR") {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  return void 0;
};

// src/services/purchase.service.ts
var initialPurchases = [
  {
    purchaseNumber: "PO-2026-001",
    supplierId: 1,
    supplierName: "Appalachian Hardwood Mills",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    purchaseDate: /* @__PURE__ */ new Date("2026-09-10T10:00:00Z"),
    expectedDate: /* @__PURE__ */ new Date("2026-09-24T15:30:00Z"),
    supplierInvoiceNumber: "INV-AHM-9821",
    containerNumber: "MSCU-829104-5",
    status: "RECEIVED",
    items: [
      {
        id: 101,
        productId: 5,
        sku: "TBL-002",
        productName: "Walnut Console Table",
        quantity: 10,
        unitCost: 450,
        discount: 0,
        taxRate: 0,
        lineTotal: 4500,
        receivedQuantity: 10
      },
      {
        id: 102,
        productId: 3,
        sku: "TBL-001",
        productName: "Oak Side Table",
        quantity: 15,
        unitCost: 170,
        discount: 50,
        taxRate: 0,
        lineTotal: 2500,
        receivedQuantity: 15
      }
    ],
    subtotal: 7e3,
    discount: 50,
    tax: 0,
    additionalCharges: 350,
    grandTotal: 7300,
    amountPaid: 7300,
    balanceDue: 0,
    notes: "Direct flatbed freight shipment from Asheville lumber yard."
  },
  {
    purchaseNumber: "PO-2026-002",
    supplierId: 2,
    supplierName: "Heritage Loom & Textile Co.",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    purchaseDate: /* @__PURE__ */ new Date("2026-10-05T09:15:00Z"),
    expectedDate: /* @__PURE__ */ new Date("2026-11-02T12:00:00Z"),
    supplierInvoiceNumber: "HLT-44021",
    containerNumber: "MAEU-551029-1",
    status: "ORDERED",
    items: [
      {
        id: 201,
        productId: 1,
        sku: "BED-001",
        productName: "Cotton Bedsheet Set - Queen",
        quantity: 30,
        unitCost: 120,
        discount: 0,
        taxRate: 0,
        lineTotal: 3600,
        receivedQuantity: 0
      }
    ],
    subtotal: 3600,
    discount: 0,
    tax: 0,
    additionalCharges: 180,
    grandTotal: 3780,
    amountPaid: 1500,
    balanceDue: 2280,
    notes: "Container arrival expected at Port Newark with rail transfer to NC."
  }
];
var seedInitialPurchases = async () => {
  const count = await prisma.purchase.count();
  if (count === 0) {
    for (const po of initialPurchases) {
      await prisma.purchase.create({
        data: po
      });
    }
  }
};
var generateNextPoNumber = async () => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const prefix = `PO-${currentYear}-`;
  const latestPo = await prisma.purchase.findFirst({
    where: {
      purchaseNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      id: "desc"
    }
  });
  if (!latestPo) {
    return `${prefix}001`;
  }
  const parts = latestPo.purchaseNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
};
var getAllPurchases = async (filters, pagination) => {
  await seedInitialPurchases();
  const whereClause = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.supplierId) {
    whereClause.supplierId = filters.supplierId;
  }
  if (filters?.warehouseId) {
    whereClause.warehouseId = filters.warehouseId;
  }
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.purchaseDate = dateFilter;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { purchaseNumber: { contains: term, mode: "insensitive" } },
      { supplierName: { contains: term, mode: "insensitive" } },
      { supplierInvoiceNumber: { contains: term, mode: "insensitive" } },
      { containerNumber: { contains: term, mode: "insensitive" } }
    ];
  }
  const totalItems = await prisma.purchase.count({
    where: whereClause
  });
  const allFilteredPOs = await prisma.purchase.findMany({
    where: whereClause,
    select: {
      grandTotal: true,
      balanceDue: true,
      status: true
    }
  });
  const totalCount = allFilteredPOs.length;
  const totalValue = allFilteredPOs.reduce((acc, p) => acc + p.grandTotal, 0);
  const receivedCount = allFilteredPOs.filter((p) => p.status === "RECEIVED").length;
  const draftCount = allFilteredPOs.filter((p) => p.status === "DRAFT").length;
  const orderedCount = allFilteredPOs.filter((p) => p.status === "ORDERED").length;
  const totalBalanceDue = allFilteredPOs.reduce((acc, p) => acc + p.balanceDue, 0);
  const kpi = {
    totalCount,
    totalValue: Math.round(totalValue * 100) / 100,
    receivedCount,
    draftCount,
    orderedCount,
    totalBalanceDue: Math.round(totalBalanceDue * 100) / 100
  };
  const purchases = await prisma.purchase.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc"
    },
    ...pagination && {
      skip: pagination.skip,
      take: pagination.limit
    }
  });
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    purchases,
    pagination: paginationMeta,
    kpi
  };
};
var getPurchaseById = async (id) => {
  await seedInitialPurchases();
  const purchase = await prisma.purchase.findUnique({
    where: { id }
  });
  if (!purchase) {
    const error = new Error("Purchase order not found");
    error.statusCode = 404;
    throw error;
  }
  return purchase;
};
var createPurchase = async (data) => {
  const purchaseNumber = data.purchaseNumber || await generateNextPoNumber();
  const existing = await prisma.purchase.findUnique({
    where: { purchaseNumber }
  });
  if (existing) {
    const error = new Error(`Purchase order '${purchaseNumber}' already exists`);
    error.statusCode = 409;
    throw error;
  }
  let supplierName = data.supplierName;
  if (!supplierName) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    });
    supplierName = supplier?.companyName || "Vendor";
  }
  let warehouseName = data.warehouseName;
  if (!warehouseName) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId }
    });
    warehouseName = warehouse?.name || "Main Warehouse";
  }
  const resolvedItems = await Promise.all(
    data.items.map(async (item, index) => {
      let sku = item.sku;
      let productName = item.productName;
      let unitCost = item.unitCost;
      if (!sku || !productName || unitCost === void 0) {
        const prod = await prisma.product.findUnique({
          where: { id: Number(item.productId) }
        });
        if (prod) {
          sku = sku || prod.sku;
          productName = productName || prod.name;
          unitCost = unitCost !== void 0 ? unitCost : prod.costPrice;
        }
      }
      const cost = Number(unitCost) || 0;
      const discount2 = Number(item.discount) || 0;
      const quantity = Number(item.quantity) || 1;
      const lineTotal = item.lineTotal !== void 0 ? Number(item.lineTotal) : Math.max(0, quantity * cost - discount2);
      return {
        id: item.id || index + 1,
        productId: Number(item.productId),
        sku: sku || `SKU-${item.productId}`,
        productName: productName || `Product ${item.productId}`,
        quantity,
        unitCost: cost,
        discount: discount2,
        taxRate: Number(item.taxRate) || 8.25,
        lineTotal,
        receivedQuantity: Number(item.receivedQuantity) || 0
      };
    })
  );
  const subtotal = data.subtotal ?? resolvedItems.reduce((acc, it) => acc + it.lineTotal, 0);
  const discount = Number(data.discount) || 0;
  const tax = Number(data.tax) || 0;
  const additionalCharges = Number(data.additionalCharges) || 0;
  const grandTotal = data.grandTotal ?? Math.max(0, subtotal - discount + tax + additionalCharges);
  const amountPaid = Number(data.amountPaid) || 0;
  const balanceDue = data.balanceDue ?? Math.max(0, grandTotal - amountPaid);
  const status = data.status || "DRAFT";
  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber,
      supplierId: data.supplierId,
      supplierName,
      warehouseId: data.warehouseId,
      warehouseName,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : /* @__PURE__ */ new Date(),
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      supplierInvoiceNumber: data.supplierInvoiceNumber || null,
      containerNumber: data.containerNumber || null,
      status,
      items: resolvedItems,
      subtotal,
      discount,
      tax,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      notes: data.notes || ""
    }
  });
  if (status === "RECEIVED") {
    for (const item of resolvedItems) {
      if (item.productId && item.quantity) {
        await prisma.product.updateMany({
          where: { id: Number(item.productId) },
          data: {
            stock: { increment: Number(item.quantity) }
          }
        });
      }
    }
  }
  return purchase;
};
var updatePurchase = async (id, data) => {
  const existing = await getPurchaseById(id);
  let supplierName = data.supplierName;
  if (data.supplierId && !supplierName) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    });
    supplierName = supplier?.companyName || existing.supplierName;
  }
  let warehouseName = data.warehouseName;
  if (data.warehouseId && !warehouseName) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId }
    });
    warehouseName = warehouse?.name || existing.warehouseName;
  }
  let resolvedItems = data.items;
  if (Array.isArray(data.items)) {
    resolvedItems = await Promise.all(
      data.items.map(async (item, index) => {
        let sku = item.sku;
        let productName = item.productName;
        let unitCost = item.unitCost;
        if (!sku || !productName || unitCost === void 0) {
          const prod = await prisma.product.findUnique({
            where: { id: Number(item.productId) }
          });
          if (prod) {
            sku = sku || prod.sku;
            productName = productName || prod.name;
            unitCost = unitCost !== void 0 ? unitCost : prod.costPrice;
          }
        }
        const cost = Number(unitCost) || 0;
        const discount2 = Number(item.discount) || 0;
        const quantity = Number(item.quantity) || 1;
        const lineTotal = item.lineTotal !== void 0 ? Number(item.lineTotal) : Math.max(0, quantity * cost - discount2);
        return {
          id: item.id || index + 1,
          productId: Number(item.productId),
          sku: sku || `SKU-${item.productId}`,
          productName: productName || `Product ${item.productId}`,
          quantity,
          unitCost: cost,
          discount: discount2,
          taxRate: Number(item.taxRate) || 8.25,
          lineTotal,
          receivedQuantity: Number(item.receivedQuantity) || 0
        };
      })
    );
  }
  const subtotal = data.subtotal ?? (resolvedItems ? resolvedItems.reduce((acc, it) => acc + it.lineTotal, 0) : existing.subtotal);
  const discount = data.discount !== void 0 ? Number(data.discount) : existing.discount;
  const tax = data.tax !== void 0 ? Number(data.tax) : existing.tax;
  const additionalCharges = data.additionalCharges !== void 0 ? Number(data.additionalCharges) : existing.additionalCharges;
  const grandTotal = data.grandTotal ?? Math.max(0, subtotal - discount + tax + additionalCharges);
  const amountPaid = data.amountPaid !== void 0 ? Number(data.amountPaid) : existing.amountPaid;
  const balanceDue = data.balanceDue ?? Math.max(0, grandTotal - amountPaid);
  const updated = await prisma.purchase.update({
    where: { id },
    data: {
      ...data,
      ...supplierName && { supplierName },
      ...warehouseName && { warehouseName },
      ...resolvedItems && { items: resolvedItems },
      subtotal,
      discount,
      tax,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      ...data.purchaseDate && {
        purchaseDate: new Date(data.purchaseDate)
      },
      ...data.expectedDate !== void 0 && {
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null
      }
    }
  });
  if (existing.status !== "RECEIVED" && data.status === "RECEIVED") {
    const items = updated.items || [];
    for (const item of items) {
      if (item.productId && item.quantity) {
        await prisma.product.updateMany({
          where: { id: Number(item.productId) },
          data: {
            stock: { increment: Number(item.quantity) }
          }
        });
      }
    }
  }
  return updated;
};
var deletePurchase = async (id) => {
  await getPurchaseById(id);
  await prisma.purchase.delete({
    where: { id }
  });
  return { id };
};

// src/controllers/purchase.controller.ts
var getPurchases = async (req, res, next) => {
  try {
    const {
      status,
      supplierId,
      warehouseId,
      search,
      timeRange,
      startDate,
      endDate
    } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllPurchases(
      {
        status: status ? String(status) : void 0,
        supplierId: supplierId ? Number(supplierId) : void 0,
        warehouseId: warehouseId ? Number(warehouseId) : void 0,
        search: search ? String(search) : void 0,
        timeRange: timeRange ? String(timeRange) : void 0,
        startDate: startDate ? String(startDate) : void 0,
        endDate: endDate ? String(endDate) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Purchase orders fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.purchases
    });
  } catch (error) {
    next(error);
  }
};
var getPurchase = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const purchase = await getPurchaseById(id);
    res.status(200).json({
      success: true,
      message: "Purchase order fetched successfully",
      data: purchase
    });
  } catch (error) {
    next(error);
  }
};
var addPurchase = async (req, res, next) => {
  try {
    const validatedData = createPurchaseSchema.parse(req.body);
    const purchase = await createPurchase(validatedData);
    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: purchase
    });
  } catch (error) {
    next(error);
  }
};
var editPurchase = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updatePurchaseSchema.parse(req.body);
    const purchase = await updatePurchase(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: purchase
    });
  } catch (error) {
    next(error);
  }
};
var removePurchase = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await deletePurchase(id);
    res.status(200).json({
      success: true,
      message: "Purchase order deleted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/purchase.routes.ts
var router8 = Router8();
router8.get("/", getPurchases);
router8.get("/:id", getPurchase);
router8.post("/", authenticate, addPurchase);
router8.put("/:id", authenticate, editPurchase);
router8.delete("/:id", authenticate, removePurchase);
var purchase_routes_default = router8;

// src/routes/invoice.routes.ts
import { Router as Router9 } from "express";

// src/validations/invoice.validation.ts
import { z as z9 } from "zod";
var invoiceLineItemSchema = z9.object({
  id: z9.union([z9.number(), z9.string()]).optional(),
  productId: z9.number().int().positive("Valid product ID required"),
  sku: z9.string().optional(),
  productName: z9.string().optional(),
  quantity: z9.number().min(1, "Quantity must be at least 1"),
  unitPrice: z9.number().min(0, "Unit price cannot be negative").optional(),
  discount: z9.number().min(0).default(0).optional(),
  taxRate: z9.number().min(0).default(8.25).optional(),
  lineTotal: z9.number().min(0).optional()
});
var createInvoiceSchema = z9.object({
  invoiceNumber: z9.string().optional(),
  // Auto-generated by backend e.g. INV-2026-003
  invoiceDate: z9.string().optional(),
  dueDate: z9.string().optional(),
  salesChannelId: z9.number().optional(),
  salesChannel: z9.string().optional(),
  salesChannelName: z9.string().optional(),
  externalOrderId: z9.string().optional(),
  // Online platform Order ID / Ref #
  quotationId: z9.number().optional(),
  customerId: z9.number().optional(),
  buyerName: z9.string().min(2, "Customer / Buyer name is required").trim(),
  buyerEmail: z9.string().email("Invalid buyer email").optional().or(z9.literal("")),
  buyerPhone: z9.string().optional(),
  billingAddress: z9.string().optional(),
  shippingAddress: z9.string().optional(),
  warehouseId: z9.number().int().positive().optional().nullable(),
  warehouseName: z9.string().optional(),
  items: z9.array(invoiceLineItemSchema).min(1, "At least one product line item is required"),
  subtotal: z9.number().min(0).optional(),
  discountTotal: z9.number().min(0).default(0).optional(),
  taxTotal: z9.number().min(0).default(0).optional(),
  shippingCharges: z9.number().min(0).default(0).optional(),
  additionalCharges: z9.number().min(0).default(0).optional(),
  grandTotal: z9.number().min(0).optional(),
  amountPaid: z9.number().min(0).default(0).optional(),
  balanceDue: z9.number().min(0).optional(),
  paymentStatus: z9.enum(["PAID", "PARTIALLY_PAID", "PENDING", "OVERDUE"]).default("PENDING").optional(),
  paymentMethod: z9.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "UPI", "CHECK"]).optional(),
  status: z9.enum(["DRAFT", "ISSUED", "CANCELLED"]).default("ISSUED").optional(),
  notes: z9.string().optional(),
  termsAndConditions: z9.string().optional()
});
var updateInvoiceSchema = createInvoiceSchema.partial();

// src/services/invoice.service.ts
var initialInvoices = [
  {
    invoiceNumber: "INV-2026-001",
    invoiceDate: /* @__PURE__ */ new Date("2026-10-14T11:00:00Z"),
    dueDate: /* @__PURE__ */ new Date("2026-11-14T11:00:00Z"),
    salesChannel: "Website",
    externalOrderId: "ORD-99120",
    buyerName: "Eleanor Vance",
    buyerEmail: "eleanor.vance@example.com",
    buyerPhone: "+1 (555) 234-5678",
    billingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    items: [
      {
        id: 1,
        productId: 1,
        sku: "BED-001",
        productName: "Cotton Bedsheet Set - Queen",
        quantity: 2,
        unitPrice: 180,
        discount: 20,
        taxRate: 8.25,
        lineTotal: 340
      },
      {
        id: 2,
        productId: 3,
        sku: "TBL-001",
        productName: "Oak Side Table",
        quantity: 1,
        unitPrice: 280,
        discount: 0,
        taxRate: 8.25,
        lineTotal: 280
      }
    ],
    subtotal: 620,
    discountTotal: 20,
    taxTotal: 49.5,
    shippingCharges: 25,
    additionalCharges: 0,
    grandTotal: 674.5,
    amountPaid: 674.5,
    balanceDue: 0,
    paymentStatus: "PAID",
    paymentMethod: "CREDIT_CARD",
    status: "ISSUED",
    notes: "Front porch delivery requested with signature requirement.",
    termsAndConditions: "Standard 30-day return policy. Retain receipt for warranty claims."
  },
  {
    invoiceNumber: "INV-2026-002",
    invoiceDate: /* @__PURE__ */ new Date("2026-10-28T14:30:00Z"),
    dueDate: /* @__PURE__ */ new Date("2026-11-28T14:30:00Z"),
    salesChannel: "B2B Wholesale",
    externalOrderId: "PO-CLIENT-411",
    buyerName: "Theodore Finch",
    buyerEmail: "theodore@finch-interiors.com",
    buyerPhone: "+1 (555) 876-5432",
    billingAddress: "450 Lexington Ave, Suite 1200, New York, NY 10017",
    shippingAddress: "450 Lexington Ave, Suite 1200, New York, NY 10017",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    items: [
      {
        id: 3,
        productId: 5,
        sku: "TBL-002",
        productName: "Walnut Console Table",
        quantity: 2,
        unitPrice: 650,
        discount: 50,
        taxRate: 8.25,
        lineTotal: 1250
      }
    ],
    subtotal: 1250,
    discountTotal: 50,
    taxTotal: 99,
    shippingCharges: 85,
    additionalCharges: 0,
    grandTotal: 1384,
    amountPaid: 500,
    balanceDue: 884,
    paymentStatus: "PARTIALLY_PAID",
    paymentMethod: "BANK_TRANSFER",
    status: "ISSUED",
    notes: "Commercial delivery between 9 AM and 4 PM with freight elevator access.",
    termsAndConditions: "Net 30 terms. Late fees of 1.5% apply after 30 days."
  }
];
var seedInitialInvoices = async () => {
  const count = await prisma.invoice.count();
  if (count === 0) {
    for (const inv of initialInvoices) {
      await prisma.invoice.create({
        data: inv
      });
    }
  }
};
var generateNextInvoiceNumber = async () => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const prefix = `INV-${currentYear}-`;
  const latest = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      id: "desc"
    }
  });
  if (!latest) {
    return `${prefix}001`;
  }
  const parts = latest.invoiceNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
};
var getAllInvoices = async (filters, pagination) => {
  await seedInitialInvoices();
  const whereClause = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
    whereClause.paymentStatus = filters.paymentStatus;
  }
  if (filters?.salesChannel && filters.salesChannel !== "ALL") {
    whereClause.salesChannel = filters.salesChannel;
  }
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.invoiceDate = dateFilter;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { invoiceNumber: { contains: term, mode: "insensitive" } },
      { buyerName: { contains: term, mode: "insensitive" } },
      { externalOrderId: { contains: term, mode: "insensitive" } },
      { buyerEmail: { contains: term, mode: "insensitive" } }
    ];
  }
  const totalItems = await prisma.invoice.count({
    where: whereClause
  });
  const allFilteredInvoices = await prisma.invoice.findMany({
    where: whereClause,
    select: {
      grandTotal: true,
      amountPaid: true,
      balanceDue: true,
      paymentStatus: true
    }
  });
  const totalCount = allFilteredInvoices.length;
  const totalValue = allFilteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const paidInvoices = allFilteredInvoices.filter((inv) => inv.paymentStatus === "PAID");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const pendingInvoices = allFilteredInvoices.filter(
    (inv) => inv.paymentStatus === "PENDING" || inv.paymentStatus === "PARTIALLY_PAID"
  );
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueInvoices = allFilteredInvoices.filter((inv) => inv.paymentStatus === "OVERDUE");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const kpi = {
    totalCount,
    totalInvoices: totalCount,
    totalValue: Math.round(totalValue * 100) / 100,
    totalRevenue: Math.round(totalValue * 100) / 100,
    paidCount: paidInvoices.length,
    totalPaid: Math.round(totalPaid * 100) / 100,
    paidAmount: Math.round(totalPaid * 100) / 100,
    pendingCount: pendingInvoices.length,
    totalPending: Math.round(totalPending * 100) / 100,
    pendingAmount: Math.round(totalPending * 100) / 100,
    overdueCount: overdueInvoices.length,
    totalOverdue: Math.round(totalOverdue * 100) / 100,
    overdueAmount: Math.round(totalOverdue * 100) / 100
  };
  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc"
    },
    ...pagination && {
      skip: pagination.skip,
      take: pagination.limit
    }
  });
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    invoices,
    pagination: paginationMeta,
    kpi
  };
};
var getInvoiceById = async (id) => {
  await seedInitialInvoices();
  const invoice = await prisma.invoice.findUnique({
    where: { id }
  });
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.statusCode = 404;
    throw error;
  }
  return invoice;
};
var createInvoice = async (data) => {
  const invoiceNumber = data.invoiceNumber || await generateNextInvoiceNumber();
  let warehouseName = data.warehouseName;
  if (data.warehouseId && !warehouseName) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId }
    });
    warehouseName = wh?.name || "Main Warehouse";
  }
  const resolvedItems = await Promise.all(
    data.items.map(async (item, index) => {
      let sku = item.sku;
      let productName = item.productName;
      let unitPrice = item.unitPrice;
      if (!sku || !productName || unitPrice === void 0) {
        const prod = await prisma.product.findUnique({
          where: { id: Number(item.productId) }
        });
        if (prod) {
          sku = sku || prod.sku;
          productName = productName || prod.name;
          unitPrice = unitPrice !== void 0 ? unitPrice : prod.sellingPrice;
        }
      }
      const price = Number(unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const quantity = Number(item.quantity) || 1;
      const lineTotal = item.lineTotal !== void 0 ? Number(item.lineTotal) : Math.max(0, quantity * price - discount);
      return {
        id: item.id || index + 1,
        productId: Number(item.productId),
        sku: sku || `SKU-${item.productId}`,
        productName: productName || `Product ${item.productId}`,
        quantity,
        unitPrice: price,
        discount,
        taxRate: Number(item.taxRate) || 8.25,
        lineTotal
      };
    })
  );
  const calculatedSubtotal = resolvedItems.reduce((acc, it) => acc + it.lineTotal, 0);
  const subtotal = data.subtotal ?? calculatedSubtotal;
  const discountTotal = data.discountTotal ?? 0;
  const taxTotal = data.taxTotal ?? 0;
  const shippingCharges = data.shippingCharges ?? 0;
  const additionalCharges = data.additionalCharges ?? 0;
  const grandTotal = data.grandTotal ?? Math.max(
    0,
    subtotal - discountTotal + taxTotal + shippingCharges + additionalCharges
  );
  const amountPaid = data.amountPaid ?? 0;
  const balanceDue = data.balanceDue ?? Math.max(0, grandTotal - amountPaid);
  let paymentStatus = data.paymentStatus;
  if (!paymentStatus) {
    if (amountPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = "PAID";
    } else if (amountPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    } else {
      paymentStatus = "PENDING";
    }
  }
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : /* @__PURE__ */ new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : void 0,
      salesChannel: data.salesChannel || data.salesChannelName || "Website",
      externalOrderId: data.externalOrderId || null,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail || null,
      buyerPhone: data.buyerPhone || null,
      billingAddress: data.billingAddress || null,
      shippingAddress: data.shippingAddress || null,
      warehouseId: data.warehouseId || null,
      warehouseName: warehouseName || null,
      items: resolvedItems,
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharges,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentStatus,
      paymentMethod: data.paymentMethod || null,
      status: data.status || "ISSUED",
      notes: data.notes || null,
      termsAndConditions: data.termsAndConditions || null
    }
  });
  if (invoice.status === "ISSUED") {
    for (const item of resolvedItems) {
      if (item.productId && item.quantity > 0) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        } catch {
        }
      }
    }
  }
  return invoice;
};
var updateInvoice = async (id, data) => {
  const existing = await getInvoiceById(id);
  let warehouseName = data.warehouseName;
  if (data.warehouseId && !warehouseName) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId }
    });
    warehouseName = wh?.name || existing.warehouseName || void 0;
  }
  let resolvedItems = data.items;
  if (Array.isArray(data.items)) {
    resolvedItems = await Promise.all(
      data.items.map(async (item, index) => {
        let sku = item.sku;
        let productName = item.productName;
        let unitPrice = item.unitPrice;
        if (!sku || !productName || unitPrice === void 0) {
          const prod = await prisma.product.findUnique({
            where: { id: Number(item.productId) }
          });
          if (prod) {
            sku = sku || prod.sku;
            productName = productName || prod.name;
            unitPrice = unitPrice !== void 0 ? unitPrice : prod.sellingPrice;
          }
        }
        const price = Number(unitPrice) || 0;
        const discount = Number(item.discount) || 0;
        const quantity = Number(item.quantity) || 1;
        const lineTotal = item.lineTotal !== void 0 ? Number(item.lineTotal) : Math.max(0, quantity * price - discount);
        return {
          id: item.id || index + 1,
          productId: Number(item.productId),
          sku: sku || `SKU-${item.productId}`,
          productName: productName || `Product ${item.productId}`,
          quantity,
          unitPrice: price,
          discount,
          taxRate: Number(item.taxRate) || 8.25,
          lineTotal
        };
      })
    );
  }
  const subtotal = data.subtotal ?? (resolvedItems ? resolvedItems.reduce((acc, it) => acc + it.lineTotal, 0) : existing.subtotal);
  const discountTotal = data.discountTotal !== void 0 ? data.discountTotal : existing.discountTotal;
  const taxTotal = data.taxTotal !== void 0 ? data.taxTotal : existing.taxTotal;
  const shippingCharges = data.shippingCharges !== void 0 ? data.shippingCharges : existing.shippingCharges;
  const additionalCharges = data.additionalCharges !== void 0 ? data.additionalCharges : existing.additionalCharges;
  const grandTotal = data.grandTotal ?? Math.max(
    0,
    subtotal - discountTotal + taxTotal + shippingCharges + additionalCharges
  );
  const amountPaid = data.amountPaid !== void 0 ? data.amountPaid : existing.amountPaid;
  const balanceDue = data.balanceDue ?? Math.max(0, grandTotal - amountPaid);
  let paymentStatus = data.paymentStatus ?? existing.paymentStatus;
  if (!data.paymentStatus && data.amountPaid !== void 0) {
    if (amountPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = "PAID";
    } else if (amountPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    } else {
      paymentStatus = "PENDING";
    }
  }
  if (existing.status === "ISSUED" && data.status === "CANCELLED") {
    const items = existing.items;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            });
          } catch {
          }
        }
      }
    }
  }
  if (existing.status === "DRAFT" && data.status === "ISSUED") {
    const items = resolvedItems || existing.items;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            });
          } catch {
          }
        }
      }
    }
  }
  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...data.invoiceNumber && { invoiceNumber: data.invoiceNumber },
      ...data.invoiceDate && { invoiceDate: new Date(data.invoiceDate) },
      ...data.dueDate !== void 0 && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      ...data.salesChannel && { salesChannel: data.salesChannel },
      ...data.externalOrderId !== void 0 && {
        externalOrderId: data.externalOrderId || null
      },
      ...data.buyerName && { buyerName: data.buyerName },
      ...data.buyerEmail !== void 0 && {
        buyerEmail: data.buyerEmail || null
      },
      ...data.buyerPhone !== void 0 && {
        buyerPhone: data.buyerPhone || null
      },
      ...data.billingAddress !== void 0 && {
        billingAddress: data.billingAddress || null
      },
      ...data.shippingAddress !== void 0 && {
        shippingAddress: data.shippingAddress || null
      },
      ...data.warehouseId !== void 0 && {
        warehouseId: data.warehouseId
      },
      ...warehouseName && {
        warehouseName
      },
      ...resolvedItems && { items: resolvedItems },
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharges,
      additionalCharges,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentStatus,
      ...data.paymentMethod !== void 0 && {
        paymentMethod: data.paymentMethod
      },
      ...data.status && { status: data.status },
      ...data.notes !== void 0 && { notes: data.notes },
      ...data.termsAndConditions !== void 0 && {
        termsAndConditions: data.termsAndConditions
      }
    }
  });
  return updated;
};
var deleteInvoice = async (id) => {
  await getInvoiceById(id);
  await prisma.invoice.delete({
    where: { id }
  });
  return { message: "Invoice deleted successfully" };
};

// src/controllers/invoice.controller.ts
var getInvoices = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      salesChannel,
      search,
      timeRange,
      startDate,
      endDate
    } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllInvoices(
      {
        status: status ? String(status) : void 0,
        paymentStatus: paymentStatus ? String(paymentStatus) : void 0,
        salesChannel: salesChannel ? String(salesChannel) : void 0,
        search: search ? String(search) : void 0,
        timeRange: timeRange ? String(timeRange) : void 0,
        startDate: startDate ? String(startDate) : void 0,
        endDate: endDate ? String(endDate) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.invoices
    });
  } catch (error) {
    next(error);
  }
};
var getInvoice = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID"
      });
    }
    const invoice = await getInvoiceById(id);
    res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};
var addInvoice = async (req, res, next) => {
  try {
    const validation = createInvoiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }
    const invoice = await createInvoice(validation.data);
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};
var editInvoice = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID"
      });
    }
    const validation = updateInvoiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }
    const invoice = await updateInvoice(id, validation.data);
    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};
var removeInvoice = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID"
      });
    }
    const result = await deleteInvoice(id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/invoice.routes.ts
var router9 = Router9();
router9.get("/", getInvoices);
router9.get("/:id", getInvoice);
router9.post("/", authenticate, addInvoice);
router9.put("/:id", authenticate, editInvoice);
router9.delete("/:id", authenticate, removeInvoice);
var invoice_routes_default = router9;

// src/routes/role.routes.ts
import { Router as Router10 } from "express";

// src/validations/role.validation.ts
import { z as z10 } from "zod";
var moduleCrudSchema = z10.object({
  canView: z10.boolean().default(false),
  canCreate: z10.boolean().default(false),
  canEdit: z10.boolean().default(false),
  canDelete: z10.boolean().default(false)
});
var createRoleSchema = z10.object({
  name: z10.string().min(2, "Role name must be at least 2 characters").trim(),
  code: z10.string().min(2, "Role code must be at least 2 characters").trim().toUpperCase().optional(),
  description: z10.string().optional(),
  status: z10.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  modules: z10.array(z10.string()).default([]),
  permissions: z10.record(z10.string(), moduleCrudSchema).default({})
});
var updateRoleSchema = createRoleSchema.partial();

// src/services/role.service.ts
var initialRoles = [
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
      "role_management"
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
      role_management: { canView: true, canCreate: true, canEdit: true, canDelete: true }
    }
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
      catalogue: { canView: true, canCreate: false, canEdit: false, canDelete: false }
    }
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
      catalogue: { canView: true, canCreate: false, canEdit: false, canDelete: false }
    }
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
      catalogue: { canView: true, canCreate: false, canEdit: false, canDelete: false }
    }
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
      masters: { canView: true, canCreate: true, canEdit: true, canDelete: false }
    }
  }
];
var seedInitialRoles = async () => {
  const count = await prisma.role.count();
  if (count === 0) {
    for (const r of initialRoles) {
      await prisma.role.create({
        data: r
      });
    }
  }
};
var getAllRoles = async (filters, pagination) => {
  await seedInitialRoles();
  const whereClause = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { code: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } }
    ];
  }
  const allFiltered = await prisma.role.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "asc"
    }
  });
  const totalRoles = allFiltered.length;
  const activeRoles = allFiltered.filter((r) => r.status === "ACTIVE").length;
  const inactiveRoles = allFiltered.filter((r) => r.status === "INACTIVE").length;
  const systemRoles = allFiltered.filter((r) => r.isSystem).length;
  const enriched = await Promise.all(
    allFiltered.map(async (role) => {
      const userCount = await prisma.user.count({
        where: { roleId: role.id }
      });
      return {
        ...role,
        userCount
      };
    })
  );
  const totalAssignedUsers = enriched.reduce((sum, r) => sum + r.userCount, 0);
  const kpi = {
    totalRoles,
    activeRoles,
    inactiveRoles,
    systemRoles,
    totalAssignedUsers
  };
  const totalItems = enriched.length;
  let pagedRoles = enriched;
  if (pagination && pagination.isPaginated) {
    pagedRoles = enriched.slice(
      pagination.skip,
      pagination.skip + pagination.limit
    );
  }
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    roles: pagedRoles,
    pagination: paginationMeta,
    kpi
  };
};
var getRoleById = async (id) => {
  await seedInitialRoles();
  const role = await prisma.role.findUnique({
    where: { id }
  });
  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }
  const userCount = await prisma.user.count({
    where: { roleId: role.id }
  });
  return {
    ...role,
    userCount
  };
};
var createRole = async (data) => {
  const code = data.code || data.name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, "_");
  const existing = await prisma.role.findFirst({
    where: {
      OR: [{ name: data.name.trim() }, { code }]
    }
  });
  if (existing) {
    const error = new Error(`Role with name '${data.name}' or code '${code}' already exists`);
    error.statusCode = 409;
    throw error;
  }
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
      isSystem: false
    }
  });
  return {
    ...role,
    userCount: 0
  };
};
var updateRole = async (id, data) => {
  const existing = await prisma.role.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }
  if (data.name && data.name.trim() !== existing.name) {
    const duplicate = await prisma.role.findFirst({
      where: {
        name: data.name.trim(),
        NOT: { id }
      }
    });
    if (duplicate) {
      const error = new Error(`Role name '${data.name}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }
  const updated = await prisma.role.update({
    where: { id },
    data: {
      ...data.name && { name: data.name.trim() },
      ...data.code && !existing.isSystem && { code: data.code.trim().toUpperCase() },
      ...data.description !== void 0 && { description: data.description },
      ...data.status && { status: data.status },
      ...data.modules && { modules: data.modules },
      ...data.permissions && { permissions: data.permissions }
    }
  });
  const userCount = await prisma.user.count({
    where: { roleId: updated.id }
  });
  return {
    ...updated,
    userCount
  };
};
var deleteRole = async (id) => {
  const existing = await prisma.role.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }
  if (existing.isSystem) {
    const error = new Error("Built-in system roles cannot be deleted");
    error.statusCode = 403;
    throw error;
  }
  const assignedUsersCount = await prisma.user.count({
    where: { roleId: id }
  });
  if (assignedUsersCount > 0) {
    const error = new Error(
      `Cannot delete role because it is currently assigned to ${assignedUsersCount} active user(s). Reassign them first.`
    );
    error.statusCode = 400;
    throw error;
  }
  await prisma.role.delete({
    where: { id }
  });
  return { id, message: "Role deleted successfully" };
};

// src/controllers/role.controller.ts
var getRoles = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllRoles(
      {
        status: status ? String(status) : void 0,
        search: search ? String(search) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.roles
    });
  } catch (error) {
    next(error);
  }
};
var getRole = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const role = await getRoleById(id);
    res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: role
    });
  } catch (error) {
    next(error);
  }
};
var addRole = async (req, res, next) => {
  try {
    const validatedData = createRoleSchema.parse(req.body);
    const role = await createRole(validatedData);
    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role
    });
  } catch (error) {
    next(error);
  }
};
var editRole = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const validatedData = updateRoleSchema.parse(req.body);
    const role = await updateRole(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role
    });
  } catch (error) {
    next(error);
  }
};
var removeRole = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const result = await deleteRole(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/role.routes.ts
var router10 = Router10();
router10.get("/", authenticate, getRoles);
router10.get("/:id", authenticate, getRole);
router10.post("/", authenticate, requireAdmin, addRole);
router10.put("/:id", authenticate, requireAdmin, editRole);
router10.delete("/:id", authenticate, requireAdmin, removeRole);
var role_routes_default = router10;

// src/routes/user.routes.ts
import { Router as Router11 } from "express";

// src/validations/user.validation.ts
import { z as z11 } from "zod";
var createUserSchema = z11.object({
  name: z11.string().min(2, "Full name must be at least 2 characters").trim(),
  email: z11.string().email("Invalid email address").trim().toLowerCase(),
  mobile: z11.string().optional(),
  password: z11.string().min(6, "Password must be at least 6 characters"),
  roleId: z11.string().optional().default("role-admin"),
  role: z11.string().optional(),
  // Auto-resolved from roleId if omitted
  status: z11.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  avatarBg: z11.string().optional(),
  requirePasswordChange: z11.boolean().default(false)
});
var updateUserSchema = z11.object({
  name: z11.string().min(2, "Full name must be at least 2 characters").trim().optional(),
  email: z11.string().email("Invalid email address").trim().toLowerCase().optional(),
  mobile: z11.string().optional(),
  roleId: z11.string().optional(),
  role: z11.string().optional(),
  status: z11.enum(["ACTIVE", "INACTIVE"]).optional(),
  avatarBg: z11.string().optional(),
  requirePasswordChange: z11.boolean().optional()
});
var resetUserPasswordSchema = z11.object({
  newPassword: z11.string().min(6, "New password must be at least 6 characters"),
  requireChangeOnLogin: z11.boolean().default(true).optional()
});

// src/services/user.service.ts
var computeInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0] ? parts[0].slice(0, 2) : "US").toUpperCase();
};
var initialUsersSeed = [
  {
    name: "Aarav Rathi",
    mobile: "+1 (704) 555-0112",
    email: "aarav@sundarafurnishings.com",
    role: "ADMIN",
    roleTitle: "Administrator",
    roleId: "role-admin",
    status: "ACTIVE",
    initials: "AR",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123"
  },
  {
    name: "Maya Whitfield",
    mobile: "+1 (704) 555-0145",
    email: "maya@sundarafurnishings.com",
    role: "EMPLOYEE",
    roleTitle: "Sales Manager",
    roleId: "role-sales-mgr",
    status: "ACTIVE",
    initials: "MW",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123"
  },
  {
    name: "Daniel Ochoa",
    mobile: "+1 (704) 555-0178",
    email: "daniel@sundarafurnishings.com",
    role: "EMPLOYEE",
    roleTitle: "Purchase Executive",
    roleId: "role-purchase-exec",
    status: "ACTIVE",
    initials: "DO",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123"
  },
  {
    name: "Hannah Brooks",
    mobile: "+1 (704) 555-0198",
    email: "hannah@sundarafurnishings.com",
    role: "EMPLOYEE",
    roleTitle: "Store Keeper",
    roleId: "role-store-keeper",
    status: "ACTIVE",
    initials: "HB",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123"
  },
  {
    name: "Marcus Chen",
    mobile: "+1 (704) 555-0133",
    email: "marcus@sundarafurnishings.com",
    role: "EMPLOYEE",
    roleTitle: "Accountant",
    roleId: "role-accountant",
    status: "INACTIVE",
    initials: "MC",
    avatarBg: "bg-emerald-700 text-white",
    password: "Password@123"
  }
];
var seedInitialUsers = async () => {
  const count = await prisma.user.count();
  if (count <= 1) {
    for (const u of initialUsersSeed) {
      const exists = await prisma.user.findUnique({
        where: { email: u.email }
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
            isActive: u.status === "ACTIVE"
          }
        });
      }
    }
  }
};
var getAllUsers = async (filters, pagination) => {
  await seedInitialUsers();
  const whereClause = {};
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
      { roleTitle: { contains: term, mode: "insensitive" } }
    ];
  }
  const totalItems = await prisma.user.count({
    where: whereClause
  });
  const allUsersForKpi = await prisma.user.findMany({
    select: { status: true, roleId: true }
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
    rolesInUseCount
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
      updatedAt: true
    },
    orderBy: {
      id: "asc"
    },
    ...pagination && {
      skip: pagination.skip,
      take: pagination.limit
    }
  });
  const formattedUsers = users.map((u) => ({
    ...u,
    role: u.roleTitle
    // Return human-readable role name for frontend
  }));
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    users: formattedUsers,
    pagination: paginationMeta,
    kpi
  };
};
var getUserById = async (id) => {
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
      updatedAt: true
    }
  });
  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    ...user,
    role: user.roleTitle
  };
};
var createUser = async (data) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });
  if (existing) {
    const error = new Error(`Email '${data.email}' is already registered`);
    error.statusCode = 409;
    throw error;
  }
  let roleTitle = data.role;
  const roleId = data.roleId || "role-admin";
  if (!roleTitle) {
    const roleRecord = await prisma.role.findUnique({
      where: { id: roleId }
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
      isActive: status === "ACTIVE"
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
      updatedAt: true
    }
  });
  return {
    ...user,
    role: user.roleTitle
  };
};
var updateUser = async (id, data) => {
  const existing = await prisma.user.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (emailTaken) {
      const error = new Error(`Email '${data.email}' is already registered`);
      error.statusCode = 409;
      throw error;
    }
  }
  let roleTitle = data.role;
  const roleId = data.roleId || existing.roleId;
  if (!roleTitle && data.roleId && data.roleId !== existing.roleId) {
    const roleRecord = await prisma.role.findUnique({
      where: { id: data.roleId }
    });
    roleTitle = roleRecord?.name || existing.roleTitle;
  }
  const status = data.status || existing.status;
  const initials = data.name ? computeInitials(data.name) : existing.initials;
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...data.name && { name: data.name.trim() },
      ...data.email && { email: data.email.trim().toLowerCase() },
      ...data.mobile !== void 0 && { mobile: data.mobile },
      ...roleId && { roleId },
      ...roleTitle && { roleTitle },
      ...roleId && {
        role: roleId === "role-admin" ? "ADMIN" : "EMPLOYEE"
      },
      ...data.status && {
        status,
        isActive: status === "ACTIVE"
      },
      ...initials && { initials },
      ...data.avatarBg && { avatarBg: data.avatarBg },
      ...data.requirePasswordChange !== void 0 && {
        requirePasswordChange: data.requirePasswordChange
      }
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
      updatedAt: true
    }
  });
  return {
    ...updated,
    role: updated.roleTitle
  };
};
var resetUserPassword = async (id, newPassword, requireChangeOnLogin = true) => {
  const existing = await prisma.user.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      requirePasswordChange: requireChangeOnLogin
    }
  });
  return { message: "User password reset successfully" };
};
var deleteUser = async (id) => {
  const existing = await prisma.user.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }
  await prisma.user.delete({
    where: { id }
  });
  return { id, message: "User account deleted successfully" };
};

// src/controllers/user.controller.ts
var getUsers = async (req, res, next) => {
  try {
    const { roleId, status, search } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllUsers(
      {
        roleId: roleId ? String(roleId) : void 0,
        status: status ? String(status) : void 0,
        search: search ? String(search) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.users
    });
  } catch (error) {
    next(error);
  }
};
var getUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const user = await getUserById(id);
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
var addUser = async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await createUser(validatedData);
    res.status(201).json({
      success: true,
      message: "User account created successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
var editUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const validatedData = updateUserSchema.parse(req.body);
    const user = await updateUser(id, validatedData);
    res.status(200).json({
      success: true,
      message: "User account updated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
var resetPassword = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const validatedData = resetUserPasswordSchema.parse(req.body);
    const result = await resetUserPassword(
      id,
      validatedData.newPassword,
      validatedData.requireChangeOnLogin
    );
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};
var removeUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const result = await deleteUser(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/user.routes.ts
var router11 = Router11();
router11.get("/", authenticate, getUsers);
router11.get("/:id", authenticate, getUser);
router11.post("/", authenticate, requireAdmin, addUser);
router11.put("/:id", authenticate, requireAdmin, editUser);
router11.post("/:id/reset-password", authenticate, requireAdmin, resetPassword);
router11.delete("/:id", authenticate, requireAdmin, removeUser);
var user_routes_default = router11;

// src/routes/salesChannel.routes.ts
import { Router as Router12 } from "express";

// src/validations/salesChannel.validation.ts
import { z as z12 } from "zod";
var createSalesChannelSchema = z12.object({
  name: z12.string().min(2, "Channel name must be at least 2 characters").trim(),
  code: z12.string().min(2, "Channel code must be at least 2 characters").trim().toUpperCase().optional(),
  type: z12.enum(["MARKETPLACE", "OWN_WEBSITE", "RETAIL"]).default("MARKETPLACE"),
  website: z12.string().optional().or(z12.literal("")),
  description: z12.string().optional().or(z12.literal("")),
  status: z12.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
});
var updateSalesChannelSchema = createSalesChannelSchema.partial();

// src/services/salesChannel.service.ts
var initialChannels = [
  {
    name: "Website",
    code: "WEB",
    type: "OWN_WEBSITE",
    website: "https://sundarafurnishings.com",
    description: "Official Sundara Furnishings online store.",
    status: "ACTIVE"
  },
  {
    name: "Amazon",
    code: "AMZ",
    type: "MARKETPLACE",
    website: "https://www.amazon.com",
    description: "Product listings and sales through Amazon marketplace.",
    status: "ACTIVE"
  },
  {
    name: "Wayfair",
    code: "WAY",
    type: "MARKETPLACE",
    website: "https://www.wayfair.com",
    description: "Furniture and home decor retail marketplace.",
    status: "ACTIVE"
  },
  {
    name: "Direct Shop / Retail Showroom",
    code: "POS",
    type: "RETAIL",
    website: "",
    description: "Direct walk-in customer purchases through physical showroom.",
    status: "ACTIVE"
  }
];
var seedInitialSalesChannels = async () => {
  const count = await prisma.salesChannel.count();
  if (count === 0) {
    for (const c of initialChannels) {
      await prisma.salesChannel.create({
        data: c
      });
    }
  }
};
var getAllSalesChannels = async (filters, pagination) => {
  await seedInitialSalesChannels();
  const whereClause = {};
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
      { description: { contains: term, mode: "insensitive" } }
    ];
  }
  const allFiltered = await prisma.salesChannel.findMany({
    where: whereClause,
    orderBy: {
      id: "asc"
    }
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
    retailCount
  };
  const allProducts = await prisma.product.findMany({
    select: { id: true, salesChannels: true }
  });
  const enriched = allFiltered.map((channel) => {
    let productCount = 0;
    for (const prod of allProducts) {
      const pChannels = prod.salesChannels;
      if (Array.isArray(pChannels)) {
        if (pChannels.includes(channel.name) || pChannels.includes(channel.id) || pChannels.includes(channel.code)) {
          productCount++;
        }
      }
    }
    return {
      ...channel,
      productCount: productCount || 5
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
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    channels: pagedChannels,
    pagination: paginationMeta,
    kpi
  };
};
var getSalesChannelById = async (id) => {
  await seedInitialSalesChannels();
  const channel = await prisma.salesChannel.findUnique({
    where: { id }
  });
  if (!channel) {
    const error = new Error("Sales channel not found");
    error.statusCode = 404;
    throw error;
  }
  const allProducts = await prisma.product.findMany({
    select: { id: true, salesChannels: true }
  });
  let productCount = 0;
  for (const prod of allProducts) {
    const pChannels = prod.salesChannels;
    if (Array.isArray(pChannels)) {
      if (pChannels.includes(channel.name) || pChannels.includes(channel.id) || pChannels.includes(channel.code)) {
        productCount++;
      }
    }
  }
  return {
    ...channel,
    productCount: productCount || 5
  };
};
var createSalesChannel = async (data) => {
  const code = data.code || data.name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, "").slice(0, 6);
  const existing = await prisma.salesChannel.findFirst({
    where: {
      OR: [{ name: data.name.trim() }, { code }]
    }
  });
  if (existing) {
    const error = new Error(
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
      status: data.status || "ACTIVE"
    }
  });
  return {
    ...created,
    productCount: 0
  };
};
var updateSalesChannel = async (id, data) => {
  const existing = await prisma.salesChannel.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("Sales channel not found");
    error.statusCode = 404;
    throw error;
  }
  if (data.name && data.name.trim() !== existing.name) {
    const duplicate = await prisma.salesChannel.findFirst({
      where: {
        name: data.name.trim(),
        NOT: { id }
      }
    });
    if (duplicate) {
      const error = new Error(`Sales channel name '${data.name}' is already in use`);
      error.statusCode = 409;
      throw error;
    }
  }
  const updated = await prisma.salesChannel.update({
    where: { id },
    data: {
      ...data.name && { name: data.name.trim() },
      ...data.code && { code: data.code.trim().toUpperCase() },
      ...data.type && { type: data.type },
      ...data.website !== void 0 && { website: data.website || null },
      ...data.description !== void 0 && { description: data.description || null },
      ...data.status && { status: data.status }
    }
  });
  return {
    ...updated,
    productCount: 0
  };
};
var deleteSalesChannel = async (id) => {
  const existing = await prisma.salesChannel.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error("Sales channel not found");
    error.statusCode = 404;
    throw error;
  }
  await prisma.salesChannel.delete({
    where: { id }
  });
  return { id, message: "Sales channel deleted successfully" };
};

// src/controllers/salesChannel.controller.ts
var getSalesChannels = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllSalesChannels(
      {
        status: status ? String(status) : void 0,
        type: type ? String(type) : void 0,
        search: search ? String(search) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Sales channels fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.channels
    });
  } catch (error) {
    next(error);
  }
};
var getSalesChannel = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales channel ID"
      });
    }
    const channel = await getSalesChannelById(id);
    res.status(200).json({
      success: true,
      message: "Sales channel fetched successfully",
      data: channel
    });
  } catch (error) {
    next(error);
  }
};
var addSalesChannel = async (req, res, next) => {
  try {
    const validatedData = createSalesChannelSchema.parse(req.body);
    const channel = await createSalesChannel(validatedData);
    res.status(201).json({
      success: true,
      message: "Sales channel created successfully",
      data: channel
    });
  } catch (error) {
    next(error);
  }
};
var editSalesChannel = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales channel ID"
      });
    }
    const validatedData = updateSalesChannelSchema.parse(req.body);
    const channel = await updateSalesChannel(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Sales channel updated successfully",
      data: channel
    });
  } catch (error) {
    next(error);
  }
};
var removeSalesChannel = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales channel ID"
      });
    }
    const result = await deleteSalesChannel(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/salesChannel.routes.ts
var router12 = Router12();
router12.get("/", getSalesChannels);
router12.get("/:id", getSalesChannel);
router12.post("/", authenticate, requireAdmin, addSalesChannel);
router12.put("/:id", authenticate, requireAdmin, editSalesChannel);
router12.delete("/:id", authenticate, requireAdmin, removeSalesChannel);
var salesChannel_routes_default = router12;

// src/routes/inventory.routes.ts
import { Router as Router13 } from "express";

// src/validations/inventory.validation.ts
import { z as z13 } from "zod";
var adjustStockSchema = z13.object({
  productId: z13.number().int().positive("Valid Product ID is required"),
  warehouseId: z13.number().int().positive().optional().default(1),
  action: z13.enum(["ADD", "DEDUCT", "SET"]),
  quantity: z13.number().min(0, "Quantity must be 0 or greater"),
  reason: z13.string().optional(),
  referenceDocument: z13.string().optional()
});

// src/services/inventory.service.ts
var initialLedgerSeed = [
  {
    date: /* @__PURE__ */ new Date("2026-09-24T15:30:00Z"),
    productId: 5,
    sku: "TBL-002",
    productName: "Walnut Console Table",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    movementType: "PURCHASE_RECEIPT",
    referenceDocument: "PO-2026-001",
    quantityChange: 10,
    previousBalance: 0,
    newBalance: 10,
    notes: "Supplier Appalachian Hardwood Mills shipment check-in"
  },
  {
    date: /* @__PURE__ */ new Date("2026-09-24T15:30:00Z"),
    productId: 3,
    sku: "TBL-001",
    productName: "Oak Side Table",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    movementType: "PURCHASE_RECEIPT",
    referenceDocument: "PO-2026-001",
    quantityChange: 15,
    previousBalance: 0,
    newBalance: 15,
    notes: "Supplier Appalachian Hardwood Mills shipment check-in"
  },
  {
    date: /* @__PURE__ */ new Date("2026-10-02T11:45:00Z"),
    productId: 2,
    sku: "CHR-001",
    productName: "Luna Accent Chair",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    movementType: "PURCHASE_RECEIPT",
    referenceDocument: "PO-2026-003",
    quantityChange: 20,
    previousBalance: 0,
    newBalance: 20,
    notes: "Vendor procurement check-in at dock"
  },
  {
    date: /* @__PURE__ */ new Date("2026-10-14T10:15:00Z"),
    productId: 1,
    sku: "BED-001",
    productName: "Cotton Bedsheet Set - Queen",
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    movementType: "SALES_INVOICE",
    referenceDocument: "INV-2026-001",
    quantityChange: -2,
    previousBalance: 44,
    newBalance: 42,
    notes: "Customer sales order fulfillment"
  }
];
var seedInitialStockLedger = async () => {
  const count = await prisma.stockLedger.count();
  if (count === 0) {
    for (const entry of initialLedgerSeed) {
      await prisma.stockLedger.create({
        data: entry
      });
    }
  }
};
var getInventorySummary = async (filters, pagination) => {
  const whereClause = {};
  if (filters?.categoryId) {
    whereClause.categoryId = filters.categoryId;
  }
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } }
    ];
  }
  const allProducts = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: {
        select: { name: true }
      }
    },
    orderBy: {
      id: "asc"
    }
  });
  const defaultWarehouse = await prisma.warehouse.findFirst({
    orderBy: { id: "asc" }
  });
  let mappedItems = allProducts.map((product) => {
    const onHand = product.stock;
    const reserved = Math.min(onHand, 2);
    const available = Math.max(0, onHand - reserved);
    const reorderLevel = product.reorderLevel || 10;
    const inventoryValue = Math.round(onHand * product.costPrice * 100) / 100;
    let stockStatus = "IN_STOCK";
    if (onHand === 0) {
      stockStatus = "OUT_OF_STOCK";
    } else if (onHand <= reorderLevel) {
      stockStatus = "LOW_STOCK";
    }
    return {
      id: product.id,
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      category: product.category?.name || "Uncategorized",
      warehouseId: defaultWarehouse?.id || 1,
      warehouseName: defaultWarehouse?.name || "Central Distribution Center (CDC)",
      onHand,
      reserved,
      available,
      reorderLevel,
      unitCost: product.costPrice,
      inventoryValue,
      stockStatus,
      uom: product.uom || "PCS"
    };
  });
  const targetStockStatus = filters?.stockStatus || (filters?.status && ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"].includes(filters.status) ? filters.status : void 0);
  if (targetStockStatus && targetStockStatus !== "ALL") {
    mappedItems = mappedItems.filter((item) => item.stockStatus === targetStockStatus);
  }
  const totalUnits = mappedItems.reduce((acc, i) => acc + i.onHand, 0);
  const totalValuation = mappedItems.reduce((acc, i) => acc + i.inventoryValue, 0);
  const inStockCount = mappedItems.filter((i) => i.stockStatus === "IN_STOCK").length;
  const lowStockCount = mappedItems.filter((i) => i.stockStatus === "LOW_STOCK").length;
  const outOfStockCount = mappedItems.filter((i) => i.stockStatus === "OUT_OF_STOCK").length;
  const kpi = {
    totalUnits,
    totalValuation: Math.round(totalValuation * 100) / 100,
    inStockCount,
    lowStockCount,
    outOfStockCount
  };
  const totalItems = mappedItems.length;
  let pagedItems = mappedItems;
  if (pagination && pagination.isPaginated) {
    pagedItems = mappedItems.slice(pagination.skip, pagination.skip + pagination.limit);
  }
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    inventory: pagedItems,
    pagination: paginationMeta,
    kpi
  };
};
var getInventoryAlerts = async () => {
  const result = await getInventorySummary();
  return result.inventory.filter(
    (item) => item.stockStatus === "LOW_STOCK" || item.stockStatus === "OUT_OF_STOCK"
  );
};
var getStockLedger = async (filters, pagination) => {
  await seedInitialStockLedger();
  const whereClause = {};
  if (filters?.productId) {
    whereClause.productId = filters.productId;
  }
  if (filters?.warehouseId) {
    whereClause.warehouseId = filters.warehouseId;
  }
  if (filters?.movementType && filters.movementType !== "ALL") {
    whereClause.movementType = filters.movementType;
  }
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.date = dateFilter;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { sku: { contains: term, mode: "insensitive" } },
      { productName: { contains: term, mode: "insensitive" } },
      { referenceDocument: { contains: term, mode: "insensitive" } },
      { notes: { contains: term, mode: "insensitive" } }
    ];
  }
  const totalItems = await prisma.stockLedger.count({
    where: whereClause
  });
  const ledger = await prisma.stockLedger.findMany({
    where: whereClause,
    orderBy: {
      date: "desc"
    },
    ...pagination && {
      skip: pagination.skip,
      take: pagination.limit
    }
  });
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    ledger,
    pagination: paginationMeta
  };
};
var adjustStock = async (data) => {
  const product = await prisma.product.findUnique({
    where: { id: data.productId }
  });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: data.warehouseId || 1 }
  });
  const warehouseName = warehouse?.name || "Central Distribution Center (CDC)";
  const previousBalance = product.stock;
  let newBalance = previousBalance;
  let quantityChange = 0;
  if (data.action === "ADD") {
    quantityChange = data.quantity;
    newBalance = previousBalance + data.quantity;
  } else if (data.action === "DEDUCT") {
    quantityChange = -data.quantity;
    newBalance = Math.max(0, previousBalance - data.quantity);
  } else if (data.action === "SET") {
    quantityChange = data.quantity - previousBalance;
    newBalance = data.quantity;
  }
  const updatedProduct = await prisma.product.update({
    where: { id: product.id },
    data: {
      stock: newBalance
    }
  });
  const ledgerEntry = await prisma.stockLedger.create({
    data: {
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      warehouseId: data.warehouseId || 1,
      warehouseName,
      movementType: "INVENTORY_ADJUSTMENT",
      referenceDocument: data.referenceDocument || `ADJ-${Date.now().toString().slice(-6)}`,
      quantityChange,
      previousBalance,
      newBalance,
      notes: data.reason || "Manual cycle count adjustment"
    }
  });
  return {
    product: updatedProduct,
    ledgerEntry
  };
};

// src/controllers/inventory.controller.ts
var getInventory = async (req, res, next) => {
  try {
    const { warehouseId, categoryId, status, stockStatus, search } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getInventorySummary(
      {
        warehouseId: warehouseId ? Number(warehouseId) : void 0,
        categoryId: categoryId ? Number(categoryId) : void 0,
        status: status ? String(status) : void 0,
        stockStatus: stockStatus ? String(stockStatus) : void 0,
        search: search ? String(search) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Inventory summary fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.inventory
    });
  } catch (error) {
    next(error);
  }
};
var getAlerts = async (_req, res, next) => {
  try {
    const alerts = await getInventoryAlerts();
    res.status(200).json({
      success: true,
      message: "Inventory alerts fetched successfully",
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};
var getLedger = async (req, res, next) => {
  try {
    const {
      productId,
      warehouseId,
      movementType,
      search,
      timeRange,
      startDate,
      endDate
    } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getStockLedger(
      {
        productId: productId ? Number(productId) : void 0,
        warehouseId: warehouseId ? Number(warehouseId) : void 0,
        movementType: movementType ? String(movementType) : void 0,
        search: search ? String(search) : void 0,
        timeRange: timeRange ? String(timeRange) : void 0,
        startDate: startDate ? String(startDate) : void 0,
        endDate: endDate ? String(endDate) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Stock ledger movements fetched successfully",
      pagination: result.pagination,
      data: result.ledger
    });
  } catch (error) {
    next(error);
  }
};
var postAdjustment = async (req, res, next) => {
  try {
    const validatedData = adjustStockSchema.parse(req.body);
    const result = await adjustStock(validatedData);
    res.status(200).json({
      success: true,
      message: "Inventory stock adjusted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/inventory.routes.ts
var router13 = Router13();
router13.get("/", getInventory);
router13.get("/alerts", getAlerts);
router13.get("/ledger", getLedger);
router13.post("/adjustments", authenticate, postAdjustment);
var inventory_routes_default = router13;

// src/routes/import.routes.ts
import { Router as Router14 } from "express";

// src/validations/import.validation.ts
import { z as z14 } from "zod";
var importExpenseHeadSchema = z14.object({
  id: z14.union([z14.number(), z14.string()]).optional(),
  type: z14.enum([
    "FREIGHT",
    "INSURANCE",
    "CUSTOMS",
    "PORT_HANDLING",
    "BROKERAGE",
    "OTHER"
  ]),
  description: z14.string().min(1, "Description is required"),
  amount: z14.number().min(0, "Expense amount cannot be negative"),
  allocationMethod: z14.enum(["BY_VALUE", "BY_QUANTITY", "EQUAL"]).default("BY_VALUE")
});
var importItemSchema = z14.object({
  id: z14.union([z14.number(), z14.string()]).optional(),
  productId: z14.number().int().positive("Product ID required"),
  sku: z14.string().optional(),
  productName: z14.string().optional(),
  quantity: z14.number().min(1, "Quantity must be at least 1"),
  purchaseUnitCost: z14.number().min(0, "Purchase unit cost cannot be negative"),
  purchaseTotalCost: z14.number().min(0).optional(),
  allocatedExpense: z14.number().min(0).default(0).optional(),
  totalLandedCost: z14.number().min(0).optional(),
  landedUnitCost: z14.number().min(0).optional()
});
var createImportSchema = z14.object({
  importNumber: z14.string().optional(),
  // Auto-generated by backend e.g. IMP-2026-002
  supplierId: z14.number().optional().nullable(),
  supplierName: z14.string().optional().nullable(),
  supplierInvoiceNumber: z14.string().optional().nullable(),
  purchaseId: z14.number().optional().nullable(),
  purchaseNumber: z14.string().optional().nullable(),
  shipmentReference: z14.string().optional().nullable(),
  importDate: z14.string().optional(),
  warehouseId: z14.number().optional().default(1),
  warehouseName: z14.string().optional(),
  status: z14.enum(["DRAFT", "PROCESSING", "REVIEW_REQUIRED", "COMPLETED", "CANCELLED"]).default("DRAFT"),
  items: z14.array(importItemSchema).min(1, "At least one item is required in shipment"),
  expenseHeads: z14.array(importExpenseHeadSchema).default([]),
  totalProductCost: z14.number().min(0).optional(),
  totalAdditionalCosts: z14.number().min(0).optional(),
  totalLandedCost: z14.number().min(0).optional(),
  documentName: z14.string().optional().nullable(),
  documentExtracted: z14.boolean().default(false).optional(),
  notes: z14.string().optional().nullable()
});
var updateImportSchema = createImportSchema.partial();

// src/services/import.service.ts
var calculateLandedCosts = (items, expenseHeads) => {
  const totalProductCost = items.reduce(
    (sum, item) => sum + (Number(item.purchaseTotalCost) || Number(item.quantity) * Number(item.purchaseUnitCost)),
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  return items.map((item, index) => {
    const purchaseTotalCost = Number(item.purchaseTotalCost) || Number(item.quantity) * Number(item.purchaseUnitCost);
    let itemAllocated = 0;
    for (const expense of expenseHeads) {
      const amount = Number(expense.amount) || 0;
      if (amount <= 0) continue;
      let ratio = 0;
      if (expense.allocationMethod === "BY_VALUE") {
        ratio = totalProductCost > 0 ? purchaseTotalCost / totalProductCost : 0;
      } else if (expense.allocationMethod === "BY_QUANTITY") {
        ratio = totalQuantity > 0 ? Number(item.quantity) / totalQuantity : 0;
      } else {
        ratio = items.length > 0 ? 1 / items.length : 0;
      }
      itemAllocated += amount * ratio;
    }
    const totalLandedCost = purchaseTotalCost + itemAllocated;
    const landedUnitCost = Number(item.quantity) > 0 ? totalLandedCost / Number(item.quantity) : 0;
    return {
      ...item,
      id: item.id || index + 1,
      purchaseTotalCost: Number(purchaseTotalCost.toFixed(2)),
      allocatedExpense: Number(itemAllocated.toFixed(2)),
      totalLandedCost: Number(totalLandedCost.toFixed(2)),
      landedUnitCost: Number(landedUnitCost.toFixed(2))
    };
  });
};
var initialImportsSeed = [
  {
    importNumber: "IMP-2026-001",
    supplierId: 2,
    supplierName: "Royal Teak Exports Ltd",
    supplierInvoiceNumber: "RTE-INV-99412",
    purchaseId: 1,
    purchaseNumber: "PO-2026-001",
    shipmentReference: "BOL-MSC-774129",
    importDate: /* @__PURE__ */ new Date("2026-10-12T10:00:00Z"),
    warehouseId: 1,
    warehouseName: "Central Distribution Center (CDC)",
    status: "COMPLETED",
    items: [
      {
        id: 1,
        productId: 5,
        sku: "TBL-002",
        productName: "Walnut Console Table",
        quantity: 10,
        purchaseUnitCost: 450,
        purchaseTotalCost: 4500,
        allocatedExpense: 375,
        totalLandedCost: 4875,
        landedUnitCost: 487.5
      },
      {
        id: 2,
        productId: 3,
        sku: "TBL-001",
        productName: "Oak Side Table",
        quantity: 15,
        purchaseUnitCost: 170,
        purchaseTotalCost: 2550,
        allocatedExpense: 212.5,
        totalLandedCost: 2762.5,
        landedUnitCost: 184.17
      }
    ],
    expenseHeads: [
      {
        id: 1,
        type: "FREIGHT",
        description: "Ocean Freight - MSC Flaminia Container 40ft",
        amount: 350,
        allocationMethod: "BY_VALUE"
      },
      {
        id: 2,
        type: "CUSTOMS",
        description: "US Customs & Border Protection Harbor Tariff",
        amount: 150,
        allocationMethod: "BY_VALUE"
      },
      {
        id: 3,
        type: "PORT_HANDLING",
        description: "Port Newark Terminal Drayage and Offload",
        amount: 87.5,
        allocationMethod: "BY_VALUE"
      }
    ],
    totalProductCost: 7050,
    totalAdditionalCosts: 587.5,
    totalLandedCost: 7637.5,
    documentName: "Customs_Bill_of_Lading_MSC774129.pdf",
    documentExtracted: true,
    notes: "Direct container clearance through Port Newark."
  }
];
var seedInitialImports = async () => {
  const count = await prisma.importShipment.count();
  if (count === 0) {
    for (const imp of initialImportsSeed) {
      await prisma.importShipment.create({
        data: imp
      });
    }
  }
};
var generateNextImportNumber = async () => {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const prefix = `IMP-${year}-`;
  const latest = await prisma.importShipment.findFirst({
    where: {
      importNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      id: "desc"
    }
  });
  if (!latest) {
    return `${prefix}001`;
  }
  const parts = latest.importNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
};
var getAllImports = async (filters, pagination) => {
  await seedInitialImports();
  const whereClause = {};
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }
  if (filters?.warehouseId) {
    whereClause.warehouseId = filters.warehouseId;
  }
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (dateFilter) {
    whereClause.importDate = dateFilter;
  }
  if (filters?.search) {
    const term = filters.search.trim();
    whereClause.OR = [
      { importNumber: { contains: term, mode: "insensitive" } },
      { supplierName: { contains: term, mode: "insensitive" } },
      { shipmentReference: { contains: term, mode: "insensitive" } },
      { supplierInvoiceNumber: { contains: term, mode: "insensitive" } }
    ];
  }
  const totalItems = await prisma.importShipment.count({
    where: whereClause
  });
  const allFiltered = await prisma.importShipment.findMany({
    where: whereClause,
    select: {
      totalProductCost: true,
      totalAdditionalCosts: true,
      totalLandedCost: true,
      status: true
    }
  });
  const totalShipments = allFiltered.length;
  const totalProductCost = allFiltered.reduce(
    (sum, imp) => sum + imp.totalProductCost,
    0
  );
  const totalAdditionalCosts = allFiltered.reduce(
    (sum, imp) => sum + imp.totalAdditionalCosts,
    0
  );
  const totalLandedCost = allFiltered.reduce(
    (sum, imp) => sum + imp.totalLandedCost,
    0
  );
  const completedCount = allFiltered.filter(
    (imp) => imp.status === "COMPLETED"
  ).length;
  const inProgressCount = allFiltered.filter(
    (imp) => imp.status !== "COMPLETED" && imp.status !== "CANCELLED"
  ).length;
  const kpi = {
    totalShipments,
    totalProductCost: Math.round(totalProductCost * 100) / 100,
    totalAdditionalCosts: Math.round(totalAdditionalCosts * 100) / 100,
    totalLandedCost: Math.round(totalLandedCost * 100) / 100,
    completedCount,
    inProgressCount
  };
  const shipments = await prisma.importShipment.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc"
    },
    ...pagination && {
      skip: pagination.skip,
      take: pagination.limit
    }
  });
  const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
  return {
    shipments,
    pagination: paginationMeta,
    kpi
  };
};
var getImportById = async (id) => {
  await seedInitialImports();
  const shipment = await prisma.importShipment.findUnique({
    where: { id }
  });
  if (!shipment) {
    const error = new Error("Import shipment not found");
    error.statusCode = 404;
    throw error;
  }
  return shipment;
};
var createImportShipment = async (data) => {
  const importNumber = data.importNumber || await generateNextImportNumber();
  const preparedItems = await Promise.all(
    data.items.map(async (item) => {
      let sku = item.sku;
      let productName = item.productName;
      let purchaseUnitCost = item.purchaseUnitCost;
      if (!sku || !productName || !purchaseUnitCost) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (prod) {
          sku = sku || prod.sku;
          productName = productName || prod.name;
          purchaseUnitCost = purchaseUnitCost || prod.costPrice;
        }
      }
      const totalCost = item.purchaseTotalCost ?? Number(item.quantity) * Number(purchaseUnitCost);
      return {
        ...item,
        sku: sku || `SKU-${item.productId}`,
        productName: productName || `Product ${item.productId}`,
        purchaseUnitCost: Number(purchaseUnitCost),
        purchaseTotalCost: Number(totalCost)
      };
    })
  );
  const calculatedItems = calculateLandedCosts(preparedItems, data.expenseHeads || []);
  const totalProductCost = calculatedItems.reduce(
    (sum, it) => sum + Number(it.purchaseTotalCost),
    0
  );
  const totalAdditionalCosts = (data.expenseHeads || []).reduce(
    (sum, ex) => sum + (Number(ex.amount) || 0),
    0
  );
  const totalLandedCost = totalProductCost + totalAdditionalCosts;
  let warehouseName = data.warehouseName;
  if (!warehouseName && data.warehouseId) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId }
    });
    warehouseName = wh?.name || "Central Distribution Center (CDC)";
  }
  let supplierName = data.supplierName;
  if (!supplierName && data.supplierId) {
    const sup = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    });
    supplierName = sup?.companyName || "Vendor";
  }
  const shipment = await prisma.importShipment.create({
    data: {
      importNumber,
      supplierId: data.supplierId || null,
      supplierName: supplierName || null,
      supplierInvoiceNumber: data.supplierInvoiceNumber || null,
      purchaseId: data.purchaseId || null,
      purchaseNumber: data.purchaseNumber || null,
      shipmentReference: data.shipmentReference || null,
      importDate: data.importDate ? new Date(data.importDate) : /* @__PURE__ */ new Date(),
      warehouseId: data.warehouseId || 1,
      warehouseName: warehouseName || "Central Distribution Center (CDC)",
      status: data.status || "DRAFT",
      items: calculatedItems,
      expenseHeads: data.expenseHeads || [],
      totalProductCost,
      totalAdditionalCosts,
      totalLandedCost,
      documentName: data.documentName || null,
      documentExtracted: data.documentExtracted || false,
      notes: data.notes || null
    }
  });
  return shipment;
};
var updateImportShipment = async (id, data) => {
  const existing = await getImportById(id);
  let calculatedItems = existing.items;
  let expenseHeads = data.expenseHeads ?? existing.expenseHeads;
  if (data.items || data.expenseHeads) {
    const itemsToProcess = data.items || calculatedItems;
    calculatedItems = calculateLandedCosts(itemsToProcess, expenseHeads);
  }
  const totalProductCost = calculatedItems.reduce(
    (sum, it) => sum + Number(it.purchaseTotalCost),
    0
  );
  const totalAdditionalCosts = expenseHeads.reduce(
    (sum, ex) => sum + (Number(ex.amount) || 0),
    0
  );
  const totalLandedCost = totalProductCost + totalAdditionalCosts;
  const updated = await prisma.importShipment.update({
    where: { id },
    data: {
      ...data.importNumber && { importNumber: data.importNumber },
      ...data.supplierId !== void 0 && { supplierId: data.supplierId },
      ...data.supplierName !== void 0 && { supplierName: data.supplierName },
      ...data.supplierInvoiceNumber !== void 0 && {
        supplierInvoiceNumber: data.supplierInvoiceNumber
      },
      ...data.purchaseId !== void 0 && { purchaseId: data.purchaseId },
      ...data.purchaseNumber !== void 0 && { purchaseNumber: data.purchaseNumber },
      ...data.shipmentReference !== void 0 && {
        shipmentReference: data.shipmentReference
      },
      ...data.importDate && { importDate: new Date(data.importDate) },
      ...data.warehouseId && { warehouseId: data.warehouseId },
      ...data.warehouseName && { warehouseName: data.warehouseName },
      ...data.status && { status: data.status },
      items: calculatedItems,
      expenseHeads,
      totalProductCost,
      totalAdditionalCosts,
      totalLandedCost,
      ...data.documentName !== void 0 && { documentName: data.documentName },
      ...data.notes !== void 0 && { notes: data.notes }
    }
  });
  return updated;
};
var deleteImportShipment = async (id) => {
  await getImportById(id);
  await prisma.importShipment.delete({
    where: { id }
  });
  return { id, message: "Import shipment deleted successfully" };
};

// src/controllers/import.controller.ts
var getImports = async (req, res, next) => {
  try {
    const {
      status,
      warehouseId,
      search,
      timeRange,
      startDate,
      endDate
    } = req.query;
    const pagination = getPaginationParams(req.query);
    const result = await getAllImports(
      {
        status: status ? String(status) : void 0,
        warehouseId: warehouseId ? Number(warehouseId) : void 0,
        search: search ? String(search) : void 0,
        timeRange: timeRange ? String(timeRange) : void 0,
        startDate: startDate ? String(startDate) : void 0,
        endDate: endDate ? String(endDate) : void 0
      },
      pagination
    );
    res.status(200).json({
      success: true,
      message: "Import shipments fetched successfully",
      kpi: result.kpi,
      pagination: result.pagination,
      data: result.shipments
    });
  } catch (error) {
    next(error);
  }
};
var getImport = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import shipment ID"
      });
    }
    const shipment = await getImportById(id);
    res.status(200).json({
      success: true,
      message: "Import shipment fetched successfully",
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};
var addImport = async (req, res, next) => {
  try {
    const validatedData = createImportSchema.parse(req.body);
    const shipment = await createImportShipment(validatedData);
    res.status(201).json({
      success: true,
      message: "Import shipment created successfully",
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};
var editImport = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import shipment ID"
      });
    }
    const validatedData = updateImportSchema.parse(req.body);
    const shipment = await updateImportShipment(id, validatedData);
    res.status(200).json({
      success: true,
      message: "Import shipment updated successfully",
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};
var removeImport = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import shipment ID"
      });
    }
    const result = await deleteImportShipment(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/import.routes.ts
var router14 = Router14();
router14.get("/", getImports);
router14.get("/:id", getImport);
router14.post("/", authenticate, addImport);
router14.put("/:id", authenticate, editImport);
router14.delete("/:id", authenticate, removeImport);
var import_routes_default = router14;

// src/routes/insight.routes.ts
import { Router as Router15 } from "express";

// src/services/insight.service.ts
var getDashboardInsights = async (filters) => {
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  const invoiceWhere = {
    status: { not: "CANCELLED" }
  };
  if (dateFilter) {
    invoiceWhere.invoiceDate = dateFilter;
  }
  const invoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    orderBy: { createdAt: "desc" }
  });
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const outstandingAmount = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const purchaseWhere = {
    status: { not: "CANCELLED" }
  };
  if (dateFilter) {
    purchaseWhere.purchaseDate = dateFilter;
  }
  const purchases = await prisma.purchase.findMany({
    where: purchaseWhere,
    orderBy: { createdAt: "desc" }
  });
  const totalPurchasesCost = purchases.reduce((sum, po) => sum + po.grandTotal, 0);
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: { name: true }
      }
    }
  });
  const totalProducts = products.length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.stock * p.costPrice,
    0
  );
  let totalCostOfGoodsSold = 0;
  const productSalesMap = {};
  for (const inv of invoices) {
    const items = inv.items;
    if (Array.isArray(items)) {
      for (const item of items) {
        const prod = products.find((p) => p.id === Number(item.productId));
        const costPrice = prod ? prod.costPrice : 0;
        const qty = Number(item.quantity) || 0;
        const lineTotal = Number(item.lineTotal) || qty * (item.unitPrice || 0);
        totalCostOfGoodsSold += qty * costPrice;
        if (item.productId) {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = { unitsSold: 0, revenue: 0 };
          }
          productSalesMap[item.productId].unitsSold += qty;
          productSalesMap[item.productId].revenue += lineTotal;
        }
      }
    }
  }
  const grossProfit = Math.max(0, totalSales - totalCostOfGoodsSold);
  const bestSellingProducts = products.map((prod) => {
    const sales = productSalesMap[prod.id] || { unitsSold: 0, revenue: 0 };
    const costOfSold = sales.unitsSold * prod.costPrice;
    const profit = Math.max(0, sales.revenue - costOfSold);
    const marginPercent = sales.revenue > 0 ? Math.round(profit / sales.revenue * 100) : 0;
    return {
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      category: prod.category?.name || "Uncategorized",
      unitsSold: sales.unitsSold,
      revenue: Math.round(sales.revenue * 100) / 100,
      costPrice: prod.costPrice,
      profit: Math.round(profit * 100) / 100,
      marginPercent,
      onHandStock: prod.stock
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const channelData = {};
  for (const inv of invoices) {
    const channel = inv.salesChannel || "Website";
    if (!channelData[channel]) {
      channelData[channel] = { value: 0, orders: 0 };
    }
    channelData[channel].value += inv.grandTotal;
    channelData[channel].orders += 1;
  }
  const channelBreakdown = Object.entries(channelData).map(([name, data]) => ({
    name,
    value: Math.round(data.value * 100) / 100,
    orders: data.orders
  }));
  const categoryData = {};
  for (const inv of invoices) {
    const items = inv.items;
    if (Array.isArray(items)) {
      for (const item of items) {
        const prod = products.find((p) => p.id === Number(item.productId));
        const cat = prod?.category?.name || "Other";
        if (!categoryData[cat]) {
          categoryData[cat] = { revenue: 0, units: 0 };
        }
        categoryData[cat].revenue += Number(item.lineTotal) || 0;
        categoryData[cat].units += Number(item.quantity) || 0;
      }
    }
  }
  const categoryBreakdown = Object.entries(categoryData).map(
    ([category, data]) => ({
      category,
      revenue: Math.round(data.revenue * 100) / 100,
      units: data.units,
      percentage: totalSales > 0 ? Math.round(data.revenue / totalSales * 100) : 0
    })
  );
  const monthlyTrends = [
    { month: "May", revenue: 31200, cost: 14100, profit: 17100 },
    { month: "Jun", revenue: 37500, cost: 16800, profit: 20700 },
    { month: "Jul", revenue: 42100, cost: 18900, profit: 23200 },
    { month: "Aug", revenue: 36400, cost: 16200, profit: 20200 },
    { month: "Sep", revenue: 44800, cost: 19900, profit: 24900 },
    {
      month: "Current",
      revenue: Math.round(totalSales * 100) / 100,
      cost: Math.round(totalCostOfGoodsSold * 100) / 100,
      profit: Math.round(grossProfit * 100) / 100
    }
  ];
  return {
    kpi: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      totalCostOfGoodsSold: Math.round(totalCostOfGoodsSold * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitMarginPercent: totalSales > 0 ? Math.round(grossProfit / totalSales * 100) : 0,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      totalProducts,
      totalInvoices: invoices.length,
      totalPurchases: purchases.length,
      totalPurchasesCost: Math.round(totalPurchasesCost * 100) / 100
    },
    monthlyTrends,
    channelBreakdown,
    categoryBreakdown,
    bestSellingProducts,
    recentInvoices: invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      buyerName: inv.buyerName,
      date: inv.invoiceDate,
      amount: inv.grandTotal,
      status: inv.paymentStatus
    }))
  };
};
var getFinancialReports = async (type, filters, pagination) => {
  const dateFilter = parseDateRangeFilter(
    filters?.timeRange,
    filters?.startDate,
    filters?.endDate
  );
  if (type === "sales") {
    const whereClause = {};
    if (dateFilter) whereClause.invoiceDate = dateFilter;
    if (filters?.status && filters.status !== "ALL") whereClause.status = filters.status;
    if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
      whereClause.paymentStatus = filters.paymentStatus;
    }
    const totalItems = await prisma.invoice.count({ where: whereClause });
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { invoiceDate: "desc" },
      ...pagination && pagination.isPaginated && {
        skip: pagination.skip,
        take: pagination.limit
      }
    });
    const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
    return {
      reportType: "sales",
      pagination: paginationMeta,
      data: invoices
    };
  }
  if (type === "purchases") {
    const whereClause = {};
    if (dateFilter) whereClause.purchaseDate = dateFilter;
    if (filters?.status && filters.status !== "ALL") whereClause.status = filters.status;
    const totalItems = await prisma.purchase.count({ where: whereClause });
    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      orderBy: { purchaseDate: "desc" },
      ...pagination && pagination.isPaginated && {
        skip: pagination.skip,
        take: pagination.limit
      }
    });
    const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
    return {
      reportType: "purchases",
      pagination: paginationMeta,
      data: purchases
    };
  }
  if (type === "inventory") {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: "asc" }
    });
    const mapped = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category?.name || "Uncategorized",
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      inventoryValue: Math.round(p.stock * p.costPrice * 100) / 100,
      reorderLevel: p.reorderLevel,
      status: p.stock <= p.reorderLevel ? "LOW_STOCK" : "IN_STOCK"
    }));
    const totalItems = mapped.length;
    const paged = pagination && pagination.isPaginated ? mapped.slice(pagination.skip, pagination.skip + pagination.limit) : mapped;
    const paginationMeta = pagination ? buildPaginationMetadata(totalItems, pagination.page, pagination.limit) : buildPaginationMetadata(totalItems, 1, totalItems || 1);
    return {
      reportType: "inventory",
      pagination: paginationMeta,
      data: paged
    };
  }
  if (type === "tax") {
    const invoiceWhere = { status: { not: "CANCELLED" } };
    const purchaseWhere = { status: { not: "CANCELLED" } };
    if (dateFilter) {
      invoiceWhere.invoiceDate = dateFilter;
      purchaseWhere.purchaseDate = dateFilter;
    }
    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere
    });
    const purchases = await prisma.purchase.findMany({
      where: purchaseWhere
    });
    const taxCollected = invoices.reduce((sum, inv) => sum + inv.taxTotal, 0);
    const taxPaid = purchases.reduce((sum, po) => sum + po.tax, 0);
    const netTaxPayable = Math.max(0, taxCollected - taxPaid);
    return {
      reportType: "tax",
      data: {
        taxCollected: Math.round(taxCollected * 100) / 100,
        taxPaid: Math.round(taxPaid * 100) / 100,
        netTaxPayable: Math.round(netTaxPayable * 100) / 100,
        invoicesCount: invoices.length,
        purchasesCount: purchases.length
      }
    };
  }
  if (type === "profit-loss") {
    const insights = await getDashboardInsights({
      timeRange: filters?.timeRange,
      startDate: filters?.startDate,
      endDate: filters?.endDate
    });
    return {
      reportType: "profit-loss",
      data: {
        grossRevenue: insights.kpi.totalSales,
        cogs: insights.kpi.totalCostOfGoodsSold,
        grossProfit: insights.kpi.grossProfit,
        marginPercent: insights.kpi.profitMarginPercent,
        outstandingReceivables: insights.kpi.outstandingAmount
      }
    };
  }
  return { message: "Unknown report type" };
};

// src/controllers/insight.controller.ts
var getInsights = async (req, res, next) => {
  try {
    const { timeRange, startDate, endDate } = req.query;
    const data = await getDashboardInsights({
      timeRange: timeRange ? String(timeRange) : void 0,
      startDate: startDate ? String(startDate) : void 0,
      endDate: endDate ? String(endDate) : void 0
    });
    res.status(200).json({
      success: true,
      message: "Dashboard business insights fetched successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};
var getReport = async (req, res, next) => {
  try {
    const type = String(req.params.type);
    const pagination = getPaginationParams(req.query);
    const result = await getFinancialReports(type, req.query, pagination);
    res.status(200).json({
      success: true,
      message: `${type.toUpperCase()} report generated successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/insight.routes.ts
var router15 = Router15();
router15.get("/insights", getInsights);
router15.get("/reports/:type", getReport);
var insight_routes_default = router15;

// src/routes/index.ts
var router16 = Router16();
router16.use(health_routes_default);
router16.use("/auth", auth_routes_default);
router16.use("/settings", settings_routes_default);
router16.use("/categories", category_routes_default);
router16.use("/products", product_routes_default);
router16.use("/warehouses", warehouse_routes_default);
router16.use("/suppliers", supplier_routes_default);
router16.use("/purchases", purchase_routes_default);
router16.use("/invoices", invoice_routes_default);
router16.use("/roles", role_routes_default);
router16.use("/users", user_routes_default);
router16.use("/sales-channels", salesChannel_routes_default);
router16.use("/inventory", inventory_routes_default);
router16.use("/imports", import_routes_default);
router16.use(insight_routes_default);

// src/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

// src/middleware/errorHandler.ts
import { ZodError } from "zod";
var errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const formattedErrors = {};
    for (const issue of err.issues) {
      const fieldPath = issue.path.join(".") || "field";
      formattedErrors[fieldPath] = issue.message;
    }
    return res.status(400).json({
      success: false,
      message: "Validation failed. Please verify the provided request data.",
      errors: formattedErrors
    });
  }
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err;
    if (prismaErr.code === "P2002") {
      const target = prismaErr.meta?.target || ["field"];
      const fieldName = target.join(", ");
      return res.status(409).json({
        success: false,
        message: `A record with this ${fieldName} already exists. Please choose a unique value.`,
        field: fieldName
      });
    }
    if (prismaErr.code === "P2003") {
      const fieldName = prismaErr.meta?.field_name || "referenced ID";
      return res.status(400).json({
        success: false,
        message: `Referenced entity does not exist (${fieldName}). Please provide a valid ID from the master catalog.`
      });
    }
    if (prismaErr.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "The requested record could not be found or has already been removed."
      });
    }
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body. Please verify the JSON syntax."
    });
  }
  if (err instanceof Error) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "An unexpected error occurred.";
    return res.status(statusCode).json({
      success: false,
      message
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal server error. Our engineering team has logged the incident."
  });
};

// src/app.ts
var app = express();
var allowedOrigins = env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins === "*" || Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Sundara Furnishings ERP Backend API is live",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api", router16);
app.use(router16);
app.use(notFound);
app.use(errorHandler);

// src/serverless.ts
var serverless_default = app;
export {
  serverless_default as default
};
