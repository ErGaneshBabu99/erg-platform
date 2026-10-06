import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLegacyLookupSlug } from "@/lib/slug-migration";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
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
      select: { id: true },
    });

    if (!rate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment viewCountAfter (without bumping updatedAt)
    await prisma.$executeRaw`
      UPDATE district_rates 
      SET "viewCountAfter" = "viewCountAfter" + 1 
      WHERE id = ${rate.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ success: true }); // Graceful 200 so clients never fail
  }
}
