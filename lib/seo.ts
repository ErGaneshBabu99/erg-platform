/**
 * lib/seo.ts
 * Central SEO utility for ER G Platform.
 *
 * Rules:
 * - SITE_URL is the single source of truth for the domain.
 * - DEFAULT_OG_IMAGE is undefined until /public/og-image.png exists.
 *   Once the file is added, update OG_IMAGE_PATH below — no other file needs changing.
 * - buildMetadata() is the only way metadata is constructed across the project.
 * - Never emit empty, undefined, or malformed keyword strings.
 */

import type { Metadata } from "next";
// ---------------------------------------------------------------------------
// Core constants
// ---------------------------------------------------------------------------
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.erganesh.com.np";

export const SITE_NAME = "ER G Platform";
export const SITE_NAME_FULL = "ER G – Engineering Hub Nepal";

/**
 * Set this to "/og-image.png" once the file exists at /public/og-image.png.
 * Until then, keep as undefined — no broken og:image tag will be emitted.
 * Design specification is at the bottom of this file.
 */
const OG_IMAGE_PATH = "/og-image.png";

export const DEFAULT_OG_IMAGE: string | undefined = OG_IMAGE_PATH
  ? `${SITE_URL}${OG_IMAGE_PATH}`
  : undefined;

// ---------------------------------------------------------------------------
// Robots — single definition reused by layout.tsx and every page
// ---------------------------------------------------------------------------
export const DEFAULT_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
};

// ---------------------------------------------------------------------------
// Canonical URL helper
// Always returns an absolute URL.
// ---------------------------------------------------------------------------
export function canonicalUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

// ---------------------------------------------------------------------------
// Keyword sanitiser
// Removes empty strings, trims whitespace, deduplicates.
// ---------------------------------------------------------------------------
function sanitiseKeywords(keywords: (string | undefined | null)[]): string[] {
  return [
    ...new Set(
      keywords
        .map((k) => k?.trim())
        .filter((k): k is string => typeof k === "string" && k.length > 0)
    ),
  ];
}

// ---------------------------------------------------------------------------
// buildMetadata()
// Single function for all page metadata. Extend options here for future modules.
// ---------------------------------------------------------------------------
export interface BuildMetadataOptions {
  title: string;
  description: string;
  keywords?: (string | undefined | null)[];
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;           // page-specific override; falls back to DEFAULT_OG_IMAGE
  publishedTime?: string;     // ISO date — article pages only
  noIndex?: boolean;
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    path,
    ogType = "website",
    ogImage,
    publishedTime,
    noIndex = false,
  } = options;

  const url = canonicalUrl(path);
  const resolvedImage = ogImage ?? DEFAULT_OG_IMAGE;
  const cleanKeywords = sanitiseKeywords(keywords);

  return {
    title,
    description,
    ...(cleanKeywords.length > 0 ? { keywords: cleanKeywords } : {}),
    robots: noIndex ? NOINDEX_ROBOTS : DEFAULT_ROBOTS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME_FULL,
      locale: "en_NP",
      type: ogType,
      ...(publishedTime ? { publishedTime } : {}),
      ...(resolvedImage
        ? {
            images: [
              {
                url: resolvedImage,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// buildDistrictKeywords()
// Generates a full, deduplicated keyword set for any district rate page.
// Nepali keywords are included only when nameNp is a non-empty string.
// ---------------------------------------------------------------------------
export function buildDistrictKeywords(
  districtName: string,
  fiscalYear: string,
  provinceName: string,
  nameNp?: string | null
): string[] {
  const d = districtName;
  const dLower = d.toLowerCase();
  const fy = fiscalYear;
  const p = provinceName.toLowerCase();

  const english: string[] = [
    `district rate of ${dLower}`,
    `${dLower} district rate`,
    `${dLower} district rate ${fy}`,
    `${dLower} district rate pdf`,
    `${dLower} jilla dar rate`,
    `district rate ${dLower} ${fy}`,
    `${dLower} construction rate`,
    `${dLower} schedule of rates`,
    `${dLower} cost estimation`,
    `${dLower} BOQ rate`,
    `district rate ${p} nepal`,
    `district rate nepal pdf download`,
    `official district rate nepal`,
  ];

  const nepali: string[] =
    nameNp && nameNp.trim().length > 0
      ? [
          `जिल्ला दररेट ${nameNp}`,
          `जिल्ला दर रेट ${nameNp}`,
          `${nameNp} जिल्ला दररेट`,
          `${nameNp} जिल्ला दर`,
          `जिल्ला दररेट PDF ${nameNp}`,
        ]
      : [];

  return sanitiseKeywords([...english, ...nepali]);
}

/*
 * ---------------------------------------------------------------------------
 * OG IMAGE DESIGN SPECIFICATION
 * ---------------------------------------------------------------------------
 * File location : /public/og-image.png
 * Dimensions    : 1200 × 630 px
 * Format        : PNG (no transparency)
 *
 * Layout:
 *   Background  : Navy gradient — #0A1628 (top-left) → #1E3A5F (bottom-right)
 *   Logo        : Top-left — "ER G" wordmark in white, ~48px Plus Jakarta Sans Bold
 *   Tagline     : Below logo — "Engineering Hub Nepal" in gold (#C9A84C), ~20px
 *   Headline    : Centre — "District Rate Database" in white, ~56px Bold
 *   Sub-line    : Below headline — "All 77 Districts · Free PDF Download · Nepal"
 *                 in light blue (#93C5FD), ~24px
 *   Bottom bar  : Full-width gold (#C9A84C) strip, 6px tall, pinned to bottom
 *   URL         : Bottom-right corner — "erganesh.com.np" in white/60, ~16px
 *
 * Once the file exists, change OG_IMAGE_PATH above to "/og-image.png".
 * No other file in the project needs changing.
 * ---------------------------------------------------------------------------
 */