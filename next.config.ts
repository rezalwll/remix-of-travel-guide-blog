import type { NextConfig } from "next";
import { mockFlights } from "./src/data/flights";

const apiInternalUrl = process.env.API_INTERNAL_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86_400,
  },
  async headers() {
    const noStore = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];
    return [
      ...["/account/:path*", "/auth/:path*", "/checkout/:path*", "/orders/:path*", "/track-order", "/flights/search", "/hotels/search", "/trains/search", "/buses/search", "/visa/:country/apply"].map((source) => ({ source, headers: noStore })),
    ];
  },
  async redirects() {
    return [
      ...mockFlights.map((flight) => ({ source: `/flights/${flight.id}`, destination: `/flights/search?from=${flight.fromCode}&to=${flight.toCode}&adults=1&trip=oneway`, permanent: true })),
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
