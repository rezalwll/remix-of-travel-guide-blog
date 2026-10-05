# راهنمای استقرار و عملیات

## معماری

`Internet → Nginx/TLS → Next.js web + Fastify API → PostgreSQL`. فایل `Dockerfile` targetهای مستقل `web`، `api` و `proxy` می‌سازد؛ image وب خروجی standalone خود Next.js را اجرا می‌کند و به build محلی میزبان وابسته نیست. `docker-compose.production.example.yml` یک PostgreSQL و استقرار نمونهٔ cloud-vendor-neutral ارائه می‌دهد. این طراحی برای یک replica ساده است؛ در چند replica باید rate limit مشترک و یک pooler مدیریت‌شده در سطح زیرساخت انتخاب شود.

## محیط‌ها و secrets

- development: `.env.example`، mock/sandbox، seed دستی و cookie توسعه.
- test: PostgreSQL جدا، migration deploy و providerهای mock.
- staging: `.env.staging.example`، DB و secret جدا، بدون credential تولید.
- production: `.env.production.example` به‌عنوان template؛ secret واقعی فقط در secret manager محیط است و هرگز commit نمی‌شود.

production برای `DATABASE_URL`، URLهای HTTPS، allow-list صریح `TRUST_PROXY`، metadata انتشار و secret mock payment (در صورت فعال بودن mock) fail-closed است. seed هیچ‌وقت در startup تولید اجرا نمی‌شود.

## ترتیب انتشار

1. CI سبز، audit و بررسی migration.
2. ساخت artifact و ثبت `APP_VERSION`/`GIT_SHA`/`BUILD_TIME`؛ اجرای `RELEASE_CHECK_DATABASE=true npm run release:check` روی runner دارای دسترسی DB، migration status و readiness را هم fail-closed بررسی می‌کند.
3. backup با `npm run db:backup` و بررسی فضای restore.
4. اجرای `npm run db:migrate:deploy`؛ هرگز `db:migrate` در production.
5. اجرای نسخهٔ جدید و بررسی `/health/live` و `/health/ready`.
6. cutover در reverse proxy، سپس smoke تست auth، search، checkout sandbox و provider status.
7. پایش logها و backlogهای reconciliation.

## migration و rollback

برای تغییرهای حساس از الگوی expand → deploy کد سازگار → backfill محدود و قابل تکرار → cutover → contract استفاده کنید. migrationهای destructive یا دارای lock طولانی باید جداگانه review شوند. rollback کد فقط تا زمانی امن است که schema backward-compatible باشد؛ بعد از migration ناسازگار، forward-fix و restore بررسی‌شده تنها راه است.

## backup و restore

`DATABASE_URL=... BACKUP_DIR=... npm run db:backup` با `pg_dump --format=custom` فایل timestamped می‌سازد و credential را چاپ نمی‌کند. پارامتر Prisma یعنی `schema` پیش از فراخوانی ابزار PostgreSQL حذف می‌شود. برای آزمون، `BACKUP_FILE=... RESTORE_ADMIN_DATABASE_URL=... npm run db:restore:verify` را اجرا کنید. اتصال admin باید به DB نگهداری مانند `postgres` اشاره کند و نباید همان `DATABASE_URL` فعال باشد. script یک database با نام تصادفی می‌سازد، restore و integrity check را انجام می‌دهد و در `finally` آن را حذف می‌کند؛ فقط برای بررسی دستی می‌توان `RESTORE_VERIFY_KEEP=true` داد.

baseline عملیاتی: backup منطقی روزانه، backup پیش از migration، retention قابل تنظیم، نگهداری رمزنگاری‌شدهٔ خارج از این repository و restore drill دوره‌ای.

## اتصال PostgreSQL

هر process یک PrismaClient singleton دارد و در shutdown disconnect می‌شود. برای یک replica، connection limit را با ظرفیت PostgreSQL و تعداد workerها هماهنگ کنید؛ در چند replica، سقف مجموع connectionها و نیاز به pooler مدیریت‌شده را پیش از scale بررسی کنید. pooler جدیدی در این فاز اضافه نشده است.

## health، logs و shutdown

- `/health/live`: فقط زنده بودن process.
- `/health/ready`: اتصال PostgreSQL را بررسی می‌کند.
- `/health/version`: فقط version، SHA و زمان build.
- `/api/health/providers`: وضعیت safe providerها، بدون secret و URL خصوصی.

Fastify با Pino JSON، request id، route، status و duration log می‌کند و authorization، cookie، token، OTP، secret، passport، nationalId و دادهٔ پرداخت را redact می‌کند. SIGTERM/SIGINT ابتدا پذیرش کار جدید را متوقف می‌کند، سپس Fastify و Prisma را حداکثر طی ۱۰ ثانیه می‌بندد.

## proxy، cache و TLS

`ops/nginx.example.conf` فقط نمونه است: HTTP به HTTPS redirect، HSTS و CSP/security header، forwarding header، body limit، gzip، cache immutable برای `/assets/` و no-store برای API/health/auth/payment callback. `TRUST_PROXY` باید IP/CIDR دقیق proxyهایی باشد که headerهای forwarded را overwrite می‌کنند؛ compose نمونه برای این کار subnet ثابت دارد.

در production فرانت از same-origin مسیر `/api` استفاده می‌کند و `API_INTERNAL_URL` فقط برای rewrite داخلی Next.js به Fastify است. secret نباید با متغیرهای عمومی وارد bundle مرورگر شود. image وب خروجی standalone Next.js را اجرا می‌کند و TypeScript server نیز source map عمومی منتشر نمی‌کند؛ stack کامل فقط در log داخلی محیط اجرا می‌ماند.

## reconciliation و scheduler

`reconcile:payments` و `reconcile:bookings` را با cron یا scheduler vendor-neutral اجرا کنید؛ هر run یک run id داشته باشد، batch محدود و overlap-safe باشد و exit code خطا را منتقل کند. اجرای هم‌زمان با idempotency keyهای DB همگرا می‌شود. rate limit فعلی process-local است: برای یک replica مناسب است و در چند replica globally consistent نیست؛ Redis در این فاز اضافه نشده است.

## failure drills

DB unavailable باید readiness را 503 کند؛ provider unavailable باید safe provider error بدهد؛ env ناقص production باید قبل از start fail شود؛ mock payment و provider stub در production endpoint فعال ندارند؛ SIGTERM باید بدون قطع ناگهانی Prisma خارج شود. جزئیات checklist در `docs/production-checklist.md` است.

گواهی command-by-command آخرین release، محدودیت‌های محیط و ماتریس production در `docs/phase-26-release-readiness.md` ثبت می‌شود. Docker certification باید شامل build targetهای `web`، `api` و `proxy`، `nginx -t`، same-origin `/api`، static assets و smoke مسیرهای customer/merchant/backoffice باشد.
