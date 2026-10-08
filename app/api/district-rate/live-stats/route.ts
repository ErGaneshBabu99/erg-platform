import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK_TOTAL_DOWNLOADS = 14234;
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET() {
  try {
    // Prisma is loaded inside try/catch so that if it fails to load
    // (not only if a query fails), the fallback number is still returned.
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

    return NextResponse.json(
      { downloads: combined > 0 ? combined : FALLBACK_TOTAL_DOWNLOADS },
      { headers: NO_CACHE }
    );
  } catch (error) {
    console.error("[live-stats] error:", error);
    return NextResponse.json(
      {
        downloads: FALLBACK_TOTAL_DOWNLOADS,
        warning: "db_unavailable",
        // Temporary: remove this line after the problem is fixed.
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 200, headers: NO_CACHE }
    );
  }
}
