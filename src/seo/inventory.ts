import { seoAirportGuides, seoArticles, seoDestinations, seoHotelLandings, seoRoutes, seoTourLandings } from "./content";
import type { SeoContentRecord } from "./taxonomy";
import { auditSeoRecord } from "./quality";

const noSources = [];

export const seoContentInventory: SeoContentRecord[] = [
  ...seoDestinations.map((item): SeoContentRecord => {
    const path = `/destinations/${item.countrySlug}/${item.citySlug}`;
    return {
      pageType: "DESTINATION", path, canonical: path, title: item.title, description: item.description, h1: item.title,
      intro: item.summary, sections: [item.bestTime, item.transportNotes, item.highlights.join("، ")],
      internalLinks: [
        ...item.relatedRoutes.map((slug) => `/flights/${slug}`),
        ...item.relatedHotels.map((slug) => `/hotels/${slug}`),
        ...item.relatedArticles.map((slug) => `/blog/${slug}`),
        ...seoTourLandings.filter((tour) => tour.relatedDestination === path).map((tour) => `/tours/${tour.slug}`),
        "/destinations",
      ],
      indexable: item.indexable, sitemap: item.indexable, updatedAt: item.updatedAt, reviewedAt: item.updatedAt, volatility: "low", sources: noSources,
    };
  }),
  ...seoRoutes.map((item): SeoContentRecord => {
    const path = `/flights/${item.slug}`;
    return {
      pageType: "FLIGHT_ROUTE", path, canonical: path, title: item.title, description: item.description, h1: item.title,
      intro: item.summary, sections: [item.duration, item.originAirport, item.destinationAirport, item.baggageGuidance, item.refundGuidance, item.destinationGuide],
      internalLinks: [item.destinationPath, ...(item.relatedHotelCity ? [`/hotels/${item.relatedHotelCity}`] : []), ...(item.relatedAirports ?? []).map((slug) => `/airports/${slug}`), ...item.relatedRoutes.map((slug) => `/flights/${slug}`)],
      indexable: item.indexable, sitemap: item.indexable, updatedAt: item.updatedAt, reviewedAt: item.updatedAt, volatility: "medium", sources: noSources,
    };
  }),
  ...seoHotelLandings.map((item): SeoContentRecord => {
    const path = `/hotels/${item.slug}`;
    return {
      pageType: "HOTEL_CITY", path, canonical: path, title: item.title, description: item.description, h1: item.title,
      intro: item.summary, sections: [item.neighborhoods.join("، "), ...item.tips], internalLinks: [item.destinationPath, "/hotels"],
      indexable: item.indexable, sitemap: item.indexable, updatedAt: item.updatedAt, reviewedAt: item.updatedAt, volatility: "medium", sources: noSources,
    };
  }),
  ...seoTourLandings.map((item): SeoContentRecord => {
    const path = `/tours/${item.slug}`;
    return {
      pageType: "TOUR_DESTINATION", path, canonical: path, title: item.title, description: item.description, h1: item.title,
      intro: item.summary, sections: item.planningNotes, internalLinks: [item.relatedDestination, item.relatedFlight ? `/flights/${item.relatedFlight}` : "/flights", "/tours"],
      indexable: item.indexable, sitemap: item.indexable, updatedAt: item.updatedAt, reviewedAt: item.updatedAt, volatility: "medium", sources: noSources,
    };
  }),
  ...seoAirportGuides.map((item): SeoContentRecord => {
    const path = `/airports/${item.slug}`;
    return {
      pageType: "AIRPORT_GUIDE", path, canonical: path, title: item.title, description: item.description, h1: item.title,
      intro: item.summary, sections: [item.access, item.terminals, ...item.beforeDeparture], internalLinks: [item.relatedDestination, ...item.relatedFlights.map((slug) => `/flights/${slug}`)],
      indexable: item.indexable, sitemap: item.indexable, updatedAt: item.updatedAt, reviewedAt: item.reviewedAt, volatility: "high", sources: item.sources,
    };
  }),
  ...seoArticles.map((item): SeoContentRecord => {
    const path = `/blog/${item.slug}`;
    return {
      pageType: "BLOG_ARTICLE", path, canonical: path, title: item.title, description: item.description, h1: item.title,
      intro: item.body[0] ?? "", sections: item.body, internalLinks: [item.relatedDestination ?? "/destinations", "/blog"],
      indexable: item.indexable, sitemap: item.indexable, updatedAt: item.updatedAt, reviewedAt: item.updatedAt, volatility: "low", sources: noSources,
    };
  }),
];

export const seoRecordByPath = new Map(seoContentInventory.map((record) => [record.path, record]));
export const isIndexableSeoPath = (path: string) => {
  const record = seoRecordByPath.get(path);
  return Boolean(record?.indexable && auditSeoRecord(record).pass);
};
