import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const agg = await prisma.districtRate.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { downloadCount: true },
  });

  return NextResponse.json({ downloads: agg._sum.downloadCount ?? 0 });
}