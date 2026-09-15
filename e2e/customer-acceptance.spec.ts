import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); }); });

test('anonymous customer can search flights and reach passenger checkout', async ({ page }) => {
  await page.goto('/flights/search?from=IKA&to=IST&departure=2026-10-12&return=2026-10-18&adults=1&children=0&infants=0&cabin=%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF%DB%8C&trip=roundtrip');
  await expect(page.getByRole('heading', { name: 'پروازهای موجود' })).toBeVisible();
  const choose = page.getByRole('button', { name: /انتخاب پرواز/ });
  await expect(choose.first()).toBeVisible();
  await choose.first().click();
  await expect(page.getByRole('heading', { name: 'انتخاب پرواز برگشت' })).toBeVisible();
  await choose.first().click();
  await page.getByRole('button', { name: 'ادامه رزرو' }).click();
  await expect(page).toHaveURL(/\/checkout\/passengers/);
  await expect(page.getByRole('heading', { name: 'اطلاعات خریدار' })).toBeVisible();
});

test('tracking and help provide useful invalid and search states', async ({ page }) => {
  await page.goto('/track-order');
  await page.getByLabel('شماره سفارش / کد پیگیری').fill('KIA-INVALID');
  await page.getByLabel('موبایل خریدار').fill('09120000000');
  await page.getByRole('button', { name: 'جست‌وجوی سفارش' }).click();
  await expect(page.getByRole('alert')).toContainText('پیدا نشد');
  await page.goto('/help');
  await expect(page.getByRole('heading', { name: 'سوالات متداول' })).toBeVisible();
  await page.getByPlaceholder('سوال یا موضوع خود را جست‌وجو کنید').fill('پرداخت');
  await expect(page.getByText('اگر پرداخت ناموفق شود چه کار کنم؟')).toBeVisible();
});

test('mobile navigation and complementary service pages are reachable', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile navigation check');
  await page.goto('/');
  await page.getByRole('button', { name: 'باز کردن منو' }).click();
  const mobileMenu = page.getByRole('navigation', { name: 'منوی موبایل' });
  await expect(mobileMenu.getByRole('link', { name: 'پیگیری خرید' })).toBeVisible();
  await mobileMenu.getByRole('link', { name: 'eSIM' }).click();
  await expect(page.getByRole('heading', { name: 'eSIM سفر' })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});
