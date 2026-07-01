import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://erg.com.np";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060d16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Er G – Engineering Hub Nepal | District Rate Database",
    template: "%s | Er G Nepal",
  },
  description:
    "Nepal's most comprehensive engineering resource platform. Download district rates, construction cost data, and engineering resources for all 77 districts across Nepal.",
  keywords: [
    "district rate nepal",
    "district rate pdf nepal",
    "construction district rate",
    "nepal engineering hub",
    "district rate 2083-84",
    "building cost nepal",
    "engineering consultancy nepal",
  ],
  authors: [{ name: "Er G – Engineering Hub Nepal" }],
  creator: "Er G Nepal",
  publisher: "Er G Nepal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: siteUrl,
    siteName: "Er G – Engineering Hub Nepal",
    title: "Er G – Engineering Hub Nepal | District Rate Database",
    description:
      "Download district rates for all 77 districts of Nepal. Free PDF downloads, searchable database, and engineering resources.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Er G – Engineering Hub Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Er G – Engineering Hub Nepal",
    description: "Nepal's engineering resource platform. District rates, PDF downloads, engineering consultancy.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Er G – Engineering Hub Nepal",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: process.env.NEXT_PUBLIC_PHONE_NUMBER,
                contactType: "customer service",
                areaServed: "NP",
                availableLanguage: ["Nepali", "English"],
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "NP",
                addressLocality: "Kathmandu",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
