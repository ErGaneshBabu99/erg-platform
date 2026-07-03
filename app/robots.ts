/**
 * robots.ts — app/robots.ts
 * Generates /robots.txt automatically.
 * Configurable via NEXT_PUBLIC_SITE_URL environment variable.
 */

import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ergplatform.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",        // admin dashboard
          "/api/",          // API routes
          "/_next/",        // Next.js internals
          "/auth/",         // auth pages
        ],
      },
      {
        // Block AI scrapers if desired — remove if you want AI indexing
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
