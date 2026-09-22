# معماری SEO فرانت‌اند

## رندر و URL

Next.js App Router فرانت production است. خانه، مقصد، مسیر پرواز، هتل شهری و مجله با Server Component و SSG/ISR رندر می‌شوند. جست‌وجو، checkout، پرداخت، auth و account تعاملی‌اند، dynamic اجرا می‌شوند و `noindex,nofollow` دارند. اسلاگ‌ها پایدار و ASCII هستند و متن نمایشی، عنوان‌ها، H1 و breadcrumb فارسی و RTL باقی می‌مانند.

Canonical با helper مرکزی `src/seo/metadata.ts` از path تمیز و `SITE_URL` صریح ساخته می‌شود؛ build production بدون `SITE_URL` متوقف می‌شود. صفحات خصوصی و تراکنشی هیچ canonical عمومی ندارند و queryهای جست‌وجو canonical مستقل تولید نمی‌کنند. aliasهای عمومی با 308 مستقیم به URL canonical می‌روند و زنجیرهٔ redirect ندارند.

## قواعد ایندکس

رجیستری `src/seo/routes.ts` منبع واحد policy مسیرهای ثابت، indexability، شیوهٔ رندر و حضور در sitemap است. فقط entityهای محدود، شناخته‌شده و دارای محتوای منحصربه‌فرد pre-render می‌شوند. صفحات کشور ویزا تا زمان افزودن محتوای منبع‌دار noindex هستند. هیچ ترکیب خودکار کلمهٔ کلیدی یا مسیر مبدا/مقصد تولید نمی‌شود. sitemap فقط صفحات canonical عمومی را شامل می‌شود و از `updatedAt` واقعی محتوای تایپ‌شده استفاده می‌کند؛ تاریخ «امروز» در هر request جعل نمی‌شود.

شناسه‌های قدیمی `/flights/:id` صفحهٔ قابل‌ایندکس تولید نمی‌کنند و با 308 به جست‌وجوی همان مبدأ/مقصد هدایت می‌شوند. namespace هتل‌های شهری و جزئیات هتل در build از نظر برخورد slug کنترل می‌شود و build در صورت collision متوقف خواهد شد.

`robots.ts` assetها را باز می‌گذارد و account، auth، checkout، order، tracking، API، search و فرم ویزا را از crawl خارج می‌کند. metadata همان صفحات به‌صورت مستقل noindex است؛ robots.txt جایگزین کنترل metadata یا authorization نیست.

مسیرهای account، auth، checkout، order، tracking، search و درخواست ویزا علاوه بر noindex، هدر `Cache-Control: private, no-store` دارند. محتوای personalized فقط از Fastify و پس از ownership check دریافت می‌شود و در cache عمومی Next/Nginx قرار نمی‌گیرد.

## دادهٔ ساختاریافته

- WebSite و TravelAgency/Organization برای هویت سایت
- BreadcrumbList هم‌زمان با breadcrumb قابل‌مشاهده
- BlogPosting برای مقاله‌ها
- FAQPage فقط برای FAQ قابل‌مشاهدهٔ صفحات مسیر

عمداً Offer، قیمت، موجودی، ظرفیت، AggregateRating، review count، جایزه یا inventory نمایشی در JSON-LD منتشر نمی‌شود. Hotel/Tour commercial schema تا اتصال provider واقعی و دادهٔ قابل‌تأیید غیرفعال است.

## پیوند داخلی و محتوا

خانه به مقصدها، مسیرها، هتل‌ها و مقاله‌های راهبردی لینک دارد. مقصد به مسیر، هتل و مقاله؛ مسیر به مقصد، جست‌وجوی ازپیش‌تنظیم‌شده، هتل و مسیرهای مرتبط؛ مقاله به مقصد و مقاله‌های مرتبط لینک می‌دهد. breadcrumb نیز لینک crawlable با Next Link است.

مدل‌های `SeoDestination`، `SeoRoute`، `SeoHotelLanding` و `SeoArticle` در `src/seo/content.ts` source of truth هستند. قیمت و ظرفیت فقط از نتیجهٔ provider معتبر قابل‌استفاده خواهند بود.

## کارایی و امنیت خروجی

SEO pageها حداقل hydration را دارند؛ providerهای React Query/Auth فقط در مرز client قرار دارند و صفحات تراکنشی lazy-load می‌شوند. `next/image` برای heroهای اصلی، `next/font` برای Vazirmatn و ابعاد پایدار برای کنترل LCP/CLS استفاده شده است. اسکریپت بازاریابی یا pixel اضافه نشده است. CSP برای bootstrap inline استاتیک Next فعلاً `unsafe-inline` را فقط در `script-src` پذیرفته؛ script خارجی مجاز نیست و این trade-off باید در مهاجرت nonce/hash آینده بازبینی شود.

تست `npm run seo:check` HTML خام، status، H1، metadata، canonical، robots، JSON-LD، redirect، sitemap و robots.txt را روی build production بررسی می‌کند. Playwright مکمل آن و مسئول route parity و viewportهاست.
