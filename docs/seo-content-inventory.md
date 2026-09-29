# موجودی محتوای SEO

تاریخ ممیزی: ۲۰۲۶-۰۹-۲۷

منبع ماشینی موجودی `src/seo/inventory.ts` است. عددهای زیر «نامزد انتشار» هستند؛ حضور نهایی در sitemap فقط پس از عبور از `auditSeoRecord` ممکن است.

| نوع صفحه | تعداد | وضعیت انتشار | مسیر canonical |
|---|---:|---|---|
| مقصد شهری | ۱۴ | index در صورت عبور از گیت | `/destinations/{country}/{city}` |
| مسیر پرواز | ۱۳ | index در صورت عبور از گیت | `/flights/{origin}-to-{destination}` |
| هتل‌شهر | ۱۰ | index در صورت عبور از گیت | `/hotels/{city}` |
| تور مقصد | ۸ | index در صورت عبور از گیت | `/tours/{destination}` |
| راهنمای فرودگاه | ۲ | index فقط با منبع رسمی | `/airports/{iata}` |
| مقاله تایپ‌شده | ۳ | index در صورت عبور از گیت | `/blog/{slug}` |
| صفحات ثابت عمومی | رجیستری‌شده | بر اساس `routePolicies` | مسیر تمیز بدون query |

## خوشه‌های راهبردی فعال

- داخلی: تهران، مشهد، کیش، قشم، شیراز و اصفهان.
- منطقه‌ای: استانبول، دبی، تفلیس، ایروان، باکو، دوحه، مسقط و نجف.
- مسیرها فقط برای ترکیب‌های دارای محتوای مستقل ساخته شده‌اند؛ permutation خودکار مبدأ/مقصد وجود ندارد.
- صفحات جزئیات نمایشی هتل و تور، نتایج جست‌وجو و فرایند خرید `noindex` باقی مانده‌اند.

## رجیستر URLهای تایپ‌شده

ستون وضعیت در این سند وضعیت طراحی/محتواست؛ علامت `READY*` یعنی پذیرش نهایی به اجرای گیت در CI وابسته است. rendering همه این صفحات `native-isr`، منبع `typed-seo-content` و canonical برابر path است.

### مقصد

| path | وضعیت | پیوندهای اصلی | داده ساختاریافته |
|---|---|---|---|
| `/destinations/iran/tehran` | READY* | پرواز، هتل، آرشیو مقصد | Breadcrumb |
| `/destinations/iran/mashhad` | READY* | پرواز، هتل، مقاله | Breadcrumb |
| `/destinations/iran/kish` | READY* | پرواز، هتل، مقاله | Breadcrumb |
| `/destinations/iran/qeshm` | READY* | پرواز، هتل | Breadcrumb |
| `/destinations/iran/shiraz` | READY* | پرواز، هتل | Breadcrumb |
| `/destinations/iran/isfahan` | READY* | پرواز، هتل | Breadcrumb |
| `/destinations/turkey/istanbul` | READY* | پرواز، هتل، مقاله | Breadcrumb |
| `/destinations/uae/dubai` | READY* | پرواز، هتل | Breadcrumb |
| `/destinations/georgia/tbilisi` | READY* | پرواز، هتل | Breadcrumb |
| `/destinations/armenia/yerevan` | READY* | پرواز، هتل | Breadcrumb |
| `/destinations/azerbaijan/baku` | READY* | پرواز، آرشیو | Breadcrumb |
| `/destinations/qatar/doha` | READY* | پرواز، آرشیو | Breadcrumb |
| `/destinations/oman/muscat` | READY* | پرواز، آرشیو | Breadcrumb |
| `/destinations/iraq/najaf` | READY* | پرواز، آرشیو | Breadcrumb |

### مسیر پرواز

`/flights/tehran-to-mashhad`، `/flights/tehran-to-kish`، `/flights/tehran-to-shiraz`، `/flights/tehran-to-isfahan`، `/flights/tehran-to-qeshm`، `/flights/tehran-to-istanbul`، `/flights/tehran-to-dubai`، `/flights/tehran-to-tbilisi`، `/flights/tehran-to-yerevan`، `/flights/tehran-to-baku`، `/flights/tehran-to-doha`، `/flights/tehran-to-muscat` و `/flights/tehran-to-najaf` همگی `READY*`، دارای مقصد/هتل/مسیر مرتبط و FAQPage هستند. قیمت، برنامه یا ظرفیت زنده منتشر نمی‌کنند.

### هتل‌شهر

`/hotels/kish`، `/hotels/mashhad`، `/hotels/tehran`، `/hotels/shiraz`، `/hotels/isfahan`، `/hotels/qeshm`، `/hotels/istanbul`، `/hotels/dubai`، `/hotels/tbilisi` و `/hotels/yerevan` همگی `READY*` و به راهنمای مقصد مرتبط‌اند. جزئیات نمایشی property، قیمت، رتبه و موجودی index نمی‌شوند.

### تور مقصد، فرودگاه و مقاله

| pathها | وضعیت | سیاست |
|---|---|---|
| `/tours/istanbul`، `/tours/dubai`، `/tours/tbilisi`، `/tours/yerevan`، `/tours/kish`، `/tours/qeshm`، `/tours/mashhad`، `/tours/najaf-karbala` | READY* | evergreen؛ inventory نمایشی جدا و noindex |
| `/airports/ika`، `/airports/ist` | READY* | منبع رسمی و بازبینی ۲۰۲۶-۰۹-۲۷ |
| `/blog/best-time-to-visit-istanbul`، `/blog/kish-travel-guide`، `/blog/mashhad-travel-planning` | READY* | BlogPosting؛ بدون ادعای زنده |

## مسیرهای ثابت عمومی

مسیرهای ثابت از `src/seo/routes.ts` کنترل می‌شوند: خانه، مقصدها، مجله، پرواز، هتل، مسیر، تور، زیارت، ویزا، قطار، اتوبوس، بیمه، CIP، ترانسفر، فرودگاه‌ها، پشتیبانی، دو راهنمای خرید/استرداد و صفحات اطلاعاتی. صفحات legacy اطلاعاتی `NEEDS_ENRICHMENT` هستند و باید در ممیزی محتوایی بعدی از نظر عنوان فارسی و عمق بررسی شوند؛ مسیرهای تراکنشی و خصوصی `NOINDEX` هستند.

## وضعیت محتوای قدیمی

صفحات قدیمی کشور/مقاله برای حفظ سازگاری URL ممکن است رندر شوند، اما تا زمان انتقال به مدل تایپ‌شده، عبور از گیت و تعیین منبع، در sitemap قرار نمی‌گیرند و صفحات مقصد قدیمی `noindex` هستند. مقصدهای حذف‌شدهٔ محصول مانند eSIM، fast-track و city-tours دوباره ایجاد نشده‌اند.

## مالکیت و چرخه عمر

هر رکورد باید مالک تحریریه، `updatedAt` و `reviewedAt` داشته باشد. محتوای کم‌نوسان سالانه، مسیر/هتل/تور هر ۱۸۰ روز، فرودگاه هر ۹۰ روز و ویزا هر ۳۰ روز بازبینی می‌شود. محتوایی که بازبینی آن عقب افتاده باشد باید از sitemap خارج شود یا تا بازبینی `noindex` گردد.
