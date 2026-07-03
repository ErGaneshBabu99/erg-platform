/**
 * PageViewTracker — Client Component
 * Wrapped in Suspense by the parent (required in Next.js 15 for useSearchParams).
 * Tracks route changes for Google Analytics.
 *
 * Usage in app/layout.tsx:
 *   import { Suspense } from "react";
 *   import PageViewTracker from "@/components/analytics/page-view-tracker";
 *
 *   <body>
 *     <Suspense fallback={null}>
 *       <PageViewTracker />
 *     </Suspense>
 *     ...
 *   </body>
 */

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    if (!GA_ID) return;

    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    window.gtag("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}
