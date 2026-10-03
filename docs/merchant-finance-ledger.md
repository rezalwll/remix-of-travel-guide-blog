# کمیسیون، دفترکل و تسویه Merchant

## واحد پول

تمام مبالغ این فاز عدد صحیح `TOMAN` هستند. تبدیل ضمنی IRR/TOMAN ممنوع است.

## CommissionRule

- `PERCENT`: مقدار با basis point ذخیره می‌شود؛ `100 = 1%` و `1000 = 10%`.
- `FIXED`: مبلغ ثابت تومان.
- محاسبه عدد صحیح، deterministic و با گردکردن رو به پایین است.
- کمیسیون هیچ‌گاه از gross همان محاسبه بیشتر نمی‌شود.

## MerchantLedgerEntry

دفترکل append-only است و trigger دیتابیس update/delete را رد می‌کند. اصلاح با رکورد جبرانی انجام می‌شود. نوع‌های قراردادی عبارت‌اند از `SALE_GROSS`، `COMMISSION`، `REFUND`، `ADJUSTMENT`، `MERCHANT_PAYABLE`، `SETTLEMENT` و `REVERSAL`.

هر رکورد reference یکتا، organization، currency، status و در صورت وجود order/booking/settlement مرجع دارد. حذف منابع مرجع با وجود دفترکل محدود می‌شود تا تاریخچه شکسته نشود.

## SettlementBatch

وضعیت‌ها: `DRAFT → READY → APPROVED → PROCESSING → PAID` و شاخه‌های کنترل‌شده `FAILED` یا `CANCELLED`. transition مستقیم یا بازگشت از `PAID` مجاز نیست.

فرمول:

`payable = max(0, gross - commission - refund + adjustment)`

مانده منفی به‌عنوان `carryForwardAmount` محاسباتی نگه داشته می‌شود و نباید با payout منفی نمایش داده شود. seed شامل دادهٔ مصنوعی است و عبارت `DEMO-NO-BANK-TRANSFER` صراحتاً انتقال واقعی نیست.

این فاز هیچ اتصال بانکی، payout، ERP یا تأیید مالی واقعی ندارد.

