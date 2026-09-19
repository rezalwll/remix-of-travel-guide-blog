# قالب تأیید Provider

## مشخصات

- نام و نسخهٔ adapter:
- مالک فنی / مالک تجاری:
- محیط: sandbox / production
- عملیات فعال:
- عملیات اختیاری:
- تاریخ و تأییدکننده:

## پیکربندی و امنیت

- [ ] mode و activation flag صریح است.
- [ ] نبود credential در real باعث startup failure می‌شود.
- [ ] secret خارج از Git و دارای برنامهٔ rotation است.
- [ ] base URL ثابت، HTTPS و بدون credential است.
- [ ] callback allowlist، signature، replay و ownership بررسی شده است.
- [ ] redirect فقط از origin مورد اعتماد ساخته می‌شود.
- [ ] log، snapshot و خطا با redactor بررسی شده‌اند.

## قرارداد و قابلیت اطمینان

- [ ] success و response mapping
- [ ] validation/rejected/conflict
- [ ] authentication failure
- [ ] timeout واقعی و abort
- [ ] rate limit و Retry-After
- [ ] malformed/oversized/partial response
- [ ] retry فقط برای safe/idempotent request
- [ ] duplicate callback/request
- [ ] unknown result و reconciliation
- [ ] cancel/refund/status check

شواهد تست و شناسهٔ اجرای CI:

## عملیات

- [ ] health check کم‌هزینه و بدون secret
- [ ] dashboard/alert و request ID
- [ ] runbook رخداد و escalation vendor
- [ ] dry-run reconciliation
- [ ] rollout تدریجی و معیار توقف
- [ ] rollback با disable، بدون fallback به mock

تصمیم نهایی: `READY / BLOCKED`

محدودیت‌ها و موارد باقی‌مانده:
