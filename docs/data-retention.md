# سیاست پیشنهادی نگهداری داده

این سند policy اجرایی یا مشاورهٔ حقوقی نیست و تا تعیین الزامات کسب‌وکار/قانونی، هیچ job حذف خودکاری فعال نمی‌شود.

| داده | حساسیت | پیشنهاد نگهداری | اقدام بعدی |
|---|---|---|---|
| profile و mobile | بالا | طول عمر حساب + دورهٔ قانونی | تعیین درخواست حذف حساب |
| passengers، nationalId، passport | بسیار بالا | فقط تا پایان نیاز رزرو/پشتیبانی | حذف/ماسک‌کردن با approval |
| orders و payment snapshots | بالا | مطابق حسابداری و dispute | تعیین retention مالی |
| support و پیام‌ها | متوسط/بالا | تا پایان پرونده + بازهٔ پشتیبانی | تعریف archive |
| provider metadata/logs | بالا | حداقل لازم، بدون secret خام | تعیین TTL log |

قبل از هر retention job باید legal hold، refund/dispute، export کاربر و audit trail مشخص شود. backupها retention و encryption مستقل دارند.
