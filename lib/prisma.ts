import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// NOTE: This file stays untouched-in-behavior for Vercel (CF_HYPERDRIVE_URL
// is only ever set inside the Cloudflare Workers runtime). On Vercel, this
// falls through to the exact same PrismaClient() call as before.
function createPrismaClient() {
  const hyperdriveUrl = process.env.CF_HYPERDRIVE_URL;

  if (hyperdriveUrl) {
    // Running on Cloudflare Workers: use the pg driver adapter through
    // Hyperdrive instead of Prisma's native (TCP) engine, which Workers
    // does not support.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: hyperdriveUrl });
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
