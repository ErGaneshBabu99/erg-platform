import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=60",
};

const ERROR_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const CACHE_TTL_MS = 30 * 1000;

interface CachedStats {
  data: { downloads: number };
  timestamp: number;
}

let cachedStats: CachedStats | null = null;
let inflightPromise: Promise<{ downloads: number }> | null = null;

async function fetchStatsFromDB(): Promise<{ downloads: number }> {
  const { prisma } = await import("@/lib/prisma");

  const agg = await prisma.districtRate.aggregate({
    where: { status: "PUBLISHED" },
    _sum: {
      downloadCount: true,
      viewCount: true,
      downloadCountAfter: true,
      viewCountAfter: true,
    },
  });

  const combined =
    (agg._sum.downloadCount ?? 0) +
    (agg._sum.downloadCountAfter ?? 0) +
    (agg._sum.viewCount ?? 0) +
    (agg._sum.viewCountAfter ?? 0);

  return { downloads: combined };
}

export async function GET() {
  const now = Date.now();

  // Return valid in-memory cache if fresh (< 30s)
  if (cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedStats.data, { headers: CACHE_HEADERS });
  }

  // Coalesce concurrent requests into a single in-flight query
  if (!inflightPromise) {
    inflightPromise = fetchStatsFromDB();
  }

  try {
    const data = await inflightPromise;
    // Update module cache on success
    cachedStats = { data, timestamp: Date.now() };
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    // Never cache a failure and never return fake numbers
    const errMessage = error instanceof Error ? error.message : String(error);
    const sanitized = errMessage.replace(/:[^:@]+@/, ":***@");
    console.error("[live-stats] DB error:", sanitized);

    return NextResponse.json(
      { error: "database_error" },
      { status: 500, headers: ERROR_HEADERS }
    );
  } finally {
    inflightPromise = null;
  }
}
