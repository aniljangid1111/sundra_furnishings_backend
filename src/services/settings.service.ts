import { prisma } from "../database/prisma";
import crypto from "crypto";

// Default initial US Business Settings & Tax configuration
const defaultUSSettings = {
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
      isActive: true,
    },
    {
      id: "tax-resale-0",
      name: "Wholesale / Resale Certificate (0%)",
      rate: 0,
      isDefault: false,
      taxCode: "US-RESALE-EXEMPT",
      description: "Tax-exempt wholesale purchases under active State Resale Permit",
      isActive: true,
    },
    {
      id: "tax-outstate-0",
      name: "Out-of-State Non-Nexus Delivery (0%)",
      rate: 0,
      isDefault: false,
      taxCode: "US-NON-NEXUS",
      description: "Commercial shipments outside company tax nexus",
      isActive: true,
    },
    {
      id: "tax-flat-700",
      name: "Interstate Retail Flat Tax (7.00%)",
      rate: 7.0,
      isDefault: false,
      taxCode: "US-INTERSTATE-FLAT",
      description: "Standard single flat destination rate for neighboring states",
      isActive: true,
    },
  ],
  paymentTerms: [
    {
      id: "term-net-30",
      name: "Net 30",
      days: 30,
      description: "Payment due within 30 calendar days from invoice issue date",
      isDefault: true,
      isActive: true,
    },
    {
      id: "term-due-receipt",
      name: "Due on Receipt",
      days: 0,
      description: "Immediate payment required upon physical invoice delivery",
      isDefault: false,
      isActive: true,
    },
    {
      id: "term-net-15",
      name: "Net 15",
      days: 15,
      description: "Payment due within 15 calendar days from billing date",
      isDefault: false,
      isActive: true,
    },
    {
      id: "term-net-60",
      name: "Net 60",
      days: 60,
      description: "Extended commercial financing credit terms",
      isDefault: false,
      isActive: true,
    },
  ],
};

// Retrieve business settings or seed default US configuration
export const getSystemSettings = async () => {
  let settings = await prisma.setting.findFirst({
    orderBy: { id: "asc" },
  });

  if (!settings) {
    settings = await prisma.setting.create({
      data: defaultUSSettings,
    });
  }

  return settings;
};

// Update company profile, tax configuration, or payment policies
export const updateSystemSettings = async (updateData: Record<string, any>) => {
  // Auto-generate unique ID for any new tax slab if not provided
  if (Array.isArray(updateData.taxSlabs)) {
    updateData.taxSlabs = updateData.taxSlabs.map((slab: any) => ({
      ...slab,
      id: slab.id && slab.id.trim() !== "" ? slab.id : `tax-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    }));
  }

  // Auto-generate unique ID for any new payment term if not provided
  if (Array.isArray(updateData.paymentTerms)) {
    updateData.paymentTerms = updateData.paymentTerms.map((term: any) => ({
      ...term,
      id: term.id && term.id.trim() !== "" ? term.id : `term-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    }));
  }

  let settings = await prisma.setting.findFirst({
    orderBy: { id: "asc" },
  });

  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        ...defaultUSSettings,
        ...updateData,
      },
    });
  } else {
    settings = await prisma.setting.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  return settings;
};
