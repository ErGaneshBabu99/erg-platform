/**
 * analytics.ts — Client-side analytics helper
 * Call these functions to track custom events.
 *
 * Usage:
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent("blog_read", { title: post.title, category: post.category });
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Track a custom GA4 event.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

/**
 * Pre-built event helpers for common actions on this platform.
 */
export const analytics = {
  /** User clicks to read a blog article */
  blogRead: (title: string, category: string) =>
    trackEvent("blog_read", { title, category }),

  /** User uses blog search */
  blogSearch: (query: string) =>
    trackEvent("blog_search", { query }),

  /** User clicks a category filter */
  categoryFilter: (category: string) =>
    trackEvent("category_filter", { category }),

  /** User submits the contact form */
  contactSubmit: () =>
    trackEvent("contact_form_submit"),

  /** User clicks Load More on blog */
  loadMore: (page: number) =>
    trackEvent("load_more", { page }),

  /** User views district rates */
  districtRateView: (district: string) =>
    trackEvent("district_rate_view", { district }),
};
