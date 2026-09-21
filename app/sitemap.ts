import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/seo/metadata";
import { seoArticles, seoDestinations, seoHotelLandings, seoRoutes } from "@/seo/content";

const staticPages = ["/", "/destinations", "/blog", "/flights", "/hotels", "/tours", "/ziyarat", "/visa", "/insurance", "/cip", "/transfer", "/fast-track", "/esim", "/city-tours", "/about", "/contact", "/terms", "/privacy", "/refund-policy", "/licenses", "/business-travel", "/club", "/travel-preparation", "/support"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages.map((url) => ({ url: absoluteUrl(url), changeFrequency: url === "/" ? "daily" as const : "monthly" as const, priority: url === "/" ? 1 : 0.6 })),
    ...seoDestinations.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/destinations/${item.countrySlug}/${item.citySlug}`), lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...seoRoutes.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/flights/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...seoHotelLandings.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/hotels/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.75 })),
    ...seoArticles.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/blog/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65 })),
  ];
}
