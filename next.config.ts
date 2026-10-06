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

  // Redirects for old URLs (permanent: true emits 308/301 for search engines)
  async redirects() {
    // 25 Batch 1 districts migrating from -2083-84 to -2083-2084
    const batch1Districts = [
      "kathmandu", "lalitpur", "bhaktapur", "kaski", "morang",
      "chitwan", "rupendehi", "jhapa", "sunsari", "kavrepalanchok",
      "makwanpur", "dhanusha", "parsa", "banke", "dang",
      "kailali", "kanchanpur", "gorkha", "tanahun", "palpa",
      "syangja", "nuwakot", "dhading", "ilam", "surkhet",
    ];

    return batch1Districts.map((district) => ({
      source: `/district-rate/${district}-2083-84`,
      destination: `/district-rate/${district}-2083-2084`,
      permanent: true,
    }));
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
