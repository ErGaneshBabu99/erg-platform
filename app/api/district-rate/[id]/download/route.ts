import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Atomically increment download counters in PostgreSQL
    const updated = await prisma.districtRate.update({
      where: { id },
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
          data: { districtRateId: id, ipAddress: ip, userAgent, referer },
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
