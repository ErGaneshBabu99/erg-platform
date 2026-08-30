import { prisma } from "@/lib/prisma";

const SITE_VISITS_KEY = "total_site_visits";

/**
 * Total number of site visits recorded so far (a simple, approximate
 * counter -- not a precise unique-visitor count). Stored in the
 * existing SiteConfig key/value table so no schema migration is needed.
 */
export async function getSiteVisitCount(): Promise<number> {
  const row = await prisma.siteConfig.findUnique({
    where: { key: SITE_VISITS_KEY },
  });
  return row ? parseInt(row.value, 10) || 0 : 0;
}

/**
 * Increments the site visit counter by 1 and returns the new total.
 */
export async function incrementSiteVisitCount(): Promise<number> {
  const existing = await prisma.siteConfig.findUnique({
    where: { key: SITE_VISITS_KEY },
  });
  const next = (existing ? parseInt(existing.value, 10) || 0 : 0) + 1;

  await prisma.siteConfig.upsert({
    where: { key: SITE_VISITS_KEY },
    update: { value: String(next), type: "number" },
    create: { key: SITE_VISITS_KEY, value: String(next), type: "number" },
  });

  return next;
}

/**
 * Site-wide platform stats used on both the district-rate listing page
 * and individual district detail pages: "Total downloads" (combined
 * views+downloads across all published district rates) and "Total
 * views" (total website visitors).
 */
export async function getPlatformStats() {
  const [agg, siteVisits] = await Promise.all([
    prisma.districtRate.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { downloadCount: true, viewCount: true },
    }),
    getSiteVisitCount(),
  ]);

  const districtViews = agg._sum.viewCount ?? 0;
  const districtDownloads = agg._sum.downloadCount ?? 0;

  const downloads = districtViews + districtDownloads;
  const views = downloads + districtViews + siteVisits;

  return { downloads, views };
}