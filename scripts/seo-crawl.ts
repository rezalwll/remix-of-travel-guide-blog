const baseUrl = (process.env.SEO_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const origin = new URL(baseUrl).origin;
const maximumPages = Number(process.env.SEO_CRAWL_LIMIT || 500);
const blockedPrefixes = ["/account", "/auth", "/checkout", "/orders", "/track-order", "/api", "/_next"];
const queue = ["/"];
const seen = new Set<string>();
const failures: string[] = [];
const titles = new Map<string, string[]>();
const descriptions = new Map<string, string[]>();

const addField = (registry: Map<string, string[]>, value: string | undefined, path: string) => {
  if (!value) return;
  const key = value.replace(/\s+/g, " ").trim().toLocaleLowerCase("fa");
  registry.set(key, [...(registry.get(key) ?? []), path]);
};

while (queue.length && seen.size < maximumPages) {
  const path = queue.shift()!;
  if (seen.has(path)) continue;
  seen.add(path);
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) failures.push(`${path}: redirect بدون Location`);
    else {
      const target = new URL(location, baseUrl);
      if (target.origin === origin) {
        const targetResponse = await fetch(target, { redirect: "manual" });
        if (targetResponse.status >= 300 && targetResponse.status < 400) failures.push(`${path}: redirect chain به ${target.pathname}`);
        else if (targetResponse.status !== 200) failures.push(`${path}: redirect target ${target.pathname} returned ${targetResponse.status}`);
        if (!seen.has(target.pathname)) queue.push(target.pathname);
      }
    }
    continue;
  }
  if (response.status !== 200) { failures.push(`${path}: HTTP ${response.status}`); continue; }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) continue;
  const html = await response.text();
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i)?.[1];
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const noindex = /name="robots"[^>]+content="[^"]*noindex/i.test(html) || /content="[^"]*noindex[^"]*"[^>]+name="robots"/i.test(html);
  if (!noindex) {
    if (!title || title.length < 12) failures.push(`${path}: title ناکافی`);
    if (!description || description.length < 60) failures.push(`${path}: description ناکافی`);
    if (!canonical || new URL(canonical, baseUrl).pathname !== path) failures.push(`${path}: canonical نامعتبر`);
    if (h1Count !== 1) failures.push(`${path}: تعداد H1 برابر ${h1Count}`);
    addField(titles, title, path);
    addField(descriptions, description, path);
  }
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const target = new URL(match[1]!, baseUrl);
    if (target.origin !== origin || target.search || target.hash || blockedPrefixes.some((prefix) => target.pathname.startsWith(prefix))) continue;
    if (!seen.has(target.pathname) && !queue.includes(target.pathname)) queue.push(target.pathname);
  }
}

for (const [title, paths] of titles) if (paths.length > 1) failures.push(`title تکراری «${title}»: ${paths.join(", ")}`);
for (const [description, paths] of descriptions) if (paths.length > 1) failures.push(`description تکراری «${description.slice(0, 50)}…»: ${paths.join(", ")}`);
if (queue.length) failures.push(`crawl به سقف ${maximumPages} صفحه رسید؛ ${queue.length} مسیر بررسی‌نشده باقی ماند.`);

if (failures.length) {
  console.error(`SEO crawl failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO crawl passed (${seen.size} same-origin pages).`);
