import type { Metadata, Viewport } from "next";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";
import { Providers } from "./providers";
import {
  SITE_URL,
  SITE_NAME_FULL,
  DEFAULT_ROBOTS,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060d16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ER G Platform | District Rate Nepal",
    template: "%s | ER G Platform",
  },
  description:
    "Nepal's most comprehensive district rate database. Download official district rates for all 77 districts as free PDF. Updated for fiscal year 2083/84.",
  keywords: [
    "district rate nepal",
    "district rate pdf nepal",
    "jilla dar rate nepal",
    "जिल्ला दररेट",
    "जिल्ला दर रेट",
    "construction district rate nepal",
    "district rate all 77 districts",
    "district rate 2083-84",
    "engineering hub nepal",
  ],
  authors: [{ name: SITE_NAME_FULL }],
  creator: "Ganesh Chapagain",
  publisher: SITE_NAME_FULL,
  robots: DEFAULT_ROBOTS,
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: SITE_URL,
    siteName: SITE_NAME_FULL,
    title: "ER G Platform | District Rate Nepal",
    description:
      "Download official district rates for all 77 districts of Nepal. Free PDF downloads, searchable database, updated 2083/84.",
    ...(DEFAULT_OG_IMAGE
      ? {
          images: [
            {
              url: DEFAULT_OG_IMAGE,
              width: 1200,
              height: 630,
              alt: SITE_NAME_FULL,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "ER G Platform | District Rate Nepal",
    description:
      "Nepal's district rate database. Free PDF downloads for all 77 districts. Updated 2083/84.",
    ...(DEFAULT_OG_IMAGE ? { images: [DEFAULT_OG_IMAGE] } : {}),
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

// ---------------------------------------------------------------------------
// Organisation JSON-LD
// Optional fields are omitted when their env var is undefined or empty.
// ---------------------------------------------------------------------------
function buildOrganisationSchema() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME_FULL,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Kathmandu",
    },
    ...(phone ? {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "customer service",
        areaServed: "NP",
        availableLanguage: ["Nepali", "English"],
      },
    } : {}),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganisationSchema()),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}