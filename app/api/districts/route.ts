import { NextResponse } from "next/server";
import { ALL_77_DISTRICTS } from "@/lib/district-nepali-names";

export const dynamic = "force-dynamic";

interface DistrictRow {
  name: string;
  slug: string;
  province: string;
}

let cache: { data: DistrictRow[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json({ districts: cache.data });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const districts = await prisma.district.findMany({
      select: {
        name: true,
        slug: true,
        province: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    if (districts && districts.length > 0) {
      const data = districts.map((d: (typeof districts)[number]) => ({
        name: d.name,
        slug: d.slug,
        province: d.province.name,
      }));

      cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return NextResponse.json({ districts: data });
    }
  } catch (error) {
    console.warn("[districts] DB error, using verified 77 static districts fallback:", error);
  }

  // Resilient fallback: all 77 districts with 200 OK so UI never breaks
  const fallbackData: DistrictRow[] = ALL_77_DISTRICTS.map((d) => ({
    name: d.name,
    slug: d.slug,
    province: d.provinceName,
  }));

  return NextResponse.json({ districts: fallbackData }, { status: 200 });
}
