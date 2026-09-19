# گزارش فاز ۱۶: تکمیل هسته و پایداری محصول

## موجودی واقعی مسیرهای مشتری

- کشف و محتوا: `/`, `/destinations`, `/destinations/:continent`, `/destinations/:continent/:country`, `/article/:articleId`, `/routes`, `/routes/:routeId`, `/shop`, `/shop/:productId`, `/blog`, `/blog/:slug`.
- سرویس‌ها: `/flights`, `/flights/:id`, `/flights/search`, `/hotels`, `/hotels/search`, `/hotels/:id`, `/tours`, `/tours/:id`, `/ziyarat`, `/ziyarat/:id`, `/trains`, `/trains/search`, `/buses`, `/buses/search`, `/insurance`, `/cip`, `/transfer`, `/transfers`, `/visa`, `/visa/:country`, `/visa/:country/apply`, `/fast-track`, `/esim`, `/city-tours`, `/experiences`.
- checkout: `/checkout/passengers`, `/checkout/hotel-guests`, `/checkout/tour-travelers`, `/checkout/ziyarat-travelers`, `/checkout/secondary-passengers`, `/checkout/review`, `/checkout/payment`, `/checkout/gateway`, `/checkout/result`, `/cart`.
- عمومی و راهنما: `/support`, `/help`, `/faq`, `/help/purchase-guide`, `/help/refund-guide`, `/track-order`, `/order-tracking`, `/about`, `/contact`, `/terms`, `/privacy`, `/refund-policy`, `/licenses`, `/business-travel`, `/club`, `/travel-preparation`, `/travel-checklist`.
- احراز هویت و حساب: `/auth/login`, `/auth/register`, `/auth/otp`, `/auth/forgot-password`, `/account`, `/account/orders`, `/account/orders/:id`, `/account/trips`, `/account/passengers`, `/account/wallet`, `/account/refunds`, `/account/favorites`, `/account/notifications`, `/account/support`, `/account/profile`, `/account/visa`, `/orders/:id` و fallback سراسری 404.

ممیزی با router واقعی انجام شد. صفحه‌های discovery هویت بصری قبلی را حفظ می‌کنند؛ flowهای تراکنشی loading/empty/error/success دارند. نتیجهٔ پرداخت و جزئیات سفارش دیگر وضعیت خام انگلیسی یا موفقیت کاذب نشان نمی‌دهند. loading سراسری accessible و خطای catastrophic route دارای fallback و retry است. skip link، mainهای صفحات، labelهای فرم‌های بحرانی، focus stateها، altها و کنترل‌های icon-only بررسی شدند. تست Playwright در desktop و عرض Pixel 7 اجرا می‌شود؛ gridها و actionها در 360px stack می‌شوند و overflow افقی مسیرهای بحرانی کنترل شده است.

## معماری frontend و API

- `apiRequest` خطاهای شبکه را به `API_UNAVAILABLE` و خطاهای HTTP را به `ApiError` با `code/message/fieldErrors/requestId/details` تبدیل می‌کند؛ GET فقط یک retry شبکه‌ای دارد و mutation خودکار retry نمی‌شود.
- تنظیم React Query برای stale time، retry فقط خطاهای شبکه/۵xx و عدم retry mutation یکپارچه شد. favorite cache ماژولی حذف و query/mutation با optimistic rollback و invalidation جایگزین شد.
- typeهای `BookingStatus` و `PaymentStatus` و نگاشت واحد برچسب/پیام ساخته شد. وضعیت‌های `paid_booking_pending`, `confirmed`, `reservation_failed`, `compensation_pending`, `refunded`, `manual_review_required` در result، order، account و tracking قابل نمایش‌اند.
- دادهٔ authoritative حساب، پرداخت، سفارش و کیف پول فقط API/PostgreSQL است. storage مرورگر فقط recent search، recently viewed، draft موقت رزرو و challenge موقت OTP را نگه می‌دارد.
- ۹ هشدار Fast Refresh مربوط به API عمدی کامپوننت‌های shadcn و moduleهای context/page با override محدود و مستند حذف شدند؛ lint بدون warning است.

## state machine، پول و دیتابیس

