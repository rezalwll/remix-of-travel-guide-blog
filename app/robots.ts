import type { MetadataRoute } from "next";
import { siteUrl } from "@/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/auth/", "/checkout/", "/orders/", "/track-order", "/api/", "/flights/search", "/hotels/search", "/trains/search", "/buses/search", "/visa/*/apply"],
    }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
