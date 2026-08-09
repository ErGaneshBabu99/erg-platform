"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires on every page view across the whole site (homepage, blog,
 * district pages, everything) -- not deduplicated per session. This
 * is intentionally a true total-pageview counter so "Total views"
 * stays a meaningful superset of "Total downloads" (every download
 * implies at least one page view, plus all other browsing).
 */
export function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track-visit", { method: "POST", keepalive: true }).catch(() => {
      // decorative only, safe to ignore failures
    });
  }, [pathname]);

  return null;
}