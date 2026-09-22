# معماری فرانت‌اند Next.js

## مرزها

فرانت production روی Next.js App Router و React اجرا می‌شود. Fastify همچنان backend authoritative برای session، checkout، payment، order، wallet، refund، booking، reconciliation و providerهاست؛ PostgreSQL source of truth است. هیچ domain logic تراکنشی به Next منتقل نشده است.

مرورگر فقط URLهای same-origin زیر `/api` را صدا می‌زند و cookie امن HttpOnly خود را ارسال می‌کند. Nginx `/api/*` و `/health/*` را به Fastify می‌فرستد. Next برای درخواست server-side احتمالی از `API_INTERNAL_URL` خصوصی استفاده می‌کند؛ این متغیر و سایر secretها هرگز `NEXT_PUBLIC_*` نیستند.

## Server و Client Components

layout، metadata، sitemap/robots، خانه، صفحات مقصد/مسیر/هتل شهری/blog و breadcrumb به‌طور پیش‌فرض Server Component هستند. Search widget، filter، فرم، auth/account، checkout/payment، dialog/toast و state تعاملی Client Component هستند. `LegacyPage` مسیرهای تراکنشی حفظ‌شده را lazy-load می‌کند تا dependencyهای checkout وارد bundle اولیهٔ صفحات SEO نشوند.

React Query برای server state تعاملی و cache مرورگر باقی مانده است. محتوای عمومی SEO از مدل server-safe و cache/ISR خود Next استفاده می‌کند. AuthProvider فقط UX را هماهنگ می‌کند؛ security boundary همان Fastify و ownership checkهای backend است و token در localStorage قرار نمی‌گیرد.

## cache و runtime

- خانه و destination/blog: ISR روزانه
- route/hotel editorial: ISR دوازده‌ساعته
- static service/legacy bounded routes: SSG
- search، order runtime و health: dynamic
- account، checkout، payment و auth: noindex و بدون cache عمومی personalized

ساخت production از `output: standalone` استفاده می‌کند و `SITE_URL` باید هم به build و هم runtime داده شود. topology برابر است با `Nginx → Next/Fastify → PostgreSQL`. target وب Docker با کاربر non-root اجرا می‌شود، health مستقل `/healthz` دارد و filesystem آن read-only با tmpfs cache است. Nginx فقط `/_next/static` را immutable cache می‌کند و HTML SSR یا API را blanket-cache نمی‌کند.

## توسعه و تغییرات آینده

`npm run dev` وب و API را هم‌زمان بالا می‌آورد؛ همچنین `dev:web` و `dev:api` مستقل موجودند. برای content جدید ابتدا مدل تایپ‌شده، کیفیت indexability، metadata، internal link و test HTML خام اضافه شود. دادهٔ تجاری schema فقط بعد از اتصال provider واقعی فعال شود.
