import type { MetadataRoute } from "next";
import { siteUrl } from "@/seo/metadata";
import { noindexExact, noindexPrefixes } from "@/seo/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: [...noindexPrefixes, ...noindexExact, "/visa/*/apply"],
    }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
