# نقش‌ها و مجوزها

## اصل تصمیم‌گیری

زنجیرهٔ مجوز همیشه `User → OrganizationMembership → MembershipRole → RolePermission → Permission` است. کاربر مشتری می‌تواند هیچ عضویت سازمانی نداشته باشد. عضویت غیرفعال یا سازمان غیرفعال هیچ دسترسی ایجاد نمی‌کند.

نقش‌های `INTERNAL` فقط روی عضویت سازمان `KIASHI_INTERNAL` و نقش‌های `MERCHANT` فقط روی عضویت merchant پذیرفته می‌شوند. API برای هر درخواست یک permission مشخص می‌خواهد و SUPER_ADMIN نیز از این بررسی مستثنا نیست؛ فقط مجموعهٔ کامل مجوزهای داخلی را دارد.

## نقش‌های داخلی پیش‌فرض

- `SUPER_ADMIN`: تمام مجوزهای `backoffice.*`.
- `OPERATIONS`: dashboard، سفارش، پرداخت خواندنی، پشتیبانی، ویزا، provider، reconciliation، merchant خواندنی و گزارش.
- `FINANCE`: سفارش/پرداخت/استرداد/کیف پول/merchant خواندنی، گزارش و مدیریت عملیات مالی.
- `SUPPORT`: کاربر، سفارش، پرداخت، استرداد، پشتیبانی و ویزا در سطح لازم.
- `ANALYST`: گزارش، audit و داده‌های مالی خواندنی بدون mutation عملیاتی.
- `READONLY`: مجموعهٔ محدود خواندنی.

## نقش‌های merchant پیش‌فرض

- `MERCHANT_OWNER`: تمام مجوزهای `merchant.*`.
- `MERCHANT_MANAGER`: عملیات، مالی، تیم، پروفایل و گزارش.
- `MERCHANT_FINANCE`: dashboard، سفارش خواندنی، مالی، تسویه و گزارش.
- `MERCHANT_OPERATOR`: سفارش، رزرو، مشتری محدود و inventory؛ بدون مالی.
- `MERCHANT_READONLY`: dashboard و مجموعهٔ محدود خواندنی.

## catalog داخلی

`backoffice.dashboard.view`، `users.read/manage`، `orders.read/manage`، `payments.read`، `refunds.read/manage`، `wallets.read`، `support.read/manage`، `visa.read/manage`، `providers.read`، `reconciliation.run`، `merchants.read/manage`، `roles.manage`، `audit.read`، `reports.view` و `finance.view/manage`.

## catalog پذیرنده

`merchant.dashboard.view`، `orders.read`، `bookings.read`، `customers.read_limited`، `inventory.read/manage`، `finance.view`، `settlements.read`، `team.read/manage`، `profile.manage` و `reports.view`.

تعریف اجرایی و seed نقش‌ها در `server/platform/permissions.ts` قرار دارد. تغییر مجوز نقش و تغییر نقش عضویت rate-limit و audit می‌شود.

## کدهای پاسخ

- `401`: نشست معتبر وجود ندارد.
- `403`: هویت معتبر است ولی عضویت یا permission عمومی وجود ندارد.
- `404`: منبع tenant دیگر یا منبعی که وجود آن نباید افشا شود.

