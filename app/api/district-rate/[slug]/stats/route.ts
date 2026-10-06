import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLegacyLookupSlug } from "@/lib/slug-migration";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const legacySlug = getLegacyLookupSlug(slug);

    const [rate, baselineConfig] = await Promise.all([
      prisma.districtRate.findFirst({
        where: {
          status: "PUBLISHED",
          OR: [{ slug }, { slug: legacySlug }],
        },
        select: {
          downloadCount: true,
          viewCount: true,
          downloadCountAfter: true,
          viewCountAfter: true,
        },
      }),
      prisma.siteConfig.findUnique({
        where: { key: "stats_baseline_date" },
      }),
    ]);

    if (!rate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      downloadsBefore: rate.downloadCount,
      viewsBefore: rate.viewCount,
      downloadsAfter: rate.downloadCountAfter,
      viewsAfter: rate.viewCountAfter,
      baselineDate: baselineConfig?.value ?? "2026-10-06T00:00:00.000Z",
    });
  } catch (error) {
    console.error("Fetch district stats error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
