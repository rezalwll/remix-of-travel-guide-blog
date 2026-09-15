# کی‌آشی — پلتفرم سفر فارسی

کی‌آشی یک محصول سفر راست‌به‌چپ با جست‌وجو و رزرو نمایشی پرواز، هتل، تور، زیارت و سرویس‌های مکمل است. این مخزن اکنون یک پایهٔ backend قابل اجرا هم دارد تا داده‌های حساس از localStorage جدا شوند و مسیر اتصال به تأمین‌کننده‌های واقعی روشن باشد.

## پشتهٔ فنی

- وب: React 18، Vite، TypeScript، React Router، Tailwind و Radix UI
- API: Node.js 20، Fastify، Zod، Pino و cookie session امن
- داده: PostgreSQL 16، Prisma و migration/seed آماده
- پرداخت: `MockPaymentProvider` در API فعلی؛ هیچ درگاه یا تأمین‌کنندهٔ واقعی وصل نیست
- آزمون: Vitest، Testing Library و Playwright

## اجرای محلی

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed

# ترمینال اول
npm run dev:api
# ترمینال دوم
npm run dev:web
```

وب روی `http://localhost:8080` و API روی `http://localhost:8787` اجرا می‌شوند. اگر PostgreSQL در دسترس نباشد، تست‌های API از `MemoryStore` کنترل‌شده استفاده می‌کنند؛ production نباید بدون اتصال دیتابیس اجرا شود.

متغیرهای محیطی اصلی در `.env.example` هستند: `DATABASE_URL`، `API_PORT`، `WEB_ORIGIN`، `SESSION_TTL_HOURS` و `NODE_ENV`.

## API و امنیت

مسیرهای پایهٔ `/api/auth`، پروفایل، checkout، سفارش، پرداخت idempotent، کیف پول، استرداد و tracking در `server/app.ts` ثبت شده‌اند. OTP در حالت توسعه با کد نمایشی `12345` پاسخ داده می‌شود و در production هرگز برگردانده نمی‌شود. کد OTP هش‌شده، منقضی‌شونده، تک‌مصرف و محدود به پنج تلاش است. session در cookie `HttpOnly` با `SameSite=Lax` نگهداری می‌شود.

قیمت checkout در سرور محاسبه می‌شود، مالکیت سفارش بررسی می‌شود و پرداخت با `idempotencyKey` تکرارپذیر نیست. خطاها شکل یکنواخت `{ error: { code, message } }` دارند و کلاینت typed در `src/services/apiClient.ts` خطاهای در دسترس نبودن API را به `ApiError` تبدیل می‌کند.

کاربر seed شده: `09121234567` با کیف پول `4,250,000` ریال. اطلاعات این محیط demo است.

## فرمان‌های مفید

```bash
npm run dev:web
npm run dev:api
npm run build:web
npm run build:api
npm run lint
npm test -- --run
npm run test:api
npm run test:e2e
npm run db:migrate
npm run db:seed
```

CI در `.github/workflows/ci.yml` نصب با `npm ci`، تولید Prisma، typecheck، lint، تست واحد و build را اجرا می‌کند.

## وضعیت محصول و محدودیت‌ها

صفحات مشتری و مسیرهای اصلی checkout کامل و قابل تست هستند، اما داده‌های پیشنهاد پرواز/هتل، پیامک، پرداخت و ظرفیت هنوز mock هستند. در این فاز پنل ادمین، settlement، webhook و اتصال supplier پیاده‌سازی نشده‌اند. برای اتصال واقعی، interfaceهای provider باید پشت API و بدون ورود secret به کلاینت پیاده‌سازی شوند. localStorage فقط برای ترجیحات UI، جست‌وجوهای اخیر و recently viewed مجاز است؛ منبع حقیقت سفارش و پرداخت API است.

مسیر canonical مقاله‌ها `/blog/:slug` است؛ `/article/:articleId` برای سازگاری قدیمی باقی مانده است.
