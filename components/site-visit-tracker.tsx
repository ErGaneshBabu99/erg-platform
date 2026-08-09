"use client";

import { useEffect } from "react";

const COOKIE_NAME = "erg_visit_counted";
const COOKIE_MAX_AGE_SECONDS = 30 * 60; // 30 minutes

function hasVisitCookie(): boolean {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

function setVisitCookie() {
  document.cookie = `${COOKIE_NAME}=1; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
}

/**
 * Fires once per ~30-minute window (per browser) to increment the
 * site-wide visit counter. Mounted once in the root layout.
 */
export function SiteVisitTracker() {
  useEffect(() => {
    if (hasVisitCookie()) return;
    setVisitCookie();
    fetch("/api/track-visit", { method: "POST", keepalive: true }).catch(() => {
      // decorative only, safe to ignore failures
    });
  }, []);

  return null;
}
