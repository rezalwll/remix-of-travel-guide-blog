import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/seo/metadata";
import { seoArticles, seoDestinations, seoHotelLandings, seoRoutes } from "@/seo/content";
import { indexableStaticRoutes } from "@/seo/routes";
import { continents, featuredArticles } from "@/data/destinations";
import { travelRoutes } from "@/data/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const legacyArticles = [...featuredArticles, ...continents.flatMap((continent) => continent.countries.flatMap((country) => country.articles))]
    .filter((article) => Boolean(article.content?.length));
  const entries: MetadataRoute.Sitemap = [
    ...indexableStaticRoutes.map((route) => ({ url: absoluteUrl(route.path), changeFrequency: route.changeFrequency, priority: route.priority })),
    ...continents.map((continent) => ({ url: absoluteUrl(`/destinations/${continent.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...[...new Set(seoDestinations.map((item) => item.countrySlug))].map((country) => ({ url: absoluteUrl(`/destinations/${country}`), changeFrequency: "monthly" as const, priority: 0.65 })),
    ...continents.flatMap((continent) => continent.countries.map((country) => ({ url: absoluteUrl(`/destinations/${continent.slug}/${country.slug}`), changeFrequency: "monthly" as const, priority: 0.65 }))),
    ...travelRoutes.map((route) => ({ url: absoluteUrl(`/routes/${route.id}`), changeFrequency: "monthly" as const, priority: 0.65 })),
    ...seoDestinations.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/destinations/${item.countrySlug}/${item.citySlug}`), lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...seoRoutes.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/flights/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...seoHotelLandings.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/hotels/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.75 })),
    ...seoArticles.filter((item) => item.indexable).map((item) => ({ url: absoluteUrl(`/blog/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.65 })),
    ...legacyArticles.map((item) => ({ url: absoluteUrl(`/blog/${item.id}`), lastModified: item.date, changeFrequency: "monthly" as const, priority: 0.55 })),
  ];
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