گذارهای CheckoutSession، PaymentIntent، PaymentAttempt، Order booking، BookingAttempt و RefundRequest صریح شده‌اند و گذار ناممکن `INVALID_STATE_TRANSITION` می‌دهد. migration جدید:

- CHECK برای statusها، مبلغ صحیح و غیرمنفی، split دقیق `walletAmount + onlineAmount = amount` و موجودی غیرمنفی؛
- unique برای request رزرو، compensation، notification و refund باز هر سفارش؛
- trigger جلوگیری از refund بیشتر از مبلغ سفارش؛
- trigger immutability برای total/currency و snapshotهای مالی/سرویس سفارش نهایی؛
- index سفارش‌های حل‌نشده و backfill وضعیت legacy.

finalization و refund با isolation سریال‌شونده و retry محدود خطاهای conflict انجام می‌شوند. debit کیف پول همراه ledger در همان transaction است. جبران wallet با reference یکتا، online refund با idempotency key پایدار، transaction و notification یکتا انجام می‌شود. split پرداخت ترکیبی عیناً معکوس می‌شود.

## رزرو، جبران و recovery

قبل از پرداخت و قبل از callback موفق، supplier outcome یکی از `VALID`, `PRICE_CHANGED`, `SOLD_OUT`, `EXPIRED`, `PROVIDER_UNAVAILABLE` را می‌دهد. تغییر قیمت شامل trusted price/item است و charge متفاوت بی‌صدا انجام نمی‌شود.

پس از پرداخت، رزرو فقط بعد از reserve و confirm supplier موفق است. شکست قطعی به `reservation_failed → compensation_pending → refunded` می‌رود. timeout پس از ارسال، `UNKNOWN/manual_review_required` است و بازپرداخت فوری ندارد. `ReconciliationService` و `npm run reconcile:bookings` نتیجه را دوباره استعلام می‌کنند و به confirmed، compensated یا UNKNOWN همگرا می‌شوند. تکرار پس از crash، refund، wallet credit، ledger یا notification دوم نمی‌سازد.

## امنیت، pagination و dependency audit

CORS صریح، cookie امن production، SameSite=Lax، session expiry/revocation، callback HMAC و replay protection، request-id سروری، body limit یک MiB، rate limit IP برای OTP/tracking، throttle دیتابیسی OTP، safe error JSON، log بدون payload حساس، readiness دیتابیس و `TRUST_PROXY=false` پیش‌فرض برقرارند. ownership برای order، passenger، wallet، refund، favorite، notification، support، visa و mock payment simulation در repository/route enforce می‌شود. tracking عمومی فقط summary و موبایل mask‌شده می‌دهد.

orders، wallet transactions، favorites، notifications، support و visa پارامترهای `page/perPage` با سقف ۵۰ دارند و شکل آرایهٔ قبلی برای سازگاری حفظ شده است.

`npm audit fix` بدون force، یافته‌ها را از ۲۵ به ۹ رساند. موارد باقی‌مانده نیازمند major migration هستند: React Router 7، Vite 8، Vitest 5؛ Prisma CLI نیز advisory روی config/deepmerge دارد که fix پیشنهادی npm downgrade ناسازگار 6.12 است. Vite/Vitest/Prisma CLI ابزار build/test هستند؛ React Router runtime است اما برنامه هیچ redirect ورودی untrusted را مستقیماً اجرا نمی‌کند. این ریسک‌ها باید در ارتقای کنترل‌شدهٔ بعدی بسته شوند؛ `--force` اجرا نشده است.

## محدودیت‌های production

همهٔ providerها mock هستند؛ پیامک، پرداخت، ظرفیت و صدور واقعی نداریم. reconciliation فعلاً CLI/service است و scheduler ندارد. rate limit حافظه‌ای برای یک process مناسب است و پیش از scale افقی باید به زیرساخت مشترک منتقل شود. تضمین idempotency refund واقعی وابسته به contract درگاه آینده است. پنل ادمین عمداً خارج از scope است. فاز بعدی فقط فعال‌سازی تدریجی provider واقعی با ترتیب SMS، payment، flight، hotel و سپس سرویس‌های مکمل است.
