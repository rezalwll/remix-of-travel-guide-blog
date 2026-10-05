import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/track-order', '/support', '/blog', '/route-that-does-not-exist'];
for (const route of publicRoutes) {
  test(`critical public route remains responsive: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main').last()).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} overflows`).toBeLessThanOrEqual(1);
  });
}

test('skip link, keyboard focus, deep-link refresh and safe errors work', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'رفتن به محتوای اصلی' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.goto('/blog', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'قبل از حرکت بخوان' })).toBeVisible();

  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('شماره موبایل').fill('123');
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'شماره موبایل معتبر وارد کنید.' })).toBeVisible();
  await expect(page.getByText(/stack|postgresql|provider secret/i)).toHaveCount(0);
});
