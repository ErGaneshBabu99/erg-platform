import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics – Er G Admin" };
export const dynamic = "force-dynamic";

async function getAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalDownloads, downloadsLast30, topDownloaded, topSearched, searchCount] = await Promise.all([
    prisma.download.count(),
    prisma.download.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.districtRate.findMany({
      orderBy: { downloadCount: "desc" },
      take: 10,
      where: { status: "PUBLISHED" },
      include: { district: { select: { name: true } }, fiscalYear: { select: { year: true } } },
    }),
    prisma.searchLog.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
    prisma.searchLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);
  return { totalDownloads, downloadsLast30, topDownloaded, topSearched, searchCount };
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Downloads", value: formatNumber(data.totalDownloads) },
          { label: "Downloads (30d)", value: formatNumber(data.downloadsLast30) },
          { label: "Searches (30d)", value: formatNumber(data.searchCount) },
          { label: "Unique Queries", value: formatNumber(data.topSearched.length) },
        ].map((s) => (
          <div key={s.label} className="card-base p-5">
            <div className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-1">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Downloaded</h2>
          <div className="space-y-3">
            {data.topDownloaded.map((rate: any, i: number) => (
              <div key={rate.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{rate.district.name}</span>
                    <span className="text-xs text-gray-400">{rate.fiscalYear.year}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-full bg-navy-600 rounded-full" style={{ width: `${(rate.downloadCount / (data.topDownloaded[0]?.downloadCount || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-navy-600 w-10 text-right">{formatNumber(rate.downloadCount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Searches</h2>
          <div className="space-y-2">
            {data.topSearched.map((s: any, i: number) => (
              <div key={s.query} className="flex items-center gap-3 py-1">
                <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{s.query}</span>
                <span className="text-sm font-semibold text-gray-500">{s._count.query}×</span>
              </div>
            ))}
            {data.topSearched.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
