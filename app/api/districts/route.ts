import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Prevent Next.js from caching this route as fully static, while the
// in-memory cache below still keeps repeat requests cheap.
export const dynamic = "force-dynamic";

interface DistrictRow {
  name: string;
  slug: string;
  province: string;
}

// Same short-TTL in-memory cache pattern as district-suggestions — the
// district list barely ever changes, so there's no need to hit Postgres
// on every request. This route is called once per browser session by the
// client (see lib/districtCache.ts), so in practice this cache mostly
// protects against multiple tabs/users within the same 5-minute window.
let cache: { data: DistrictRow[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json({ districts: cache.data });
  }

  const districts = await prisma.district.findMany({
    select: {
      name: true,
      slug: true,
      province: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const data = districts.map((d) => ({
    name: d.name,
    slug: d.slug,
    province: d.province.name,
  }));

  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };

  return NextResponse.json({ districts: data });
}
