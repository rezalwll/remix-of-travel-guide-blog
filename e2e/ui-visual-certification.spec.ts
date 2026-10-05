import { expect, test } from "@playwright/test";

const routeChecklist = [
  "/",
  "/flights",
  "/flights/tehran-to-mashhad",
  "/hotels",
  "/hotels/kish",
  "/hotels/search?destination=mashhad&checkIn=2026-10-30&checkOut=2026-11-03",
  "/hotels/almas-2-mashhad?destination=mashhad&checkin=2026-10-30&checkout=2026-11-03&rooms=1&adults=2&children=0",
  "/tours",
  "/ziyarat",
  "/trains",
  "/buses",
  "/insurance",
  "/cip",
  "/transfer",
  "/visa",
  "/destinations",
  "/destinations/iran/kish",
  "/routes",
  "/shop",
  "/blog",
  "/blog/kish-travel-guide",
  "/support",
  "/auth/login",
  "/track-order",
  "/route-that-does-not-exist",
] as const;

const screenshotRoutes = ["/", "/flights", "/hotels", "/destinations", "/blog", "/support", "/auth/login"] as const;

test("priority visual routes render without broken images or horizontal overflow", async ({ page }) => {
  for (const route of routeChecklist) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(route === "/route-that-does-not-exist" ? 404 : 200);
    await expect(page.getByRole("heading", { level: 1 }).first(), route).toBeVisible();
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    }));
    expect(result.overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
    expect(result.brokenImages, `${route} broken images`).toEqual([]);
  }
});

test("home hero exposes a readable accessible heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "سفر بعدی‌ات را همین‌جا پیدا کن" })).toBeVisible();
});

for (const route of screenshotRoutes) {
  test(`visual review artifact: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 }).first(), route).toBeVisible();
    await page.locator("img").evaluateAll((images) => images.forEach((image) => image.loading = "eager"));
    await page.waitForTimeout(750);
    const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
    await page.screenshot({ path: testInfo.outputPath(`${slug}.png`), fullPage: true, animations: "disabled" });
  });
}
