import { describe, expect, it } from "vitest";
import { seoAuditManifest } from "@/seo/audit-manifest";
import { routePolicies } from "@/seo/routes";

describe("route parity manifest", () => {
  it("classifies every priority route as native", () => {
    const nativePolicies = new Set(routePolicies.filter((route) => route.rendering.startsWith("native")).map((route) => route.path));
    expect(seoAuditManifest.nativePublic.every((path) => nativePolicies.has(path))).toBe(true);
  });

  it("has unique one-hop redirect sources and no classification collisions", () => {
    const sources = seoAuditManifest.redirects.map(([source]) => source);
    expect(new Set(sources).size).toBe(sources.length);
    const indexable = new Set<string>(seoAuditManifest.indexable.map(({ path }) => path));
    expect(seoAuditManifest.noindex.filter((path) => indexable.has(path.split("?")[0]!))).toEqual([]);
  });

  it("keeps transactional routes on the compatibility bridge", () => {
    expect(seoAuditManifest.legacyBridge).toContain("/checkout/payment");
    expect(seoAuditManifest.legacyBridge).toContain("/account");
  });
});
