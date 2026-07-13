/**
 * robots.ts — app/robots.ts
 * Generates /robots.txt automatically.
 * Configurable via NEXT_PUBLIC_SITE_URL environment variable.
 */

import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.erganesh.com.np";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/", // admin dashboard
          "/api/",   // API routes
          "/auth/",  // auth pages
        ],
      },
          ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}