# ممیزی امنیت dependencyها — فاز ۲۲

تاریخ اجرا: ۲۰۲۶-۰۹-۲۱

## نتیجه

baseline ثبت‌شده ۹ advisory (۴ high و ۵ moderate) بود. پس از ارتقا و cutover فرانت، `npm audit` سه advisory high و صفر critical/moderate نشان می‌دهد. Vite و React Router از runtime/build مستقیم حذف شده‌اند؛ Vitest به `4.1.11` ارتقا یافته و تست‌ها باقی مانده‌اند.

سه مورد باقی‌مانده یک زنجیره‌اند: `prisma@6.19.3 → @prisma/config → deepmerge-ts` و advisory `GHSA-ggr8-5vv4-36mx` دربارهٔ stack exhaustion روی graph بازگشتی. پیشنهاد npm، تغییر Prisma به نسخهٔ `6.12.0` است که downgrade نامتناسب و برای این پروژه semver-major تشخیص داده شده؛ بنابراین `audit fix --force` اجرا نشده است. این مسیر CLI/config است، نه payload runtime عمومی، ولی تا fix سازگار upstream در CI پایش می‌شود.

## تغییرات اصلی

- اضافه: Next `16.3.5`، React/React DOM `19.3.0`، eslint-config-next `16.3.5`، concurrently `9.2.1`
- peer-compatible: next-themes `0.4.6`، react-day-picker `10.0.1`، vaul `1.1.2`
- حذف مستقیم: `vite`، `@vitejs/plugin-react-swc`، `react-router-dom`
- نگه‌داری: Vitest به‌عنوان test runner، Tailwind 3، Fastify/Prisma 6

هیچ canary/RC، forced fix یا upgrade ناسازگار صرفاً برای رسیدن به عدد صفر استفاده نشده است. lockfile باید فقط با `npm ci` در Node 20/npm 10 CI بازتولید/اعتبارسنجی شود.
