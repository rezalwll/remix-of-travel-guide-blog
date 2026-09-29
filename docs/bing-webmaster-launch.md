# راه‌اندازی Bing Webmaster Tools

## راه‌اندازی

1. property دامنه production را با DNS یا import تأییدشده از Search Console اضافه کنید.
2. `/sitemap.xml` را ثبت و وضعیت fetch را ذخیره کنید.
3. نمونه URLهای هر page type را با URL Inspection بررسی کنید.
4. گزارش Site Scan، crawl errors و robots را پس از اولین crawl مرور کنید.

## IndexNow

در مقیاس فعلی و با محتوای عمدتاً evergreen، IndexNow عمداً فعال نشده است. sitemap، پیوند داخلی و بازبینی منظم کافی است. فعال‌سازی زمانی توجیه دارد که انتشار/حذف پرتعداد و زمان‌حساس آغاز شود؛ در آن زمان کلید باید secret محیط باشد و فقط URLهای canonical تغییرکرده ارسال شوند.

## پایش

تعداد URLهای discovered/indexed، خطاهای canonical، redirect، 404 و URL پارامتری ماهانه ثبت شود. تفاوت معنادار با Search Console یک سیگنال تحقیق است، نه دلیل تولید صفحه یا تغییر canonical بدون بررسی.
