import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
      { downloads: combined },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[live-stats] DB error:", error);
    return NextResponse.json(
      { downloads: 0, error: "db_unavailable" },
      { status: 200 }
    );
  }
}