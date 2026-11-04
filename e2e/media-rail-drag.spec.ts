import { expect, test } from "@playwright/test";

test("photo rail scrolls with a mouse drag and still opens cards on click", async ({ page }) => {
  await page.goto("/");
  const rail = page.getByRole("list", { name: "شهرهای پیشنهادی برای اقامت" });
  await rail.scrollIntoViewIfNeeded();

  const initialScroll = await rail.evaluate((element) => element.scrollLeft);
  const box = await rail.boundingBox();
  expect(box).not.toBeNull();

  const startX = box!.x + box!.width * 0.7;
  const y = box!.y + box!.height * 0.5;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 260, y, { steps: 12 });
  await page.mouse.up();

  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeLessThan(initialScroll - 20);
  const scrolledLeft = await rail.evaluate((element) => element.scrollLeft);
  await expect(page).toHaveURL(/\/$/);

  await page.mouse.move(startX - 260, y);
  await page.mouse.down();
  await page.mouse.move(startX, y, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(scrolledLeft + 20);

  await rail.locator("a").first().click();
  await expect(page).toHaveURL(/\/hotels\//);
});
