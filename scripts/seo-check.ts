import { seoAuditManifest } from "../src/seo/audit-manifest";

const baseUrl = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const failures: string[] = [];
const expect = (condition: unknown, message: string) => { if (!condition) failures.push(message); };
const fetchPage = async (path: string) => {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  return { response, html: await response.text() };
};

for (const { path, h1, jsonLd } of seoAuditManifest.indexable) {
  const { response, html } = await fetchPage(path);
  expect(response.status === 200, `${path} should return 200 (got ${response.status})`);
  expect(/<title>[^<]{8,}<\/title>/i.test(html), `${path} is missing a meaningful title`);
  expect(/<meta[^>]+name="description"[^>]+content="[^"]{40,}"/i.test(html) || /<meta[^>]+content="[^"]{40,}"[^>]+name="description"/i.test(html), `${path} is missing a meaningful description`);
  expect(/<link[^>]+rel="canonical"/i.test(html), `${path} is missing canonical`);
  expect(html.includes(h1), `${path} H1/content is not present in raw HTML`);
  expect(!/name="robots"[^>]+noindex/i.test(html), `${path} should be indexable`);
  if (jsonLd) expect(html.includes("application/ld+json"), `${path} is missing JSON-LD`);
}

for (const path of seoAuditManifest.noindex) {
  const { response, html } = await fetchPage(path);
  expect(response.status === 200, `${path} should render with 200 before client auth handling`);
  expect(/name="robots"[^>]+content="[^"]*noindex/i.test(html) || /content="[^"]*noindex[^"]*"[^>]+name="robots"/i.test(html), `${path} should emit noindex`);
  expect(!/<link[^>]+rel="canonical"/i.test(html), `${path} must not canonicalize to a public page`);
  expect(response.headers.get("cache-control")?.includes("no-store"), `${path} should send a private no-store cache policy`);
}

for (const [source, target] of seoAuditManifest.redirects) {
  const redirected = await fetchPage(source);
  expect(redirected.response.status === 308, `${source} should permanently redirect (got ${redirected.response.status})`);
  expect(redirected.response.headers.get("location") === target, `${source} redirect target is incorrect`);
  const destination = await fetchPage(target);
  expect(destination.response.status === 200, `${source} redirect destination should return 200 without another hop`);
}

for (const path of seoAuditManifest.intentional404) {
  const missing = await fetchPage(path);
  expect(missing.response.status === 404, `${path} should return 404 (got ${missing.response.status})`);
}

const sitemap = await fetchPage("/sitemap.xml");
expect(sitemap.response.status === 200 && sitemap.html.includes("/flights/tehran-to-mashhad"), "sitemap is missing an indexable route");
expect(!sitemap.html.includes("/checkout/") && !sitemap.html.includes("/account"), "sitemap contains private URLs");

const robots = await fetchPage("/robots.txt");
expect(robots.response.status === 200 && robots.html.includes("Disallow: /account"), "robots policy is missing private-route rules");

if (failures.length) {
  console.error(`SEO check failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO raw HTML check passed (${seoAuditManifest.indexable.length} indexable pages, ${seoAuditManifest.noindex.length} noindex pages without private canonicals, ${seoAuditManifest.redirects.length} one-hop redirects, 404, sitemap and robots).`);
