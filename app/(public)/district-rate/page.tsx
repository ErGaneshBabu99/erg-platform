import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { searchDistrictRateSchema } from "@/lib/validations/district-rate";
import { DistrictRateGrid } from "@/components/district/district-rate-grid";
import { SearchFilters } from "@/components/district/search-filters";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = buildMetadata({
  title: "District Rate of Nepal – All 77 Districts Database",
  description:
    "Search and download official district rates for all 77 districts of Nepal. Free PDF downloads. Filter by province or fiscal year. Jilla Dar Rate updated 2083/84.",
  keywords: [
    "district rate of nepal",
    "district rate all 77 districts",
    "district rate pdf nepal",
    "jilla dar rate nepal",
    "official district rate pdf",
    "जिल्ला दररेट",
    "जिल्ला दर रेट",
    "जिल्ला दररेट PDF",
    "district rate by province nepal",
    "district rate 2083 84",
    "nepal district rate database",
    "district rate free download nepal",
  ],
  path: "/district-rate",
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getDistrictRates(params: Record<string, string>) {
  const parsed = searchDistrictRateSchema.safeParse(params);
  const { q, province, fiscalYear, page, limit, sort } = parsed.success
    ? parsed.data
    : { q: "", province: "", fiscalYear: "", page: 1, limit: 12, sort: "newest" as const };

  const where: any = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { district: { name: { contains: q, mode: "insensitive" } } },
      { district: { nameNp: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (province) {
    where.district = { ...where.district, province: { name: { contains: province, mode: "insensitive" } } };
  }
  if (fiscalYear) {
    where.fiscalYear = { year: fiscalYear };
  }

  const orderBy: any =
    sort === "downloads" ? { downloadCount: "desc" }
    : sort === "oldest" ? { publishedAt: "asc" }
    : sort === "name" ? { district: { name: "asc" } }
    : { publishedAt: "desc" };

  const skip = (page - 1) * limit;

  const [rates, total] = await Promise.all([
    prisma.districtRate.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        district: { include: { province: { select: { name: true } } } },
        fiscalYear: { select: { year: true } },
      },
    }),
    prisma.districtRate.count({ where }),
  ]);

  return { rates, total, page, limit };
}

async function getFilterData() {
  const [provinces, fiscalYears] = await Promise.all([
    prisma.province.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
    prisma.fiscalYear.findMany({ orderBy: { sortOrder: "desc" }, select: { year: true } }),
  ]);
  return { provinces: provinces.map((p: { name: string }) => p.name), fiscalYears: fiscalYears.map((f: { year: string }) => f.year) };
}

export default async function DistrictRatePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const flatParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") flatParams[k] = v;
    else if (Array.isArray(v) && v.length > 0) flatParams[k] = v[0] as string;
  }

  const [{ rates, total, page, limit }, { provinces, fiscalYears }] = await Promise.all([
    getDistrictRates(flatParams),
    getFilterData(),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "District Rates", href: "/district-rate" },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-700 py-12 px-4">
        <div className="container-erg">
          <Breadcrumb items={breadcrumbs} className="mb-4 text-navy-300" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            District Rate Database
          </h1>
          <p className="text-navy-200 text-lg max-w-xl">
            Official district rates for all 77 districts of Nepal.
            Download PDF, search by province or fiscal year.
          </p>
        </div>
      </div>

      <div className="container-erg py-10">
        {/* Filters */}
        <SearchFilters
          provinces={provinces}
          fiscalYears={fiscalYears}
          currentParams={flatParams}
          total={total}
        />

        {/* Grid */}
        <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading...</div>}>
          <DistrictRateGrid
            rates={rates as any}
            total={total}
            page={page}
            limit={limit}
            currentParams={flatParams}
          />
        </Suspense>
      </div>

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "District Rate Database Nepal",
            description: "Official district rates for all 77 districts of Nepal",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/district-rate`,
          }),
        }}
      />
    </>
  );
}
