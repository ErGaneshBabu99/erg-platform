import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import {
  resolveDateRange,
  getAnalyticsSummary,
  getDailyViews,
  getTopPages,
  getTopDistrictRates,
  type DateRangeKey,
} from "@/lib/analytics-server";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AnalyticsViewsChart } from "@/components/admin/analytics-views-chart";

export const metadata: Metadata = { title: "Analytics – Er G Admin" };
export const dynamic = "force-dynamic";

async function getLegacyAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [topSearched, searchCount] = await Promise.all([
    prisma.searchLog.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
    prisma.searchLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);
  return { topSearched, searchCount };
}

interface PageProps {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rangeKey = (params.range as DateRangeKey) || "28d";
  const range = resolveDateRange(rangeKey, params.from, params.to);

  const [summary, dailyViews, topPages, topDistrictRates, legacy] = await Promise.all([
    getAnalyticsSummary(range),
    getDailyViews(range),
    getTopPages(range),
    getTopDistrictRates(),
    getLegacyAnalytics(),
  ]);

  const statCards = [
    { label: "Total Views", value: summary.totalViews },
    { label: "Unique Visitors", value: summary.uniqueVisitors },
    { label: "PDF Downloads", value: summary.totalDownloads },
    { label: "Report Checks", value: summary.reportChecks },
    { label: "District Rate Views", value: summary.districtViews },
    { label: "Blog Views", value: summary.blogViews },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <DateRangeFilter current={rangeKey} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card-base p-5">
            <div className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-1">
              {formatNumber(s.value)}
            </div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-base p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Views over time</h2>
        <AnalyticsViewsChart data={dailyViews} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Pages</h2>
          <div className="space-y-2">
            {topPages.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3 py-1">
                <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{p.path}</span>
                <span className="text-sm font-semibold text-gray-500">{formatNumber(p.views)}</span>
              </div>
            ))}
            {topPages.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>}
          </div>
        </div>

        <div className="card-base p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top District Rates (all-time)</h2>
          <div className="space-y-3">
            {topDistrictRates.map((rate, i) => (
              <div key={rate.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {rate.district.name}
                    </span>
                    <span className="text-xs text-gray-400">{rate.fiscalYear.year}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-navy-600 rounded-full"
                      style={{
                        width: `${(rate.viewCount / (topDistrictRates[0]?.viewCount || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-navy-600 w-10 text-right">
                  {formatNumber(rate.viewCount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-base p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">
          Top Searches <span className="text-sm font-normal text-gray-400">({formatNumber(legacy.searchCount)} in last 30d)</span>
        </h2>
        <div className="space-y-2">
          {legacy.topSearched.map((s, i) => (
            <div key={s.query} className="flex items-center gap-3 py-1">
              <span className="text-sm text-gray-400 w-5">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{s.query}</span>
              <span className="text-sm font-semibold text-gray-500">{s._count.query}×</span>
            </div>
          ))}
          {legacy.topSearched.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
