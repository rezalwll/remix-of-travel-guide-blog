import { expect, test } from "@playwright/test";

const routeChecklist = [
  "/",
  "/flights",
  "/flights/tehran-to-mashhad",
  "/hotels",
  "/hotels/kish",
  "/tours",
  "/ziyarat",
  "/trains",
  "/buses",
  "/insurance",
  "/cip",
  "/transfer",
  "/visa",
  "/fast-track",
  "/esim",
  "/city-tours",
  "/destinations",
  "/destinations/iran/kish",
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

test("representative visual review screenshots are emitted as test artifacts", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  for (const route of screenshotRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 }).first(), route).toBeVisible();
    await page.locator("img").evaluateAll((images) => images.forEach((image) => image.loading = "eager"));
    await page.waitForTimeout(750);
    const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
    await page.screenshot({ path: testInfo.outputPath(`${slug}.png`), fullPage: true, animations: "disabled" });
  }
});
