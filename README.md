# کی‌آشی — پلتفرم سفر فارسی

کی‌آشی یک محصول سفر راست‌به‌چپ با جست‌وجو و رزرو نمایشی پرواز، هتل، تور، زیارت و سرویس‌های مکمل است. PostgreSQL منبع حقیقت runtime است؛ MemoryStore از اجرای برنامه حذف شده و فقط فیک‌های صریح برای unit testهای مستقل مجازند.

## پشتهٔ فنی

- وب: React 18، Vite، TypeScript، React Router، Tailwind و Radix UI
- API: Node.js 20، Fastify، Zod، Pino و cookie session امن
- داده: PostgreSQL 16، Prisma و migrationهای نسخه‌گذاری‌شده
- پرداخت و رزرو: لایهٔ provider با پیاده‌سازی mock؛ هیچ درگاه یا supplier واقعی وصل نیست
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

متغیرهای محیطی در `.env.example` هستند: `DATABASE_URL`، `DATABASE_URL_TEST`، `API_PORT`، `API_PUBLIC_URL`، `WEB_ORIGIN`، `VITE_API_URL`، `SESSION_TTL_HOURS`، `TRUST_PROXY` و `NODE_ENV`. `TRUST_PROXY` فقط پشت reverse proxy مورد اعتماد فعال می‌شود. فرانت تمام عملیات احراز هویت، حساب، checkout، پرداخت، سفارش، کیف پول، پیگیری، پشتیبانی، ویزا و استرداد را از API می‌خواند؛ Vite در توسعه `/api` را به API محلی proxy می‌کند.

## Runtime و امنیت

`server/app.ts` فقط controller است و عملیات دامنه را به `PrismaRuntimeRepository` می‌سپارد. یک PrismaClient در `server/db/prisma.ts` ساخته می‌شود و در shutdown با graceful disconnect بسته می‌شود. OTP، user، session، checkout، order، payment، wallet، ledger، refund، passenger، favorite، notification، support و visa همگی در PostgreSQL ذخیره می‌شوند.

session یک token تصادفی opaque در cookie `HttpOnly` است و فقط SHA-256 آن در دیتابیس ذخیره می‌شود. OTP hash شده، دو دقیقه معتبر، تک‌مصرف، پنج‌تلاشی و دارای throttle درخواست است. هیچ OTP، token، کارت، CVV، شماره ملی یا پاسپورت log نمی‌شود.

checkout فقط `CheckoutSession` می‌سازد. order پس از settlement موفق ساخته می‌شود و snapshotهای buyer، traveler، service، pricing و payment را immutable نگه می‌دارد. payment finalization در یک transaction Prisma انجام می‌شود: اعتبارسنجی checkout، محاسبه split، debit کیف پول، ledger، payment، transaction، order، notification و تکمیل checkout.

## پول و پرداخت

واحد canonical داخلی backend `TOMAN` است و amountهای API، دیتابیس، wallet و transaction بر حسب تومان صحیح هستند. بعضی catalogهای static قدیمی فرانت هنوز برای نمایش mock مقدار `IRR` دارند و تا cutover کامل catalog به‌عنوان دادهٔ غیر authoritative نگه داشته شده‌اند. مرز درگاه آینده در [money.ts](server/domain/money.ts) با `toGatewayRial` و `fromGatewayRial` جدا شده است.

روش‌های domain فعلی: `online_mock`، `wallet`، `combined`، `installment_mock`، `organizational_credit_mock` و `voucher_mock`. هیچ‌کدام provider واقعی نیستند. idempotency با unique constraint دیتابیس روی `(checkoutSessionId, idempotencyKey)` و transaction ایزوله تضمین می‌شود. order number هم با `OrderCounter` به شکل concurrency-safe مثل `KIA-2026-000001` تولید می‌شود.

کاربر seed شده `09121234567` و کیف پول او `4,250,000 TOMAN` است.

## APIهای اصلی

- `/api/auth/*`: OTP، session، profile
- `/api/checkout/sessions`: ساخت checkout و پرداخت
- `/api/account/orders`, `passengers`, `wallet`, `refunds`, `favorites`, `notifications`, `support`, `visa-applications`
- `/api/order-tracking`: شناسهٔ order/tracking/payment reference به‌همراه mobile؛ پاسخ فقط اطلاعات masked و summary است

مسیرهای قدیمی order/wallet برای سازگاری نگه داشته شده‌اند. tracking فقط با mobile خریدار جواب می‌دهد و شمارهٔ موبایل را mask می‌کند. login با mobile منطبق، order مهمانِ همان mobile را claim می‌کند؛ order دارای مالک هرگز reassigned نمی‌شود.

سرویس‌های فعال backend: `flight`, `hotel`, `tour`, `ziyarat`, `train`, `bus`, `insurance`, `cip`, `transfer`. eSIM، Fast Track و city-tour در این فاز request-only هستند و order قابل settlement ندارند.

## معماری provider (فاز ۱۵)

مسیر عملیات `API → Payment/Sms/BookingService → interface → mock adapter` است. رجیستری در `server/providers/registry.ts` از متغیرهای `SMS_PROVIDER=development`، `PAYMENT_PROVIDER=mock` و `FLIGHT/HOTEL/TRAIN/BUS/INSURANCE/CIP/TRANSFER/VISA_PROVIDER=mock` انتخاب می‌کند و مقدار ناشناخته را در شروع برنامه رد می‌کند. هنوز adapter واقعی وجود ندارد. `PROVIDER_TIMEOUT_MS` حد زمان هر عملیات است؛ خطاهای timeout و unavailable به کدهای پایدار API تبدیل می‌شوند. log ساختاریافته فقط `requestId`، نام provider، operation، مدت و status را ثبت می‌کند، نه OTP، token، مشخصات مسافر یا payload پرداخت.

