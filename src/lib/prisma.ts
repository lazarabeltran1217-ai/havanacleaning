import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const state = globalThis as unknown as {
  pool: Pool | null;
  client: PrismaClient | null;
};

function build(): PrismaClient {
  // Tear down old pool if it exists
  if (state.pool) {
    state.pool.end().catch(() => {});
  }

  state.pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 2,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 5_000,
  });

  state.pool.on("error", (err) => {
    console.error("pg pool error — will reconnect:", err.message);
    state.client = null; // force rebuild on next access
  });

  const adapter = new PrismaPg(state.pool);
  state.client = new PrismaClient({ adapter });
  return state.client;
}

// Self-healing proxy: if the pool dies, the next call rebuilds everything
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const instance = state.client ?? build();
    return (instance as never)[prop];
  },
});
