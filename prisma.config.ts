// Prisma Config — manages database connection for CLI commands (migrate, push, seed)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrate: {
    async createClient() {
      const { PrismaClient } = await import("@prisma/client");
      return new PrismaClient();
    },
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