- SMS: `SmsProvider.send/checkStatus`، `DevelopmentSmsProvider` و `SmsService` وجود دارند. OTP از این interface ارسال می‌شود؛ تلاش ارسال پیش از فراخوانی ثبت و نتیجه/خطا در `SmsDeliveryAttempt` پیگیری می‌شود. retry پایه دو تلاش است. در production کد OTP تصادفی است، اما تا اتصال SMS واقعی دریافت آن روی موبایل ممکن نیست.
- پرداخت: `PaymentGateway.createPayment/verifyPayment/refundPayment`، `PaymentIntent`، `PaymentCallback` و `PaymentVerification` وجود دارند. مسیر آمادهٔ اتصال `POST /api/checkout/sessions/:id/payment-intents → redirectUrl → POST /api/payments/callback/:provider → verify → finalize` است. callback به session کاربر وابسته نیست؛ امضای آن بررسی و مالکیت، روش و کلید idempotency از intent ذخیره‌شده استخراج می‌شود و پاسخ آن اطلاعات سفارش را افشا نمی‌کند. پردازش تکراری همان callback دوباره order یا debit نمی‌سازد. صفحهٔ درگاه mock با همان UX فعلی از `payment-intents` و مسیر احرازشدهٔ `/api/payments/mock/:reference/simulate` برای موفق/ناموفق/انصراف استفاده می‌کند؛ مسیر هم‌زمان قدیمی `/payments` برای سازگاری نگه داشته شده است. `API_PUBLIC_URL` باید نشانی عمومی API باشد، نه وب‌سایت. در production mock، `MOCK_PAYMENT_SECRET` خصوصی و حداقل ۳۲ کاراکتری الزامی است.
- سفر: interfaceهای پرواز، هتل، قطار، اتوبوس، بیمه، CIP، ترانسفر و ویزا عملیات `search/validate/revalidate/reserve/confirm/cancel/refund/checkReservation` دارند. پیش از settlement قیمت، ظرفیت و انقضای پیشنهاد دوباره بررسی می‌شود. پس از پرداخت فقط تأیید supplier وضعیت `confirmed` می‌سازد. شکست قطعی رزرو به جبران خودکار می‌رود؛ سهم کیف پول با ledger یکتا و سهم آنلاین با refund دارای idempotency key بازگردانده می‌شود. timeout پس از ارسال درخواست `UNKNOWN` است و به‌جای بازپرداخت عجولانه، `manual_review_required` می‌شود.
- چرخهٔ رزرو با گذارهای مجاز `SEARCHED → SELECTED → PRICE_VALIDATED → RESERVED → CONFIRMED` (و مسیرهای cancel/refund) در `server/domain/booking.ts` تعریف و تست شده است. تور و زیارت هنوز supplier اختصاصی ندارند و با mock داخلی تأیید می‌شوند.

`npm run reconcile:bookings` سفارش‌های حل‌نشده را از provider استعلام می‌کند: نتیجهٔ موفق تأیید، نتیجهٔ قطعی ناموفق جبران، و نتیجهٔ نامشخص بدون تغییر مالی باقی می‌ماند. retryهای transaction سریال‌شونده‌اند و unique keyهای booking/refund/ledger/notification باعث همگرایی پس از crash می‌شوند؛ ادعای exactly-once شبکه‌ای وجود ندارد.

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

session با cookie امن `HttpOnly` بازیابی می‌شود و هیچ token یا user session در storage مرورگر نوشته نمی‌شود. صفحات account، سفارش‌ها، کیف پول، مسافران، علاقه‌مندی‌ها، اعلان‌ها، پشتیبانی، ویزا و استرداد مستقیماً API-backed هستند. علاقه‌مندی‌ها فقط یک authority در React Query/API دارند و cache سراسری دستی حذف شده است. checkout در مرحله پرداخت یک session سروری می‌سازد و نتیجه پرداخت و سفارش را فقط از پاسخ backend نمایش می‌دهد. `sessionStorage` صرفاً برای draft رزرو و challenge کوتاه‌عمر OTP استفاده می‌شود؛ `localStorage` فقط برای جست‌وجوی اخیر و recently viewed غیرحساس باقی مانده است.

## وضعیت و محدودیت‌ها

داده‌های پیشنهاد، ظرفیت، پیامک، پرداخت، installment، organizational credit و همهٔ supplierها mock هستند. پنل ادمین، settlement واقعی و اتصال provider خارجی ساخته نشده‌اند؛ endpoint callback فقط با mock امضاشده کار می‌کند. جبران mock، contract و idempotency لازم را دارد اما تضمین refund واقعی به قابلیت‌های درگاه آینده وابسته است. [گزارش فاز ۱۶](docs/phase-16-reliability.md) موجودی route، معماری، امنیت، dependency audit و محدودیت‌های production را ثبت می‌کند.

CI در [.github/workflows/ci.yml](.github/workflows/ci.yml) نصب، generate، migration، typecheck، build، lint، unit، PostgreSQL integration test و Playwright را اجرا می‌کند.
