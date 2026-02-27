import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  // Reuse the pg Pool across hot-reloads and within the same serverless instance
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      max: 1, // One connection per serverless instance to stay within Supabase session-mode pool_size
      idleTimeoutMillis: 1_000, // Release idle connections fast so other instances can use the pool
      connectionTimeoutMillis: 10_000,
    });
  }

  const adapter = new PrismaPg(globalForPrisma.pgPool);
  return new PrismaClient({ adapter });
}

// Cache the Prisma client globally in ALL environments (critical for serverless)
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
