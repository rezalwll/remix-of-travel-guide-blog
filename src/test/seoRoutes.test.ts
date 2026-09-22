import { describe, expect, it } from "vitest";
import { privateMetadata } from "@/seo/metadata";
import { indexableStaticRoutes, noindexExact, noindexPrefixes, routePolicies } from "@/seo/routes";
import { hotels } from "@/data/hotels";
import { seoHotelLandings } from "@/seo/content";

describe("SEO route policy", () => {
  it("keeps one authoritative policy per path", () => {
    expect(new Set(routePolicies.map((route) => route.path)).size).toBe(routePolicies.length);
    expect(indexableStaticRoutes.every((route) => route.indexable && route.sitemap)).toBe(true);
  });

  it("does not emit a public canonical for private pages", () => {
    const metadata = privateMetadata("حساب کاربری");
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeUndefined();
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("keeps search and transactional prefixes out of the index", () => {
    expect(noindexExact).toContain("/flights/search");
    expect(noindexPrefixes).toContain("/checkout");
  });

  it("prevents hotel SEO and detail slug collisions", () => {
    const detailSlugs = new Set(hotels.map((hotel) => hotel.slug));
    expect(seoHotelLandings.filter((landing) => detailSlugs.has(landing.slug))).toEqual([]);
  });
});
