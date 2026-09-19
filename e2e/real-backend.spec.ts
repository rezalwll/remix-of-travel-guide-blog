import { expect, test, type Page } from '@playwright/test';

const mobileNumber = () => `09${String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0')}`;

async function login(page: Page, mobile: string) {
  await page.goto('/auth/login');
  await page.getByLabel('شماره موبایل').fill(mobile);
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await page.getByLabel('کد یکبارمصرف').fill('12345');
  await page.getByRole('button', { name: 'تأیید و ورود' }).click();
  await expect(page).toHaveURL(/\/account/);
}

async function checkoutAndPay(page: Page, serviceType: string, service: Record<string, unknown>, key: string) {
  const checkoutResponse = await page.request.post('/api/checkout/sessions', { data: { serviceType, quantity: 1, service } });
  expect(checkoutResponse.status()).toBe(201);
  const checkout = (await checkoutResponse.json()).checkoutSession;
  const paidResponse = await page.request.post(`/api/checkout/sessions/${checkout.id}/payments`, { data: { method: 'online_mock', idempotencyKey: key } });
  expect(paidResponse.ok()).toBeTruthy();
  return (await paidResponse.json()).order;
}

test('OTP session survives refresh and flight/hotel bookings become supplier-confirmed', async ({ page }) => {
  await login(page, mobileNumber());
  await page.reload();
  await expect(page).toHaveURL(/\/account/);

  const flight = await checkoutAndPay(page, 'flight', { outbound: { id: 'flight-demo' } }, `e2e-flight-${Date.now()}`);
  expect(flight.bookingStatus).toBe('confirmed');
  await page.goto(`/checkout/result?state=success&order=${flight.id}`);
  await expect(page.getByRole('heading', { name: 'تأییدشده' })).toBeVisible();
  await expect(page.getByText(flight.orderNumber)).toBeVisible();

  const hotel = await checkoutAndPay(page, 'hotel', { hotel: { id: 'hotel-demo' } }, `e2e-hotel-${Date.now()}`);
  expect(hotel.bookingStatus).toBe('confirmed');
  await page.goto(`/orders/${hotel.id}`);
  await expect(page.getByText('رزرو توسط تأمین‌کننده تأیید شده است.')).toBeVisible();
});

test('failed supplier booking is visibly compensated and never presented as confirmed', async ({ page }) => {
  await login(page, mobileNumber());
  const order = await checkoutAndPay(page, 'flight', { outbound: { id: 'flight-phase16-failure', price: 8_900_000 } }, `e2e-failure-${Date.now()}`);
  expect(order.bookingStatus).toBe('refunded');
  await page.goto(`/checkout/result?state=success&order=${order.id}`);
  await expect(page.getByRole('heading', { name: 'وجه بازگردانده شد' })).toBeVisible();
  await expect(page.getByText('رزرو آزمایشی با موفقیت ثبت شد')).toHaveCount(0);
});

test('account operations persist and public tracking checks the buyer mobile', async ({ page }) => {
  const mobile = mobileNumber();
  await login(page, mobile);
  expect((await page.request.post('/api/account/passengers', { data: { firstName: 'رضا', lastName: 'آزمون', nationalId: '0012345678' } })).status()).toBe(201);
  expect((await page.request.post('/api/account/support', { data: { subject: 'پیگیری رزرو آزمایشی', body: 'لطفاً وضعیت را بررسی کنید.' } })).status()).toBe(201);
  const order = await checkoutAndPay(page, 'tour', {}, `e2e-track-${Date.now()}`);

  await page.goto('/account/passengers');
  await expect(page.getByText('رضا آزمون')).toBeVisible();
  await page.goto('/track-order');
  await page.getByLabel('شناسه سفارش').fill(order.orderNumber);
  await page.getByLabel('موبایل خریدار').fill(mobile);
  await page.getByRole('button', { name: 'جست‌وجوی سفارش' }).click();
  await expect(page.getByText(order.orderNumber)).toBeVisible();
  const wrong = await page.request.post('/api/order-tracking', { data: { identifier: order.orderNumber, mobile: '09120000000' } });
  expect(wrong.status()).toBe(404);
});
