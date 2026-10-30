import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBot } from "@/lib/security/bot-detection";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const userAgent = req.headers.get("user-agent");

  // Ignore search bots, social crawlers, and scrapers
  if (isBot(userAgent)) {
    return NextResponse.json({ success: true, ignored: "bot" });
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
  }

  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    undefined;
  const referer = req.headers.get("referer") ?? undefined;

  // Asynchronous execution via after() / ctx.waitUntil()
  // The response is returned to the client immediately without waiting for the DB write.
  after(async () => {
    try {
      const rate = await prisma.districtRate.findFirst({
        where: {
          OR: [{ id: slug }, { slug: slug }],
        },
        select: { id: true },
      });

      if (!rate) return;

      // Increment live counter without touching baseline
      await prisma.districtRate.update({
        where: { id: rate.id },
        data: {
          downloadCountAfter: { increment: 1 },
        },
      });

      // Best-effort download log
      await prisma.download.create({
        data: {
          districtRateId: rate.id,
          ipAddress: ip,
          userAgent: userAgent ?? undefined,
          referer,
        },
      });
    } catch (err) {
      // Non-blocking: database outages or connection limits must NEVER fail user downloads
      console.error("[download-counter] asynchronous increment error:", err);
    }
  });

  return NextResponse.json({ success: true });
}
