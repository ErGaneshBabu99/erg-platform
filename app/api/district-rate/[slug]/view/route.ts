import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const rate = await prisma.districtRate.findFirst({
      where: {
        status: "PUBLISHED",
        slug,
      },
      select: { id: true },
    });

    if (!rate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Atomically increment genuine view counter in PostgreSQL (preserves frozen baseline)
    await prisma.districtRate.update({
      where: { id: rate.id },
      data: {
        viewCountAfter: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ success: true }); // Return 200 so background tracking never disrupts UI
  }
}
