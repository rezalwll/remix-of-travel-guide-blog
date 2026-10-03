# سیاست جداسازی Merchant Tenant

## قواعد غیرقابل مذاکره

- تمام داده‌های merchant-owned با `organizationId` query می‌شوند.
- الگوی صحیح `findFirst({ where: { id, merchantOrganizationId } })` است؛ خواندن سراسری و مقایسهٔ دیرهنگام مجاز نیست.
- شناسهٔ merchant در body، query یا URL اختیار ایجاد نمی‌کند.
- context سازمان فقط از عضویت `ACTIVE` در سازمان `ACTIVE` به‌دست می‌آید.
- کارمند داخلی نیز تنها endpoint و permission صریح backoffice را دارد و bypass پنهان ندارد.

## منابع tenant-scoped

- سفارش و جزئیات سفارش
- BookingAttempt
- گزارش و dashboard
- MerchantLedgerEntry و خلاصه مالی
- SettlementBatch
- تیم و نقش‌های عضویت
- MerchantProfile

پاسخ سفارش merchant از DTO اختصاصی ساخته می‌شود. موبایل، ایمیل، کد ملی و گذرنامه ماسک می‌شوند؛ snapshot پرداخت، provider payload، signature و secret برگردانده نمی‌شوند.

## انتخاب میان چند عضویت

اگر کاربر چند عضویت merchant دارد، `X-Organization-Id` می‌تواند یکی از عضویت‌های فعال همان کاربر را انتخاب کند. مقدار ناشناخته 403 می‌گیرد. بدون هدر، نخستین عضویت فعال به‌صورت پایدار انتخاب می‌شود. UI نهایی انتخاب سازمان در فاز merchant portal تکمیل می‌شود.

## تست‌های جداسازی

تست API تضمین می‌کند هدر سازمان دیگر قبل از اجرای repository رد شود. تست یکپارچه PostgreSQL نیز list، detail، team، finance، settlement و report را میان دو merchant جدا می‌کند و detail بین‌سازمانی را 404 می‌دهد.

