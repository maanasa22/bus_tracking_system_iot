import { PrismaClient } from "@prisma/client";

// Global polyfill for BigInt serialization (kept for backwards compatibility)
if (typeof BigInt !== "undefined" && !("toJSON" in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
