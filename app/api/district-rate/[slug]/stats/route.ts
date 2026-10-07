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

    const rate = await prisma.districtRate.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ slug }, { slug: legacySlug }],
      },
      select: {
        id: true,
        downloadCount: true,
        viewCount: true,
        downloadCountAfter: true,
        viewCountAfter: true,
      },
    });

    if (!rate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const directDownloads = (rate.downloadCount ?? 0) + (rate.downloadCountAfter ?? 0);
    const views = (rate.viewCount ?? 0) + (rate.viewCountAfter ?? 0);
    const totalDownloads = directDownloads + views;

    return NextResponse.json({
      totalDownloads,
      downloads: directDownloads,
      views,
    });
  } catch (error) {
    console.error("Fetch district stats error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
