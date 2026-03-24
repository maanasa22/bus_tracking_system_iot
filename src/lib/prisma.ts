import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Global polyfill for BigInt serialization (kept for backwards compatibility)
if (typeof BigInt !== "undefined" && !("toJSON" in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
