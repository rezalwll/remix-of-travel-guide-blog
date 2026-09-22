# ممیزی و بستن شکاف‌های فاز ۲۲.۱

## مبنا

ممیزی روی شاخهٔ `main` پس از مهاجرت فاز ۲۲ انجام شد. CI همان SHA تا مرحلهٔ topology production سبز بود و در Playwright شکست داشت. علت‌ها به حلقهٔ effect ناشی از identity ناپایدار query، تداخل locator با route announcer داخلی Next و OTP تصادفی production در محیط certification محدود می‌شد.

## تصمیم‌های نهایی

- مسیرهای عمومی اولویت‌دار (`flights`، `hotels`، `routes`، `tours`، `ziyarat`، `visa`، خدمات مکمل و `support`) route صریح App Router و Server Component دارند. فقط جست‌وجو و فیلتر FAQ به‌صورت client island باقی مانده است.
- `src/seo/routes.ts` منبع واحد مسیرهای ثابت indexable، sitemap و robots است. sitemap برای مقصدها، مسیرهای سفر، مقاله‌های دارای بدنه و landingهای تایپ‌شده تکمیل و duplicateها حذف می‌شود.
- صفحات auth/account/checkout/order/search/tracking noindex هستند و canonical عمومی منتشر نمی‌کنند.
- `SITE_URL` در production اجباری و build argument کانتینر است؛ fallback فقط برای توسعه `localhost` است.
- `/flights/:legacy-id` به صفحهٔ thin یا 404 مبهم تبدیل نمی‌شود؛ 308 به جست‌وجوی متناظر می‌رود. slugهای landing و detail هتل قبل از build collision-check می‌شوند.
- صفحه‌های کشور ویزا تا تکمیل متن منبع‌دار noindex باقی می‌مانند. قیمت، موجودی، rating و Offer ساختگی در schema منتشر نمی‌شود.
- runtime API در image دارای OpenSSL صریح است و web/API با user غیر-root و topology `Nginx → Next/Fastify → PostgreSQL` باقی مانده‌اند.

## شواهد پذیرش

دستورهای مرجع: `npm run typecheck:web`، `npm run build:web` با `SITE_URL`، `npm run build:api`، `npm run lint`، `npm test -- --run`، `npm run test:api -- --run`، `npm run seo:check` روی standalone production و Playwright روی topology production. نتیجهٔ SHA نهایی باید در GitHub Actions سبز شود؛ این سند نتیجهٔ محلی و CI همان revision را جدا گزارش می‌کند.
