import dns from "node:dns";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "../config/env";

// Force IPv4 resolution to prevent IPv6 routing timeouts (ETIMEDOUT) on Windows networks when connecting to Neon AWS
dns.setDefaultResultOrder("ipv4first");
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = (hostname: string, options: any, callback: any) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const opts =
    typeof options === "object" && options !== null
      ? { ...options, family: 4 }
      : { family: 4 };
  return originalLookup(hostname, opts, callback);
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
