import type { NextConfig } from "next";

const apiInternalUrl = process.env.API_INTERNAL_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86_400,
  },
  async redirects() {
    return [
      { source: "/help", destination: "/support", permanent: true },
      { source: "/faq", destination: "/support", permanent: true },
      { source: "/order-tracking", destination: "/track-order", permanent: true },
      { source: "/transfers", destination: "/transfer", permanent: true },
      { source: "/experiences", destination: "/city-tours", permanent: true },
      { source: "/travel-checklist", destination: "/travel-preparation", permanent: true },
      { source: "/article/:articleId", destination: "/blog/:articleId", permanent: true },
    ];
  },
  async rewrites() {
    if (!apiInternalUrl) return [];
    return [
      { source: "/api/:path*", destination: `${apiInternalUrl}/api/:path*` },
      { source: "/health/:path*", destination: `${apiInternalUrl}/health/:path*` },
    ];
  },
};

export default nextConfig;
