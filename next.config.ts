import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [
      "files.erg.com.np",
      // Add R2 domain here
    ],
  },

  // Strict mode for better development
  reactStrictMode: true,

  // Bundle analyzer (enable via ANALYZE=true)
  ...(process.env.ANALYZE === "true" && {
    // @ts-ignore
    bundleAnalyzer: { enabled: true },
  }),

  // Redirects for old URLs
  async redirects() {
    return [];
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
