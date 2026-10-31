import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance
  compress: true,
  poweredByHeader: false,

  // Image optimization - static assets served directly via Cloudflare Workers Assets
  images: {
    unoptimized: true,
  },

  // Ensure Prisma, Postgres drivers, and client-heavy packages are externalized
  // so they are never inlined into the server worker bundle.
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "pg",
    "@prisma/adapter-pg",
    "pdfjs-dist",
    "jspdf",
  ],

  // Strict mode for better development
  reactStrictMode: true,

  // ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Bundle analyzer (enable via ANALYZE=true)
  ...(process.env.ANALYZE === "true" && {
    // @ts-ignore
    bundleAnalyzer: { enabled: true },
  }),

  // URLs and internal links are written without trailing slashes
  trailingSlash: false,

  // Redirects for old/retired URLs (permanent 308/301 to avoid 404s on previously shared links)
  async redirects() {
    return [
      {
        source: "/district-rate/:slug([\\w-]+)-2083-2084",
        destination: "/district-rate/:slug-2083-84",
        permanent: true,
      },
    ];
  },

  // Headers (additional security)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
