# معماری پایهٔ Backoffice و Merchant

## مرزهای سامانه

- Next.js App Router فقط UI مشتری، backoffice و merchant را ارائه می‌کند.
- Fastify مرجع احراز هویت، مجوز، جداسازی tenant و قراردادهای API است.
- Prisma/PostgreSQL مرجع سفارش، پرداخت، رزرو، سازمان، دفترکل و audit است.
- نشست فعلی `User` و `AuthSession` حفظ شده است؛ هویت جداگانه‌ای برای کارمند یا پذیرنده ساخته نشده است.
- UI مشتری و مسیرهای رزرو/پرداخت تغییر معماری نداده‌اند.

## موجودیت‌های مرجع

موجودیت‌های قبلی شامل `User`، `AuthSession`، `CheckoutSession`، `Order`، `PaymentAttempt`، `PaymentIntent`، `Transaction`، `Wallet`، `RefundRequest`، `SupportTicket`، `VisaApplication` و `BookingAttempt` هستند.

پایهٔ پلتفرم این موجودیت‌ها را اضافه می‌کند:

- `Organization`: مرز سازمانی با نوع‌های `KIASHI_INTERNAL`، `MERCHANT`، `SUPPLIER` و `PARTNER`.
- `MerchantProfile`: وضعیت onboarding، قرارداد، تسویه و نوع کسب‌وکار.
- `OrganizationMembership`: اتصال چندبه‌چند کاربر و سازمان.
- `Role`، `Permission`، `RolePermission` و `MembershipRole`: RBAC بدون `user.role`.
- `AuditLog`: رخداد append-only عملیات حساس.
- `CommissionRule`، `MerchantLedgerEntry` و `SettlementBatch`: پایهٔ مالی پذیرنده.
- `MerchantDocument`: فقط metadata سند خصوصی؛ در این فاز فایل عمومی یا KYC واقعی وجود ندارد.

`Order` و `BookingAttempt` دو انتساب اختیاری `merchantOrganizationId` و `supplierOrganizationId` دارند. سفارش‌های قبلی می‌توانند `null` باقی بمانند.

## جریان دسترسی

1. cookie نشست HttpOnly هویت `User` را مشخص می‌کند.
2. API عضویت فعال را از دیتابیس می‌خواند.
3. نقش‌های همان عضویت و همان scope خوانده می‌شوند.
4. مجوزهای نقش در Fastify بررسی می‌شوند.
5. query منابع merchant از ابتدا با `organizationId` محدود می‌شود.

هدر `X-Organization-Id` فقط عضویت فعال کاربر را انتخاب می‌کند و هرگز به‌تنهایی مجوز نمی‌دهد.

## namespaceهای API

Backoffice:

- خواندن: `/api/backoffice/me`، `dashboard/summary`، `orders`، `payments`، `refunds`، `support`، `merchants`، `audit` و `reports/summary`.
- تغییرات کنترل‌شده: ایجاد/ویرایش merchant، عضویت و نقش، مجوز نقش، تعدیل مالی، وضعیت تسویه، override رزرو، وضعیت استرداد و پشتیبانی.

Merchant:

- خواندن: `/api/merchant/me`، `dashboard/summary`، `orders`، `bookings`، `finance/summary`، `settlements`، `team` و `profile`.
- تغییرات کنترل‌شده: پروفایل خود سازمان و نقش اعضای همان سازمان.

## UI و انتشار

پوسته‌های حداقلی در `/backoffice/*` و `/merchant/*` قرار دارند. داده فقط پس از پاسخ موفق API نمایش داده می‌شود. این مسیرها `noindex,nofollow`، خارج از sitemap و دارای `private, no-store` هستند. امنیت متکی به Fastify است، نه robots یا مخفی‌کردن لینک.

در development هر دو پنل فعال‌اند. در production متغیرهای `BACKOFFICE_ENABLED=true` و `MERCHANT_PORTAL_ENABLED=true` باید صریح تنظیم شوند؛ در غیر این صورت API با 404 fail-closed می‌شود.

## محدودیت‌های عمدی این فاز

- درگاه پرداخت، پیامک، تأمین‌کننده، KYC، ذخیره فایل سند و payout بانکی واقعی اضافه نشده است.
- dashboard نهایی، نمودارها، export و مدیریت inventory به فازهای بعد تعلق دارند.
- تست‌های DB به PostgreSQL مهاجرت‌داده‌شده نیاز دارند؛ نبود دیتابیس باعث skip شفاف می‌شود، نه نتیجهٔ سبز کاذب.

