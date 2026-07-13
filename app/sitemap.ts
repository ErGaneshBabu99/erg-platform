import { MetadataRoute } from "next";
import { fetchBloggerPosts } from "@/lib/blogger";
import { prisma } from "@/lib/prisma";

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
  try {
    const districts = await prisma.districtRate.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    return districts.map((d) => ({
      url: `${SITE_URL}/district-rate/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }));
  } catch {
    console.warn("[sitemap] Could not fetch district rates from DB");
    return [];
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