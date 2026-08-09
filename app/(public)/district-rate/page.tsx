import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { searchDistrictRateSchema } from "@/lib/validations/district-rate";
import { DistrictRateGrid } from "@/components/district/district-rate-grid";
import { SearchFilters } from "@/components/district/search-filters";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Download, Eye } from "lucide-react";
import { DownloadLiveScene } from "@/components/district-rate/download-live-scene";
import { DownloadLiveScene3D } from "@/components/district-rate/download-live-scene-3d";
import { getPlatformStats } from "@/lib/site-visits";

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

  const [{ rates, total, page, limit }, { provinces, fiscalYears }, stats] = await Promise.all([
    getDistrictRates(flatParams),
    getFilterData(),
    getPlatformStats(),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "District Rates", href: "/district-rate" },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-700 py-12 px-4 relative overflow-hidden">
        <div className="container-erg relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <Breadcrumb items={breadcrumbs} className="mb-4 text-navy-300" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              District Rate Database
            </h1>
            <p className="text-navy-200 text-lg max-w-xl">
              Official district rates for all 77 districts of Nepal.
              Download PDF, search by province or fiscal year.
            </p>
          </div>

          {/* Live platform stats */}
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 mb-3 lg:justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
                Live platform stats
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/[0.09] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none tabular-nums">
                    {stats.downloads.toLocaleString()}
                  </p>
                  <p className="text-navy-300 text-xs mt-1 whitespace-nowrap">Total downloads</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/[0.09] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-400/15 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none tabular-nums">
                    {stats.views.toLocaleString()}
                  </p>
                  <p className="text-navy-300 text-xs mt-1 whitespace-nowrap">Total views</p>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <DownloadLiveScene3D initialDownloads={stats.downloads} />
            </div>
          </div>
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