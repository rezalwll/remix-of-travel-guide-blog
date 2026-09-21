# نقشه مهاجرت مسیرها به Next.js

این سند وضعیت cutover از React Router/Vite به Next.js App Router را ثبت می‌کند. مسیرهای `SSG/ISR` در HTML اولیه محتوای قابل‌خزش دارند؛ مسیرهای تراکنشی `dynamic/noindex` هستند. پارامترهای `:id` در backend همچنان شناسهٔ authoritative باقی می‌مانند.

| مسیر قدیمی | مسیر نهایی | ایندکس | رندر | تغییر | وضعیت |
|---|---|---:|---|---|---|
| `/` | همان | بله | ISR، ۱ روز | ندارد | منتقل‌شده |
| `/destinations` | همان | بله | ISR | ندارد | منتقل‌شده |
| `/destinations/:continent` | همان | بله | SSG محدود | ندارد | adapter سازگار |
| `/destinations/:continent/:country` | همان | بله | ISR/SSG | ندارد | Server Component |
| `/routes` | همان | بله | SSG محدود | ندارد | adapter سازگار |
| `/routes/:id` | همان | بله | SSG محدود | ندارد | adapter سازگار |
| `/blog` | همان | بله | ISR | ندارد | Server Component |
| `/blog/:slug` | همان | بله | ISR/SSG | ندارد | Server Component |
| `/article/:articleId` | `/blog/:articleId` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/flights` | همان | بله | SSG | ندارد | adapter سازگار |
| `/flights/tehran-to-*` | همان | بله | ISR، ۱۲ ساعت | ندارد | صفحهٔ SEO سروری |
| `/flights/search` | همان | خیر | dynamic/client | ندارد | منتقل‌شده |
| `/hotels` | همان | بله | SSG | ندارد | adapter سازگار |
| `/hotels/kish`, `/mashhad`, `/istanbul` | همان | بله | ISR، ۱۲ ساعت | ندارد | صفحهٔ SEO سروری |
| `/hotels/:stable-slug` | همان | خیر فعلاً | ISR + client detail | ندارد | موجودی نمایشی noindex |
| `/hotels/search` | همان | خیر | dynamic/client | ندارد | منتقل‌شده |
| `/tours`, `/tours/:slug` | همان | فهرست بله، جزئیات خیر | SSG محدود/client | ندارد | منتقل‌شده |
| `/ziyarat`, `/ziyarat/:slug` | همان | فهرست بله، جزئیات خیر | SSG محدود/client | ندارد | منتقل‌شده |
| `/visa`, `/visa/:country` | همان | بله | SSG محدود/client | ندارد | منتقل‌شده |
| `/visa/:country/apply` | همان | خیر | SSG محدود/client | ندارد | منتقل‌شده |
| `/trains`, `/buses`, `/insurance`, `/cip`, `/transfer` | همان | بله | SSG محدود/client | ندارد | منتقل‌شده |
| `/trains/search`, `/buses/search` | همان | خیر | SSG محدود/client | ندارد | منتقل‌شده |
| `/fast-track`, `/esim`, `/city-tours` | همان | بله | SSG محدود/client | ندارد | منتقل‌شده |
| `/experiences` | `/city-tours` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/transfers` | `/transfer` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/checkout/*`, `/cart` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/orders/:id`, `/account/orders/:id` | همان | خیر | SSR/client | ندارد | منتقل‌شده |
| `/account/*` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/auth/*` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/track-order` | همان | خیر | client/noindex | ندارد | منتقل‌شده |
| `/order-tracking` | `/track-order` | خیر | 308 | دائمی | پیاده‌سازی‌شده |
| `/support` | همان | بله | SSG محدود | canonical | منتقل‌شده |
| `/help`, `/faq` | `/support` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/travel-checklist` | `/travel-preparation` | بله | 308 | دائمی | پیاده‌سازی‌شده |
| `/about`, `/contact`, `/terms`, `/privacy`, `/refund-policy`, `/licenses`, `/business-travel`, `/club`, `/travel-preparation` | همان | بله | SSG محدود/client | ندارد | منتقل‌شده |

همهٔ مسیرهای catch-all از فهرست داده‌های معتبر در `generateStaticParams` ساخته می‌شوند و `dynamicParams = false` است. URL ناشناخته HTTP 404 واقعی می‌گیرد. صفحات سفارش با شناسهٔ runtime مسیرهای dynamic مستقل دارند و توسط Fastify کنترل مالکیت می‌شوند.
