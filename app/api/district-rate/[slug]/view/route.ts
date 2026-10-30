import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBot } from "@/lib/security/bot-detection";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const userAgent = req.headers.get("user-agent");

  // Filter out web crawlers and automated bots
  if (isBot(userAgent)) {
    return NextResponse.json({ success: true, ignored: "bot" });
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // Non-blocking asynchronous update via after() / ctx.waitUntil()
  after(async () => {
    try {
      const rate = await prisma.districtRate.findFirst({
        where: {
          status: "PUBLISHED",
          slug,
        },
        select: { id: true },
      });

      if (!rate) return;

      await prisma.districtRate.update({
        where: { id: rate.id },
        data: {
          viewCountAfter: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("[view-counter] asynchronous increment error:", error);
    }
  });

  return NextResponse.json({ success: true });
}
