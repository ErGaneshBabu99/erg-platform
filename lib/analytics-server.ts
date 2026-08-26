import { prisma } from "@/lib/prisma";

export type DateRangeKey = "today" | "7d" | "28d" | "90d" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  key: DateRangeKey;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Resolves a range key (or explicit from/to for "custom") into concrete
 * Date boundaries. "today" starts at local midnight; the others are
 * rolling N-day windows ending now, matching the YouTube Studio convention.
 */
export function resolveDateRange(
  key: DateRangeKey,
  customFrom?: string | null,
  customTo?: string | null
): DateRange {
  const now = new Date();

  if (key === "custom" && customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    return { from, to, key };
  }

  if (key === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return { from, to: now, key };
  }

  const days = key === "7d" ? 7 : key === "90d" ? 90 : 28;
  return { from: new Date(now.getTime() - days * DAY_MS), to: now, key };
}

/** Top-level stat cards: total views, unique visitors, downloads, report checks. */
export async function getAnalyticsSummary(range: DateRange) {
  const where = { createdAt: { gte: range.from, lte: range.to } };

  const [totalViews, uniqueVisitorRows, totalDownloads, reportChecks, blogViews, districtViews] =
    await Promise.all([
      prisma.pageView.count({ where }),
      prisma.pageView.findMany({ where, select: { visitorId: true }, distinct: ["visitorId"] }),
      prisma.download.count({ where }),
      prisma.reportCheckUsage.count({ where }),
      prisma.pageView.count({ where: { ...where, path: { startsWith: "/blog" } } }),
      prisma.pageView.count({ where: { ...where, path: { startsWith: "/district-rate" } } }),
    ]);

  return {
    totalViews,
    uniqueVisitors: uniqueVisitorRows.length,
    totalDownloads,
    reportChecks,
    blogViews,
    districtViews,
  };
}

/**
 * Daily view counts across the range, for the line chart. Grouped in JS
 * (not SQL GROUP BY on a date-truncated column) to keep this portable
 * across the Postgres setup without raw SQL — fine at current traffic
 * volume; revisit with a raw query if PageView grows very large.
 */
export async function getDailyViews(range: DateRange) {
  const rows = await prisma.pageView.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  // Fill in zero-count days so the chart doesn't skip gaps.
  const days: { date: string; views: number }[] = [];
  const cursor = new Date(range.from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(range.to);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: key, views: buckets.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export async function getTopPages(range: DateRange, take = 10) {
  const rows = await prisma.pageView.groupBy({
    by: ["path"],
    where: { createdAt: { gte: range.from, lte: range.to } },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take,
  });
  return rows.map((r) => ({ path: r.path, views: r._count.path }));
}

export async function getTopDistrictRates(take = 10) {
  // Uses the existing cumulative viewCount on DistrictRate — this is
  // all-time (not scoped to the selected date range), same as it was
  // before this dashboard existed. A range-scoped version would need
  // PageView paths matched back to district slugs, which we can add
  // later if needed.
  return prisma.districtRate.findMany({
    orderBy: { viewCount: "desc" },
    take,
    where: { status: "PUBLISHED" },
    include: { district: { select: { name: true } }, fiscalYear: { select: { year: true } } },
  });
}
