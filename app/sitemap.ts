import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/seo/metadata";
import { indexableStaticRoutes } from "@/seo/routes";
import { continents } from "@/data/destinations";
import { seoContentInventory } from "@/seo/inventory";
import { indexableSeoRecords } from "@/seo/quality";

const priorityByType = {
  DESTINATION: 0.8,
  COUNTRY: 0.7,
  CITY: 0.75,
  FLIGHT_ROUTE: 0.8,
  HOTEL_CITY: 0.75,
  TOUR_DESTINATION: 0.7,
  VISA_COUNTRY: 0.65,
  AIRPORT_GUIDE: 0.65,
  TRAVEL_GUIDE: 0.65,
  BLOG_ARTICLE: 0.65,
  SERVICE: 0.7,
  STATIC_INFO: 0.5,
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    ...indexableStaticRoutes.map((route) => ({ url: absoluteUrl(route.path), changeFrequency: route.changeFrequency, priority: route.priority })),
    ...continents.map((continent) => ({ url: absoluteUrl(`/destinations/${continent.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...indexableSeoRecords(seoContentInventory).map((record) => ({
      url: absoluteUrl(record.path),
      lastModified: record.updatedAt,
      changeFrequency: record.volatility === "high" ? "weekly" as const : "monthly" as const,
      priority: priorityByType[record.pageType],
    })),
  ];
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
