import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://erg.com.np";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const districtRates = await prisma.districtRate.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/district-rate`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const districtPages: MetadataRoute.Sitemap = districtRates.map((rate: { slug: string; updatedAt: Date }) => ({
    url: `${siteUrl}/district-rate/${rate.slug}`,
    lastModified: rate.updatedAt,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticPages, ...districtPages];
}
