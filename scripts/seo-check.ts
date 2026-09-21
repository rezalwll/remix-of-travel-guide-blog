const baseUrl = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const failures: string[] = [];
const expect = (condition: unknown, message: string) => { if (!condition) failures.push(message); };
const fetchPage = async (path: string) => {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  return { response, html: await response.text() };
};

const indexable = [
  ["/", "سفر را انتخاب کن", false],
  ["/destinations/iran/kish", "راهنمای سفر به کیش", false],
  ["/flights/tehran-to-mashhad", "بلیط هواپیما تهران به مشهد", true],
  ["/hotels/kish", "هتل‌های کیش", false],
  ["/blog/best-time-to-visit-istanbul", "بهترین زمان سفر به استانبول", true],
] as const;

for (const [path, h1, jsonLd] of indexable) {
  const { response, html } = await fetchPage(path);
  expect(response.status === 200, `${path} should return 200 (got ${response.status})`);
  expect(/<title>[^<]{8,}<\/title>/i.test(html), `${path} is missing a meaningful title`);
  expect(/<meta[^>]+name="description"[^>]+content="[^"]{40,}"/i.test(html) || /<meta[^>]+content="[^"]{40,}"[^>]+name="description"/i.test(html), `${path} is missing a meaningful description`);
  expect(/<link[^>]+rel="canonical"/i.test(html), `${path} is missing canonical`);
  expect(html.includes(h1), `${path} H1/content is not present in raw HTML`);
  expect(!/name="robots"[^>]+noindex/i.test(html), `${path} should be indexable`);
  if (jsonLd) expect(html.includes("application/ld+json"), `${path} is missing JSON-LD`);
}

for (const path of ["/auth/login", "/checkout/review", "/track-order", "/flights/search?from=THR&to=MHD", "/account"]) {
  const { response, html } = await fetchPage(path);
  expect(response.status === 200, `${path} should render with 200 before client auth handling`);
  expect(/name="robots"[^>]+content="[^"]*noindex/i.test(html) || /content="[^"]*noindex[^"]*"[^>]+name="robots"/i.test(html), `${path} should emit noindex`);
}

const missing = await fetchPage("/this-route-must-not-exist");
expect(missing.response.status === 404, `unknown route should return 404 (got ${missing.response.status})`);

const legacy = await fetchPage("/article/feat1");
expect([307, 308].includes(legacy.response.status), `legacy article should permanently redirect (got ${legacy.response.status})`);
expect(legacy.response.headers.get("location") === "/blog/feat1", "legacy article redirect target is incorrect");

const sitemap = await fetchPage("/sitemap.xml");
expect(sitemap.response.status === 200 && sitemap.html.includes("/flights/tehran-to-mashhad"), "sitemap is missing an indexable route");
expect(!sitemap.html.includes("/checkout/") && !sitemap.html.includes("/account"), "sitemap contains private URLs");

const robots = await fetchPage("/robots.txt");
expect(robots.response.status === 200 && robots.html.includes("Disallow: /account/"), "robots policy is missing private-route rules");

if (failures.length) {
  console.error(`SEO check failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO raw HTML check passed (${indexable.length} indexable pages, 5 noindex pages, redirects, 404, sitemap and robots).`);
