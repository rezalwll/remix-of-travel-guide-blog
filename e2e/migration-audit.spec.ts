import { expect, test } from "@playwright/test";

const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440];

test("priority public shell remains usable across certification widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "explicit viewport matrix runs once");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(width === 320 ? "/flights" : "/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("skip link and primary landmarks remain accessible", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: "رفتن به محتوای اصلی" });
  await skip.focus();
  await expect(skip).toBeFocused();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});
