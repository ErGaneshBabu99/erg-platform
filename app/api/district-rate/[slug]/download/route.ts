import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    // Lookup district rate by id or slug
    const rate = await prisma.districtRate.findFirst({
      where: {
        OR: [{ id: slug }, { slug: slug }],
      },
      select: { id: true },
    });

    if (!rate) {
      return NextResponse.json({ error: "District rate not found" }, { status: 404 });
    }

    // Atomically increment download counters in PostgreSQL
    const updated = await prisma.districtRate.update({
      where: { id: rate.id },
      data: {
        downloadCount: { increment: 1 },
        downloadCountAfter: { increment: 1 },
      },
      select: {
        id: true,
        downloadCount: true,
        viewCount: true,
        downloadCountAfter: true,
        viewCountAfter: true,
      },
    });

    const totalDownloads =
      (updated.downloadCount ?? 0) +
      (updated.viewCount ?? 0) +
      (updated.downloadCountAfter ?? 0) +
      (updated.viewCountAfter ?? 0);

    // Non-blocking download log entry
    try {
      const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
      const userAgent = req.headers.get("user-agent") ?? undefined;
      const referer = req.headers.get("referer") ?? undefined;
      prisma.download
        .create({
          data: { districtRateId: rate.id, ipAddress: ip, userAgent, referer },
        })
        .catch(() => {});
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      totalDownloads,
    });
  } catch (error) {
    console.error("Download tracking error:", error);
    return NextResponse.json({ error: "Failed to record download" }, { status: 500 });
  }
}
