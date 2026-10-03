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

ابعاد فعلی در پاسخ summary: `serviceType`، `paymentStatus` و `bookingStatus`. schema و indexها برای merchant، provider و بازه‌های تاریخی آماده‌اند؛ UI و export ابعاد کامل در فاز بعدی اضافه می‌شود.

