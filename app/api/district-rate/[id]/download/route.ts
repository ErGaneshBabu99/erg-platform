import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadRateLimit } from "@/lib/security/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const limitResult = downloadRateLimit(req);
  if (limitResult) return limitResult;

  try {
    const { id } = await params;

    const rate = await prisma.districtRate.findUnique({
      where: { id, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!rate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const referer = req.headers.get("referer") ?? undefined;

    await Promise.all([
      prisma.download.create({
        data: { districtRateId: id, ipAddress: ip, userAgent, referer },
      }),
      prisma.districtRate.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Download tracking error:", error);
    return NextResponse.json({ success: true });
  }
}
