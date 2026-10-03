# امنیت پنل‌های داخلی و پذیرنده

## احراز هویت و authorization

- cookie نشست فعلی HttpOnly، SameSite=Lax و در production Secure باقی مانده است.
- frontend guard فقط تجربه کاربر را مدیریت می‌کند؛ Fastify برای هر endpoint هویت، عضویت و permission را بررسی می‌کند.
- APIهای پنل در حالت feature flag خاموش 404 می‌دهند.
- cross-tenant detail با 404 پنهان می‌شود و tenant spoofing از طریق header تست شده است.

## CSRF و مبدأ

mutationهای پنل `Origin` را در صورت وجود با `WEB_ORIGIN` تطبیق می‌دهند و `Sec-Fetch-Site: cross-site` را رد می‌کنند. این کنترل همراه SameSite cookie و معماری same-origin استفاده می‌شود. درخواست‌های غیرمرورگری بدون Origin همچنان به نشست معتبر، permission و rate limit نیاز دارند.

## cache و SEO

- UIهای `/backoffice/*` و `/merchant/*`: `private, no-store, max-age=0`.
- APIهای `/api/backoffice/*` و `/api/merchant/*`: `private, no-store`، `Pragma: no-cache` و `Vary` روی cookie/authorization/organization.
- metadata: `noindex,nofollow`.
- robots: disallow و sitemap: بدون این مسیرها.

## rate limit و logging

merchant creation/update، نقش/مجوز، finance adjustment، settlement، booking override، refund، support، profile و team mutation با کلید user/action محدود می‌شوند. log امن شامل request ID، actor user ID، organization ID، route، status و duration است؛ body حساس log نمی‌شود.

## حفاظت داده

DTOهای merchant صریح و حداقلی‌اند. provider payload، payment secret، OTP، token، cookie و signature منتشر نمی‌شوند. موبایل، ایمیل و شناسه‌ها در پاسخ merchant ماسک می‌شوند. storageReference سند خصوصی است و هیچ route عمومی فایل در این فاز وجود ندارد.

## چک production

پیش از فعال‌سازی production باید migration و seed کنترل‌شده، PostgreSQL integration، backup/restore، E2E و CI کامل اجرا شوند. طبق تصمیم فعلی، بررسی GitHub/CI به مرحله بعد موکول شده و سبز بودن محلی جایگزین آن نیست.

