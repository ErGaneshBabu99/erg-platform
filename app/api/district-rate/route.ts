import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchDistrictRateSchema } from "@/lib/validations/district-rate";
import { searchRateLimit } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  const limitResult = searchRateLimit(req);
  if (limitResult) return limitResult;

  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = searchDistrictRateSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { q, province, fiscalYear, page, limit, sort } = parsed.data;
    const where: any = { status: "PUBLISHED" };

    if (q) {
      where.OR = [
        { district: { name: { contains: q, mode: "insensitive" } } },
        { district: { nameNp: { contains: q, mode: "insensitive" } } },
      ];
    }
    if (province) {
      where.district = { province: { name: { contains: province, mode: "insensitive" } } };
    }
    if (fiscalYear) {
      where.fiscalYear = { year: fiscalYear };
    }

    const orderBy: any =
      sort === "downloads" ? { downloadCount: "desc" }
      : sort === "oldest" ? { publishedAt: "asc" }
      : sort === "name" ? { district: { name: "asc" } }
      : { publishedAt: "desc" };

    const [rates, total] = await Promise.all([
      prisma.districtRate.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          district: { include: { province: { select: { name: true } } } },
          fiscalYear: { select: { year: true } },
        },
      }),
      prisma.districtRate.count({ where }),
    ]);

    // Log search
    if (q) {
      prisma.searchLog.create({
        data: {
          query: q,
          province: province ?? null,
          fiscalYear: fiscalYear ?? null,
          resultsCount: total,
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      rates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
