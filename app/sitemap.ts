import { MetadataRoute } from "next";
import { fetchBloggerPosts } from "@/lib/blogger";
import { prisma } from "@/lib/prisma";
import { getCanonicalRateSlug } from "@/lib/slug-migration";
import { ALL_77_DISTRICTS } from "@/lib/district-nepali-names";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.erganesh.com.np";

// Revalidate sitemap cache every hour
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Static routes configuration
// Add new static pages here — sitemap entries are generated automatically.
// lastModified is omitted for static pages where the real date is unknown.
// ---------------------------------------------------------------------------
interface StaticRoute {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: "",              changeFrequency: "daily",   priority: 1.0 },
  { path: "/district-rate", changeFrequency: "daily",   priority: 0.9 },
  { path: "/blog",          changeFrequency: "daily",   priority: 0.6 },
  { path: "/about",         changeFrequency: "yearly",  priority: 0.4 },
  { path: "/contact",       changeFrequency: "yearly",  priority: 0.4 },
  { path: "/privacy",       changeFrequency: "yearly",  priority: 0.2 },
  { path: "/terms",         changeFrequency: "yearly",  priority: 0.2 },
];

// ---------------------------------------------------------------------------
// Future: Province pages — e.g. /province/bagmati
// Implement when province routes exist.
// ---------------------------------------------------------------------------
async function getProvincePages(): Promise<MetadataRoute.Sitemap> {
  return [];
}

// ---------------------------------------------------------------------------
// Future: Fiscal year pages — e.g. /fiscal-year/2083-84
// Implement when fiscal year routes exist.
// ---------------------------------------------------------------------------
async function getFiscalYearPages(): Promise<MetadataRoute.Sitemap> {
  return [];
}

// ---------------------------------------------------------------------------
// District rate dynamic pages
// Highest-value SEO pages on the platform.
// lastModified pulled from DB so Google sees real change signals.
// ---------------------------------------------------------------------------
async function getDistrictPages(): Promise<MetadataRoute.Sitemap> {
  const fallbackDate = new Date("2026-10-06T00:00:00.000Z");
  const fallbackList: MetadataRoute.Sitemap = ALL_77_DISTRICTS.map((d) => ({
    url: `${SITE_URL}/district-rate/${getCanonicalRateSlug(d.slug, "2083-84")}`,
    lastModified: fallbackDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  try {
    const rates = await prisma.districtRate.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        district: { select: { slug: true } },
        fiscalYear: { select: { year: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!rates || rates.length === 0) {
      return fallbackList;
    }

    return rates.map((rate) => {
      const districtSlug = rate.district?.slug ?? rate.slug.replace(/-\d{4}-\d{2,4}$/, "");
      const fyYear = rate.fiscalYear?.year ?? "2083-84";
      const canonicalSlug = getCanonicalRateSlug(districtSlug, fyYear);
      const isCurrentYear = fyYear === "2083-84" || fyYear === "2083-2084";

      return {
        url: `${SITE_URL}/district-rate/${canonicalSlug}`,
        lastModified: rate.updatedAt,
        changeFrequency: isCurrentYear ? ("weekly" as const) : ("monthly" as const),
        priority: isCurrentYear ? 0.9 : 0.7,
      };
    });
  } catch (error) {
    console.warn("[sitemap] Could not fetch district rates from DB, using 77 static fallback:", error);
    return fallbackList;
  }
}

// ---------------------------------------------------------------------------
// Blog pages (Blogger API)
// ---------------------------------------------------------------------------
async function getBlogPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await fetchBloggerPosts();

    return posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.7 : 0.6,
    }));
  } catch {
    console.warn("[sitemap] Could not fetch Blogger posts");
    return [];
  }
}

// ---------------------------------------------------------------------------
// Sitemap entry point
// ---------------------------------------------------------------------------
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [districtPages, blogPages, provincePages, fiscalYearPages] =
    await Promise.all([
      getDistrictPages(),
      getBlogPages(),
      getProvincePages(),
      getFiscalYearPages(),
    ]);

  return [
    ...staticPages,
    ...districtPages,
    ...blogPages,
    ...provincePages,
    ...fiscalYearPages,
  ];
}