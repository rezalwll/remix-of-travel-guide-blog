# نقشه مهاجرت مسیرها به Next.js

این سند وضعیت cutover از React Router/Vite به Next.js App Router را ثبت می‌کند. مسیرهای `SSG/ISR` در HTML اولیه محتوای قابل‌خزش دارند؛ مسیرهای تراکنشی `dynamic/noindex` هستند. پارامترهای `:id` در backend همچنان شناسهٔ authoritative باقی می‌مانند.

| مسیر قدیمی | مسیر نهایی | ایندکس | رندر | تغییر | وضعیت |
|---|---|---:|---|---|---|
| `/` | همان | بله | ISR، ۱ روز | ندارد | منتقل‌شده |
| `/destinations` | همان | بله | ISR | ندارد | منتقل‌شده |
| `/destinations/:continent` و آرشیو کشور | همان | بله | SSG | ندارد | Server Component |
| `/destinations/:continent/:country` | همان | بله | ISR/SSG | ندارد | Server Component |
| `/routes` | همان | بله | SSG | ندارد | Server Component |
| `/routes/:id` | همان | بله | SSG محدود | ندارد | adapter سازگار |
| `/blog` | همان | بله | ISR | ندارد | Server Component |
| `/blog/:slug` | همان | بله | ISR/SSG | ندارد | Server Component |
| `/article/:articleId` | `/blog/:articleId` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/flights` | همان | بله | SSG + client search island | ندارد | Server Component |
| `/flights/:legacy-id` | `/flights/search?...` | خیر | 308 | سازگاری شناسهٔ منقضی | پیاده‌سازی‌شده |
| `/flights/tehran-to-*` | همان | بله | ISR، ۱۲ ساعت | ندارد | صفحهٔ SEO سروری |
| `/flights/search` | همان | خیر | dynamic/client | ندارد | منتقل‌شده |
| `/hotels` | همان | بله | SSG + client search island | ندارد | Server Component |
| `/hotels/kish`, `/mashhad`, `/istanbul` | همان | بله | ISR، ۱۲ ساعت | ندارد | صفحهٔ SEO سروری |
| `/hotels/:stable-slug` | همان | خیر فعلاً | ISR + client detail | ندارد | موجودی نمایشی noindex |
| `/hotels/search` | همان | خیر | dynamic/client | ندارد | منتقل‌شده |
| `/tours`, `/tours/:slug` | همان | فهرست بله، جزئیات خیر | SSG native / client detail | ندارد | فهرست Server Component |
| `/ziyarat`, `/ziyarat/:slug` | همان | فهرست بله، جزئیات خیر | SSG native / client detail | ندارد | فهرست Server Component |
| `/visa`, `/visa/:country` | همان | فهرست بله، کشور فعلاً خیر | SSG native / client detail | ندارد | فهرست Server Component؛ جزئیات تا محتوای منبع‌دار noindex |
| `/visa/:country/apply` | همان | خیر | SSG محدود/client | ندارد | منتقل‌شده |
| `/trains`, `/buses`, `/insurance`, `/cip`, `/transfer` | همان | بله | SSG | ندارد | Server Component |
| `/trains/search`, `/buses/search` | همان | خیر | SSG محدود/client | ندارد | منتقل‌شده |
| `/fast-track`, `/esim`, `/city-tours` | همان | بله | SSG | ندارد | Server Component |
| `/experiences` | `/city-tours` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/transfers` | `/transfer` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/checkout/*`, `/cart` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/orders/:id`, `/account/orders/:id` | همان | خیر | SSR/client | ندارد | منتقل‌شده |
| `/account/*` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/auth/*` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/track-order` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/order-tracking` | `/track-order` | خیر | 308 | دائمی | پیاده‌سازی‌شده |
| `/support` | همان | بله | SSG + client search island | canonical | Server Component |
| `/help`, `/faq` | `/support` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/travel-checklist` | `/travel-preparation` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/about`, `/contact`, `/terms`, `/privacy`, `/refund-policy`, `/licenses`, `/business-travel`, `/club`, `/travel-preparation` | همان | بله | SSG محدود/client | ندارد | منتقل‌شده |

همهٔ مسیرهای شناخته‌شدهٔ catch-all از فهرست داده‌های معتبر در `generateStaticParams` پیش‌ساخته می‌شوند و `dynamicParams = false` باعث می‌شود URL ناشناخته HTTP 404 واقعی بگیرد. صفحات سفارش با شناسهٔ runtime مسیرهای dynamic مستقل دارند و توسط Fastify کنترل مالکیت می‌شوند.
