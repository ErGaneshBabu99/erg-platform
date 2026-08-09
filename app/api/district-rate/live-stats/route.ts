import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const agg = await prisma.districtRate.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { downloadCount: true, viewCount: true },
  });

  const combined = (agg._sum.downloadCount ?? 0) + (agg._sum.viewCount ?? 0);
  return NextResponse.json({ downloads: combined });
}