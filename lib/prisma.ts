import { PrismaClient } from "@prisma/client/wasm";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { cache } from "react";

/**
 * Creates a PrismaClient instance.
 * When a connection string is provided or detected, it configures
 * @prisma/adapter-pg to route queries through PostgreSQL / Cloudflare Hyperdrive.
 */
function createPrismaClient(explicitUrl?: string): PrismaClient {
  let connectionString = explicitUrl;

  // 1. Try to get Hyperdrive connection string from Cloudflare context (Workers runtime)
  if (!connectionString) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      if (ctx?.env?.HYPERDRIVE?.connectionString) {
        connectionString = ctx.env.HYPERDRIVE.connectionString;
      }
    } catch {
      // Outside Cloudflare request context
    }
  }

  // 2. Try explicit environment variables (local Wrangler .dev.vars, CF_HYPERDRIVE_URL, or DATABASE_URL)
  if (!connectionString) {
    connectionString =
      process.env.CF_HYPERDRIVE_URL ||
      process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE ||
      process.env.DATABASE_URL ||
      process.env.DIRECT_URL;
  }

  // When connection string is available, use @prisma/adapter-pg
  if (connectionString) {
    const pool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  // Standard fallback
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// React per-render cache for Server Components in Next.js
const getReactCachedPrisma = cache(() => createPrismaClient());

// Global fallback singleton for CLI/offline scripts
let globalPrisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  // 1. In Cloudflare Workers, attach to request ExecutionContext to prevent cross-request I/O errors
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.ctx) {
      const execCtx = ctx.ctx as Record<string, any>;
      if (!execCtx.__prisma) {
        execCtx.__prisma = createPrismaClient(ctx.env?.HYPERDRIVE?.connectionString);
      }
      return execCtx.__prisma;
    }
  } catch {
    // Not running inside a Cloudflare Workers request
  }

  // 2. In Next.js SSR / React Server Components, use React cache
  try {
    return getReactCachedPrisma();
  } catch {
    // Not running inside React rendering context
  }

  // 3. Fallback to singleton for CLI scripts / build time
  if (!globalPrisma) {
    globalPrisma = createPrismaClient();
  }
  return globalPrisma;
}

/**
 * Universal Prisma proxy:
 * Dynamically resolves the active request-scoped PrismaClient in Cloudflare Workers,
 * while maintaining 100% backwards compatibility for all `import { prisma } from "@/lib/prisma"`.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma() as any;
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
