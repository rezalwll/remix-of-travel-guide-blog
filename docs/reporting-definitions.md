# تعاریف گزارش‌گیری

## زمان و بازه

- timestampها در PostgreSQL به UTC نگهداری می‌شوند.
- timezone کسب‌وکار و bucket روزانه `Asia/Tehran` است.
- `today` از نیمه‌شب تهران تا زمان درخواست است.
- `7d` و `30d` پنجرهٔ rolling تا زمان درخواست هستند.
- `current_month` از نیمه‌شب روز اول ماه میلادی در تهران است.
- custom range باید offset صریح داشته باشد، `from < to` و حداکثر ۳۶۶ روز باشد.

## totals

- `orders`: تعداد سفارش ایجادشده در بازه.
- `completedOrders`: سفارش با `paymentStatus=paid` و `bookingStatus=confirmed`.
- `grossAmount`: جمع total سفارش‌های `paid`.
- `paymentSucceeded`: PaymentAttempt با `status=succeeded`.
- `paymentFailed`: PaymentAttempt با `failed` یا `cancelled`.
- `bookingSucceeded`: سفارش `confirmed`.
- `bookingFailed`: سفارش `reservation_failed`.
- `manualReview`: سفارش `manual_review_required`.
- `refunds` و `refundAmount`: فقط RefundRequest تکمیل‌شده و `completedAt` داخل بازه.
- `commissionAmount`: جمع ledger نوع `COMMISSION` و status `POSTED`.
- `merchantPayable`: جمع ledger نوع `MERCHANT_PAYABLE` و status `POSTED`.

## قرارداد پاسخ

پاسخ summary شامل `range {from,to,timezone}`، `totals`، `series` روزانه و `dimensions` است. aggregation در PostgreSQL/Prisma انجام می‌شود؛ browser همه سفارش‌ها را برای جمع‌زدن دریافت نمی‌کند.

ابعاد پایه در پاسخ summary: `serviceType`، `paymentStatus` و `bookingStatus`. گزارش‌های عملیاتی محدود به این مجموعه‌اند:

| گزارش | معیار اصلی | ابعاد/فیلتر مجاز |
|---|---|---|
| فروش و سفارش | تعداد، مبلغ ناخالص، موفق/ناموفق | بازه، سرویس، وضعیت پرداخت/رزرو |
| تور و زیارت | برنامه، ثبت‌نام، مبلغ | بازه، نوع برنامه، وضعیت |
| هتل | رزرو، شب، مبلغ، لغو | بازه، هتل/پذیرنده، وضعیت |
| پذیرنده | سفارش، فروش، کارمزد، قابل پرداخت | بازه، پذیرنده، وضعیت onboarding |
| استرداد | تعداد و مبلغ تکمیل/در انتظار | بازه، سرویس، وضعیت |
| تسویه | ناخالص، کارمزد، قابل پرداخت، پرداخت‌شده | بازه، پذیرنده، وضعیت |
| قابلیت اتکای provider | تلاش، موفق، ناموفق، نامعلوم/بازبینی | بازه، سرویس، provider |

گزارش provider reliability از `BookingAttempt` محاسبه می‌شود؛ timeout فقط وقتی نمایش داده می‌شود که به‌صراحت ثبت شده باشد. CSV باید همان فیلتر و permission صفحه را حفظ کند و فرمول یا داده حساس تزریق نکند. forecasting، cohort، attribution، funnel پیشرفته و BI warehouse خارج از دامنه‌اند. هر صفحه حداکثر یک نمودار کوچک دارد و جدول منبع اصلی بررسی است.
