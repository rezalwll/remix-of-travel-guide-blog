# گواهی آمادگی انتشار فاز ۲۶

تاریخ اجرای baseline: ۱۴۰۵/۰۷/۱۳ (2026-10-05). HEAD اولیه `985d603cf383b072850a74dd2cf5d541b1cdd0c1` روی `main` و working tree در شروع پاک بود. workflow همان HEAD در GitHub Actions با run `37235851274` شکست خورده بود؛ تمام مراحل پیش از `Production topology, SEO and Playwright certification` پاس شده بودند و شکست نهایی به E2E ناپایدار بازتولید شد.

## نتیجه و اصلاحات

- اجرای clean install، ۹ migration، seed مصنوعی، typecheck، build وب/API، lint، ۱۶۸ unit و ۱۱۰ API test و ۱۸ provider test موفق بود.
- SEO روی production preview شامل ۵۰ metadata record، ۵۰ صفحهٔ محتوایی، ۸۴ URL sitemap و crawl تعداد ۲۱۰ صفحه پاس شد. هفت صفحهٔ قاره فقط هشدار محتوای کم‌حجم دارند و blocker نیستند.
- E2Eهای طولانیِ دارای چند ده navigation به تست‌های مستقل route/viewport تقسیم شدند، navigationهای حساس با `domcontentloaded` پایدار شدند و journeyهای stateful API فقط یک‌بار در Chromium اجرا می‌شوند. پوشش responsive مستقل روی 320 تا 1440 پیکسل باقی مانده است.
- image وب از wrapper کنترل‌شده برای standalone server استفاده می‌کند؛ SIGTERM به فرزند Next.js منتقل می‌شود و پس از shutdown سالم exit code صفر ثبت می‌شود. CI exit code وب و API را صریح گزارش می‌کند.
- `db:backup` برای URL استاندارد Prisma دارای `?schema=public` خراب بود؛ اسکریپت اکنون URL را اعتبارسنجی و پارامتر مختص Prisma را پیش از `pg_dump` حذف می‌کند. dump واقعی ساخته، در DB تصادفی restore، ۴۹ جدول/داده و تراز wallet بررسی و DB موقت حذف شد.
- `tailwindcss-animate` از dependency زمان اجرا به devDependency منتقل شد، چون فقط در build CSS مصرف می‌شود. audit با `--force` یا ارتقای major کور انجام نشده است.

## ماتریس فرمان انتشار

| فرمان | نتیجهٔ محلی | توضیح |
|---|---|---|
| `npm ci` | PASS | 839 package؛ میزبان محلی npm 9 دارد، در حالی که release به npm 10 نیاز دارد |
| `npm run db:generate` | PASS | Prisma client ساخته شد |
| `npm run db:migrate:deploy` | PASS | ۹ migration، بدون pending |
| `npm run db:seed` | PASS | داده‌ها و حساب‌ها مصنوعی و idempotent |
| `npm run typecheck:web` | PASS | بدون خطا |
| `npm run build:web` | PASS | standalone production build |
| `npm run build:api` | PASS | TypeScript API artifact |
| `npm run lint` | PASS | بدون خطا |
| `npm test -- --run` | PASS | ۱۶۸ تست در ۳۱ فایل |
| `npm run test:api -- --run` | PASS | ۱۱۰ تست در ۱۸ فایل؛ PostgreSQL واقعی |
| `npm run test:providers` | PASS | ۱۸ تست در ۲ فایل |
| `provider:status` / `provider:check` | PASS | ۱۰ provider سالم، همگی sandbox/mock/development |
| چهار فرمان SEO | PASS | metadata/check/links/crawl؛ جزئیات بالا |
| `npm run test:e2e` | PASS پس از اصلاح | ۵۶ پاس، ۱۲ skip هدفمند؛ suite کامل Chromium و Pixel 7 و matrix مستقل عرض‌ها |
| `npm run release:check` | PASS با toolchain release | Node 20/npm 10 و DB readiness/migration status؛ npm 9 میزبان عمداً fail می‌شود |
| `npm run db:backup` | PASS | dump سفارشی 213799 بایت در اجرای certification |
| `npm run db:restore:verify` | PASS | restore ایزوله و cleanup موفق |
| `npm run ops:health` | PASS | live/ready/version/providers همگی 200 |

Docker daemon برای کاربر محیط محلی قابل دسترسی نبود (`/var/run/docker.sock: permission denied`)؛ بنابراین build سه image، TLS proxy و production topology باید و فقط باید توسط workflow همان commit نهایی تأیید شوند. این محدودیت محیط است، نه مجوزی برای حذف کنترل Docker از CI.

## ماتریس پیکربندی production

