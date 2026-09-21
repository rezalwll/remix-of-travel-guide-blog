import { expect, test } from "@playwright/test";

test("Next public SEO routes render useful server content and internal links", async ({ page }) => {
  for (const [path, heading] of [
    ["/destinations/iran/kish", "راهنمای سفر به کیش"],
    ["/flights/tehran-to-mashhad", "بلیط هواپیما تهران به مشهد"],
    ["/hotels/kish", "هتل‌های کیش"],
    ["/blog/best-time-to-visit-istanbul", /بهترین زمان سفر به استانبول/],
  ] as const) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
});

test("legacy aliases redirect once and private routes are noindex", async ({ page }) => {
  const response = await page.goto("/help");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/support$/);
  await page.goto("/auth/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("unknown route has a real 404 response", async ({ page }) => {
  const response = await page.goto("/route-that-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "این مسیر پیدا نشد" })).toBeVisible();
});
