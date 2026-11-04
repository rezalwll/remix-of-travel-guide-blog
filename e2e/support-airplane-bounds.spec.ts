import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 568, height: 320 },
  { width: 640, height: 360 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function checkFlightBounds(page: Page) {
  return page.locator(".support-airplane-flight").evaluate((element) => {
    const animation = element.getAnimations()[0];
    if (!animation?.effect) throw new Error("Expected an active airplane flight");
    animation.pause();
    const duration = Number(animation.effect.getTiming().duration);
    const failures: string[] = [];
    // Include points between keyframes to catch rotation/scale interpolation overflow.
    for (let sample = 0; sample <= 960; sample += 1) {
      animation.currentTime = duration * sample / 960;
      const rect = element.getBoundingClientRect();
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const width = viewport?.width ?? document.documentElement.clientWidth;
      const height = viewport?.height ?? window.innerHeight;
      if (rect.left < left - 0.5 || rect.top < top - 0.5
        || rect.right > left + width + 0.5 || rect.bottom > top + height + 0.5) {
        failures.push(`At ${sample / 960}: ${JSON.stringify(rect.toJSON())} outside ${width}x${height}`);
      }
    }
    animation.finish();
    return failures.slice(0, 3);
  });
}

async function openFlight(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (
    (document.querySelector(".support-airplane-flight")?.getAnimations().length ?? 0) > 0
  ));
}

for (const viewport of viewports) {
  test(`airplane stays inside ${viewport.width}x${viewport.height} for its entire flight`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openFlight(page);
    expect(await checkFlightBounds(page)).toEqual([]);
    await page.getByRole("button", { name: "بازکردن دستیار پشتیبانی کیاشی", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
}

test("flight adapts to rotation and stays aligned with its button after landing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFlight(page);
  await page.locator(".support-airplane-flight").evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 2400;
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(() => page.locator(".support-airplane-flight").evaluate(element => element.getBoundingClientRect().right)).toBeLessThanOrEqual(844);
  expect(await checkFlightBounds(page)).toEqual([]);
  const button = page.getByRole("button", { name: "بازکردن دستیار پشتیبانی کیاشی", exact: true });
  await expect(button).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  await expect.poll(async () => {
    const artwork = await page.locator(".support-airplane-flight").boundingBox();
    const target = await button.boundingBox();
    return artwork && target ? Math.abs(artwork.x - target.x) : Infinity;
  }).toBeLessThan(1);
  const artwork = await page.locator(".support-airplane-flight").boundingBox();
  expect(artwork).not.toBeNull();
  expect(artwork!.x + artwork!.width).toBeLessThanOrEqual(320);
  expect(artwork!.y + artwork!.height).toBeLessThanOrEqual(568);
});

test("reduced motion places the airplane inside a narrow viewport immediately", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "بازکردن دستیار پشتیبانی کیاشی", exact: true })).toBeVisible();
  const bounds = await page.locator(".support-airplane-flight").boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(568);
});