| مؤلفه | حالت فعلی | env/secret لازم | موجود؟ | health و fail-closed | اقدام پیش از go-live واقعی |
|---|---|---|---|---|---|
| Web | Next standalone | `SITE_URL`, `API_INTERNAL_URL`, release metadata؛ بدون secret مرورگر | template موجود | `/healthz`؛ URL نامعتبر build/start را متوقف می‌کند | دامنه و TLS واقعی |
| API | Fastify، single replica | `DATABASE_URL`, `WEB_ORIGIN`, `API_PUBLIC_URL`, `TRUST_PROXY`, release metadata | template موجود | live/ready/version؛ production config ناقص fail می‌شود | secret manager و ظرفیت‌سنجی |
| PostgreSQL | DB خارجی | credential DB و admin URL جدا فقط برای restore drill | محلی/CI موجود | readiness و migration status fail-closed | backup retention و restore drill دوره‌ای |
| Reverse proxy | Nginx/TLS | certificate/key و upstreamهای داخلی | فقط نمونه/CI | `nginx -t` و health compose | certificate و IP/CIDR واقعی proxy |
| Payment | `mock` / `sandbox` | real adapter، merchant credential، callback secret | خیر | mock صریح؛ real ناقص fail-closed | قرارداد، credential، callback certification |
| SMS | `development` / `sandbox` | real adapter، API key و template تأییدشده | خیر | status redacted؛ real ناقص fail-closed | قرارداد و sender/template واقعی |
| Travel providers | `mock` / `sandbox` | adapter/URL/credential مجزای flight، hotel، train، bus، insurance، CIP، transfer و visa | خیر | optional health؛ هیچ fallback پنهان به mock نیست | قرارداد، sandbox و certification هر تأمین‌کننده |

## امنیت، داده و ریسک پذیرفته‌شده

Cookie نشست HttpOnly، SameSite=Lax و در production دارای Secure است. session expiry/revocation، rate limit OTP، ownership مشتری، tenant/capability checks، CSRF/same-origin پنل، immutable audit/ledger، قیود settlement و redaction اطلاعات پرداخت/PII/secret در تست‌های API پوشش دارند. endpoint سلامت فقط metadata امن را برمی‌گرداند. `TRUST_PROXY` پیش‌فرض امن و در production allow-list صریح است.

Dependency audit کامل در snapshot این release ۱۲ advisory سطح high در زنجیرهٔ build/dev tooling گزارش کرد؛ `npm audit --omit=dev` پس از جداسازی plugin زمان build فقط ۳ مورد وابسته به Prisma CLI/config گزارش می‌کند. critical یا exploit شناخته‌شده در runtime سرویس مشاهده نشد. رفع پیشنهادی npm شامل force و تغییر ناسازگار Prisma است و بدون regression جامع اعمال نشده. engine هشدار `cookie@2.0.1` (وابستگی transitively از Fastify) با Node 20 در build و API suite فعلی بدون شکست کار می‌کند، اما باید در چرخهٔ dependency maintenance و پیش از ارتقای Node بازبینی شود.

Seed فقط فرمان دستی است، در startup production اجرا نمی‌شود و `ENABLE_DEMO_SEED=true` در release check تولید رد می‌شود. نام‌ها، شناسه‌ها، inventory و قیمت‌ها نمایشی‌اند و نباید دادهٔ مشتری یا credential واقعی به seed افزوده شود.

## مسیرها، schema و عملیات

منبع مسیرهای UI خود App Router/legacy manifest و منبع API registrationهای Fastify است؛ sitemap و noindex با scriptهای SEO از همان برنامه بررسی می‌شوند. مسیرهای حذف‌شدهٔ `city-tours`، `esim` و `fast-track` route قابل دسترسی ندارند. private customer، merchant و backoffice به‌ترتیب auth، capability و permission checks دارند.

migration history از DB واقعی اعمال شد. restore فهرست ۴۹ جدول، FKها، uniqueها، indexهای tenant/operation و triggerهای append-only را تأیید کرد؛ قیود inventory هتل و snapshot مالی نیز حاضرند. تغییری با `db push` انجام نشد.

Rollback کد فقط با schema backward-compatible مجاز است. پیش از migration backup بگیرید، health و smoke را بعد از deploy اجرا کنید و در شکست ناسازگار از forward-fix یا restore تأییدشده استفاده کنید؛ restore خودکار روی DB فعال ممنوع است.

## وضعیت انتشار

این repository فقط برای انتشار مهندسی با providerهای mock/sandbox آماده می‌شود. payment، SMS و travel واقعی تا دریافت قرارداد/credential، certification callback و اجرای دوبارهٔ همین گواهی blocker عمومی go-live هستند. rate limit حافظه‌ای نیز deployment را به یک replica محدود می‌کند. نتیجهٔ قطعی Docker و CI در run مربوط به commit نهایی ثبت می‌شود.
