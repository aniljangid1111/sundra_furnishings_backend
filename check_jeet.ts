import "dotenv/config";
import { prisma } from "./src/database/prisma.js";

async function main() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { id: "desc" },
  });
  console.log("TOTAL_INVOICES:", invoices.length);
  for (const inv of invoices) {
    console.log(`ID:${inv.id} Num:${inv.invoiceNumber} Buyer:${inv.buyerName} Status:${inv.status} Date:${inv.invoiceDate} Total:${inv.grandTotal}`);
    console.log("Items:", JSON.stringify(inv.items));
  }
  await prisma.$disconnect();
}

main().catch(console.error);

