export const seoPageTypes = [
  "DESTINATION",
  "COUNTRY",
  "CITY",
  "FLIGHT_ROUTE",
  "HOTEL_CITY",
  "TOUR_DESTINATION",
  "VISA_COUNTRY",
  "AIRPORT_GUIDE",
  "TRAVEL_GUIDE",
  "BLOG_ARTICLE",
  "SERVICE",
  "STATIC_INFO",
] as const;

export type SeoPageType = (typeof seoPageTypes)[number];
export type SeoVolatility = "low" | "medium" | "high";

export type SeoSource = {
  label: string;
  url: string;
  publisher: string;
  checkedAt: string;
  official: boolean;
};

export type SeoContentRecord = {
  pageType: SeoPageType;
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: string[];
  internalLinks: string[];
  indexable: boolean;
  sitemap: boolean;
  canonical: string;
  updatedAt: string;
  reviewedAt: string;
  volatility: SeoVolatility;
  sources: SeoSource[];
};

export type SeoPagePolicy = {
  minimumSections: number;
  minimumIntroLength: number;
  schema: readonly string[];
  freshnessDays: number;
  sourceRequired: boolean;
};

export const seoPagePolicies: Record<SeoPageType, SeoPagePolicy> = {
  DESTINATION: { minimumSections: 3, minimumIntroLength: 90, schema: ["BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
  COUNTRY: { minimumSections: 3, minimumIntroLength: 90, schema: ["BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
  CITY: { minimumSections: 3, minimumIntroLength: 90, schema: ["BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
  FLIGHT_ROUTE: { minimumSections: 4, minimumIntroLength: 90, schema: ["BreadcrumbList", "FAQPage"], freshnessDays: 180, sourceRequired: false },
  HOTEL_CITY: { minimumSections: 3, minimumIntroLength: 90, schema: ["BreadcrumbList"], freshnessDays: 180, sourceRequired: false },
  TOUR_DESTINATION: { minimumSections: 3, minimumIntroLength: 90, schema: ["BreadcrumbList"], freshnessDays: 180, sourceRequired: false },
  VISA_COUNTRY: { minimumSections: 4, minimumIntroLength: 100, schema: ["BreadcrumbList"], freshnessDays: 30, sourceRequired: true },
  AIRPORT_GUIDE: { minimumSections: 4, minimumIntroLength: 100, schema: ["BreadcrumbList"], freshnessDays: 90, sourceRequired: true },
  TRAVEL_GUIDE: { minimumSections: 3, minimumIntroLength: 100, schema: ["Article", "BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
  BLOG_ARTICLE: { minimumSections: 3, minimumIntroLength: 80, schema: ["BlogPosting", "BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
  SERVICE: { minimumSections: 3, minimumIntroLength: 80, schema: ["BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
  STATIC_INFO: { minimumSections: 2, minimumIntroLength: 60, schema: ["BreadcrumbList"], freshnessDays: 365, sourceRequired: false },
};

export const isSeoPageType = (value: string): value is SeoPageType => seoPageTypes.includes(value as SeoPageType);
