/**
 * Dynamic Sitemap — app/sitemap.ts
 * Step 4: SITE_URL now consistently from env variable.
 */

import { MetadataRoute } from "next";
import { fetchBloggerPosts } from "@/lib/blogger";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ergplatform.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/district-rates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/vacancies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchBloggerPosts();
    blogPages = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.85 : 0.7,
    }));
  } catch {
    console.warn("[sitemap] Could not fetch Blogger posts");
  }

  return [...staticPages, ...blogPages];
}
