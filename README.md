# کی‌آشی — پلتفرم سفر فارسی

کی‌آشی یک محصول سفر راست‌به‌چپ با جست‌وجو و رزرو نمایشی پرواز، هتل، تور، زیارت و سرویس‌های مکمل است. PostgreSQL منبع حقیقت runtime است؛ MemoryStore از اجرای برنامه حذف شده و فقط فیک‌های صریح برای unit testهای مستقل مجازند.

## پشتهٔ فنی

- وب: React 18، Vite، TypeScript، React Router، Tailwind و Radix UI
- API: Node.js 20، Fastify، Zod، Pino و cookie session امن
- داده: PostgreSQL 16، Prisma و migrationهای نسخه‌گذاری‌شده
- پرداخت: mock provider با settlement تراکنشی؛ هیچ درگاه یا supplier واقعی وصل نیست
- آزمون: Vitest، Testing Library، Playwright و تست integration با PostgreSQL

## اجرای محلی

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:migrate:deploy
npm run db:seed

# ترمینال اول
npm run dev:api
# ترمینال دوم
npm run dev:web
```

وب روی `http://localhost:8080` و API روی `http://localhost:8787` اجرا می‌شوند. API بدون اتصال PostgreSQL بالا نمی‌آید و هیچ fallback خاموشی به حافظه ندارد. مسیرهای `/health/live` و `/health/ready` به‌ترتیب زنده‌بودن process و دسترسی دیتابیس را گزارش می‌کنند.

متغیرهای محیطی در `.env.example` هستند: `DATABASE_URL`، `DATABASE_URL_TEST`، `API_PORT`، `WEB_ORIGIN`، `VITE_API_URL`، `SESSION_TTL_HOURS` و `NODE_ENV`. فرانت تمام عملیات احراز هویت، حساب، checkout، پرداخت، سفارش، کیف پول، پیگیری، پشتیبانی، ویزا و استرداد را از API می‌خواند؛ `VITE_API_URL` در توسعه روی `http://localhost:8787` است.

## Runtime و امنیت

`server/app.ts` فقط controller است و عملیات دامنه را به `PrismaRuntimeRepository` می‌سپارد. یک PrismaClient در `server/db/prisma.ts` ساخته می‌شود و در shutdown با graceful disconnect بسته می‌شود. OTP، user، session، checkout، order، payment، wallet، ledger، refund، passenger، favorite، notification، support و visa همگی در PostgreSQL ذخیره می‌شوند.

session یک token تصادفی opaque در cookie `HttpOnly` است و فقط SHA-256 آن در دیتابیس ذخیره می‌شود. OTP hash شده، دو دقیقه معتبر، تک‌مصرف، پنج‌تلاشی و دارای throttle درخواست است. هیچ OTP، token، کارت، CVV، شماره ملی یا پاسپورت log نمی‌شود.

checkout فقط `CheckoutSession` می‌سازد. order پس از settlement موفق ساخته می‌شود و snapshotهای buyer، traveler، service، pricing و payment را immutable نگه می‌دارد. payment finalization در یک transaction Prisma انجام می‌شود: اعتبارسنجی checkout، محاسبه split، debit کیف پول، ledger، payment، transaction، order، notification و تکمیل checkout.

## پول و پرداخت

واحد canonical داخلی backend `TOMAN` است و amountهای API، دیتابیس، wallet و transaction بر حسب تومان صحیح هستند. بعضی catalogهای static قدیمی فرانت هنوز برای نمایش mock مقدار `IRR` دارند و تا cutover کامل catalog به‌عنوان دادهٔ غیر authoritative نگه داشته شده‌اند. مرز درگاه آینده در [money.ts](/home/mohamadreza-azizi/Downloads/kiashi/remix-of-travel-guide-blog/server/domain/money.ts) با `toGatewayRial` و `fromGatewayRial` جدا شده است.

روش‌های domain فعلی: `online_mock`، `wallet`، `combined`، `installment_mock`، `organizational_credit_mock` و `voucher_mock`. هیچ‌کدام provider واقعی نیستند. idempotency با unique constraint دیتابیس روی `(checkoutSessionId, idempotencyKey)` و transaction ایزوله تضمین می‌شود. order number هم با `OrderCounter` به شکل concurrency-safe مثل `KIA-2026-000001` تولید می‌شود.

کاربر seed شده `09121234567` و کیف پول او `4,250,000 TOMAN` است.

## APIهای اصلی

- `/api/auth/*`: OTP، session، profile
- `/api/checkout/sessions`: ساخت checkout و پرداخت
- `/api/account/orders`, `passengers`, `wallet`, `refunds`, `favorites`, `notifications`, `support`, `visa-applications`
- `/api/order-tracking`: شناسهٔ order/tracking/payment reference به‌همراه mobile؛ پاسخ فقط اطلاعات masked و summary است

مسیرهای قدیمی order/wallet برای سازگاری نگه داشته شده‌اند. tracking فقط با mobile خریدار جواب می‌دهد و شمارهٔ موبایل را mask می‌کند. login با mobile منطبق، order مهمانِ همان mobile را claim می‌کند؛ order دارای مالک هرگز reassigned نمی‌شود.

سرویس‌های فعال backend: `flight`, `hotel`, `tour`, `ziyarat`, `train`, `bus`, `insurance`, `cip`, `transfer`. eSIM، Fast Track و city-tour در این فاز request-only هستند و order قابل settlement ندارند.

## Migration و تست PostgreSQL

Migration در `prisma/migrations/` commit شده است؛ برای محیط واقعی از `npm run db:migrate:deploy` استفاده کنید، نه `db push`. CI یک PostgreSQL service جدا بالا می‌آورد، migration را اعمال می‌کند و `npm run test:api` را با `DATABASE_URL_TEST` اجرا می‌کند. تست integration شامل session بعد از restart app، persistence checkout/order/wallet، idempotency، ownership و tracking با mobile اشتباه است.

```bash
npm run dev:web
npm run dev:api
npm run build:web
npm run build:api
npm run lint
npm test -- --run
npm run test:api -- --run
npm run test:e2e
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

## مالکیت داده در فرانت

session با cookie امن `HttpOnly` بازیابی می‌شود و هیچ token یا user session در storage مرورگر نوشته نمی‌شود. صفحات account، سفارش‌ها، کیف پول، مسافران، علاقه‌مندی‌ها، اعلان‌ها، پشتیبانی، ویزا و استرداد مستقیماً API-backed هستند. checkout در مرحله پرداخت یک session سروری می‌سازد و نتیجه پرداخت و سفارش را فقط از پاسخ backend نمایش می‌دهد. `sessionStorage` صرفاً برای draft رزرو و challenge کوتاه‌عمر OTP استفاده می‌شود؛ `localStorage` فقط برای جست‌وجوی اخیر و recently viewed غیرحساس باقی مانده است.

## وضعیت و محدودیت‌ها

داده‌های پیشنهاد، ظرفیت، پیامک، پرداخت، installment، organizational credit و همهٔ supplierها mock هستند. پنل ادمین، settlement واقعی، webhook و provider integration ساخته نشده‌اند. localStorage فقط برای searchهای اخیر، recently viewed، ترجیحات UI و cache غیرحساس فرم مجاز است؛ سفارش، پرداخت، wallet، auth و داده‌های حساب browser-owned نیستند.

CI در [.github/workflows/ci.yml](/home/mohamadreza-azizi/Downloads/kiashi/remix-of-travel-guide-blog/.github/workflows/ci.yml) نصب، generate، migration، typecheck، build، lint، unit و PostgreSQL integration test را اجرا می‌کند.
