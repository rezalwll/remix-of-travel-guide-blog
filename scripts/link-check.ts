const baseUrl = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const origin = new URL(baseUrl).origin;
const failures: string[] = [];
const warnings: string[] = [];

const request = (path: string) => fetch(new URL(path, baseUrl), { redirect: "manual" });
const sitemapResponse = await request("/sitemap.xml");
if (!sitemapResponse.ok) throw new Error(`sitemap request failed: ${sitemapResponse.status}`);
const sitemapXml = await sitemapResponse.text();
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!).pathname);
const pages = new Map<string, string>();
const inbound = new Map(sitemapPaths.map((path) => [path, 0]));
const anchorTargets = new Map<string, Set<string>>();

for (let offset = 0; offset < sitemapPaths.length; offset += 12) {
  await Promise.all(sitemapPaths.slice(offset, offset + 12).map(async (path) => {
    const response = await request(path);
    const html = await response.text();
    if (response.status !== 200) failures.push(`sitemap URL ${path} returned ${response.status}`);
    if (/name="robots"[^>]+noindex/i.test(html)) failures.push(`sitemap URL ${path} is noindex`);
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1];
    if (!canonical || new URL(canonical, baseUrl).pathname !== path) failures.push(`sitemap URL ${path} has mismatched canonical`);
    pages.set(path, html);
  }));
}

const links = new Set<string>();
for (const [sourcePath, html] of pages) {
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const href = match[1]!;
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    const url = new URL(href, baseUrl);
    if (url.origin === origin && !url.pathname.startsWith("/_next/")) {
      links.add(`${url.pathname}${url.search}`);
      if (url.search === "" && inbound.has(url.pathname) && url.pathname !== sourcePath) inbound.set(url.pathname, (inbound.get(url.pathname) ?? 0) + 1);
    }
  }
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = new URL(match[1]!, baseUrl);
    if (url.origin !== origin) continue;
    const anchorText = match[2]!.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
    if (anchorText) anchorTargets.set(anchorText, new Set([...(anchorTargets.get(anchorText) ?? []), url.pathname]));
  }
}

for (let offset = 0; offset < links.size; offset += 12) {
  const batch = [...links].slice(offset, offset + 12);
  await Promise.all(batch.map(async (path) => {
    const response = await request(path);
    if (response.status === 200) return;
    if (![301, 307, 308].includes(response.status)) { failures.push(`internal link ${path} returned ${response.status}`); return; }
    const location = response.headers.get("location");
    if (!location) { failures.push(`internal link ${path} redirects without Location`); return; }
    const target = await request(location);
    if (target.status !== 200) failures.push(`internal link ${path} has redirect chain/broken target (${target.status})`);
  }));
}

for (const [path, count] of inbound) {
  if (path === "/") continue;
  if (count === 0) warnings.push(`orphan candidate: ${path}`);
  else if (count === 1) warnings.push(`weakly linked (${count} inbound): ${path}`);
}
for (const [anchor, targets] of anchorTargets) if (targets.size >= 6 && anchor.length < 22) warnings.push(`anchor «${anchor}» به ${targets.size} مقصد مختلف اشاره می‌کند`);

if (warnings.length) console.warn(`Internal link warnings:\n- ${warnings.join("\n- ")}`);
if (failures.length) { console.error(`Internal link check failed:\n- ${failures.join("\n- ")}`); process.exit(1); }
console.log(`Internal link check passed (${sitemapPaths.length} sitemap URLs, ${links.size} unique internal links).`);
