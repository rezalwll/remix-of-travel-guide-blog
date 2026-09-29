# راه‌اندازی Google Search Console

## پیش‌نیاز

- دامنه و `SITE_URL` نهایی مشخص باشد.
- HTTPS، canonical، robots و `/sitemap.xml` در production قابل دسترس باشند.
- مالکیت دامنه ترجیحاً با DNS TXT تأیید شود؛ مقدار verification نباید در repository عمومی ثبت شود.

## اجرا

1. Domain property را با دامنه production بسازید و DNS را تأیید کنید.
2. فقط URL نهایی `/sitemap.xml` را ثبت کنید.
3. با URL Inspection نمونه خانه، مقصد، مسیر، هتل، تور و فرودگاه را بررسی کنید.
4. مطمئن شوید search/account/checkout در گزارش index دیده نمی‌شوند.
5. Page indexing، Core Web Vitals، HTTPS و structured data را هفتگی در چهار هفته اول مرور کنید.

## baseline و هشدار

تاریخ submission، تعداد URLهای sitemap و نمونه URLها در تیکت انتشار ثبت شود. افزایش ناگهانی Crawled/Discovered currently not indexed، duplicate canonical، soft 404 یا URL پارامتری باید بررسی شود. Request indexing برای rollout انبوه جای sitemap و پیوند داخلی را نمی‌گیرد.

## rollback

اگر template خطای canonical/noindex گسترده داشت، انتشار متوقف، sitemap به مجموعه سالم محدود و اصلاح با نسخه جدید deploy شود. حذف URL اضطراری ابزار دائمی مدیریت index نیست.
