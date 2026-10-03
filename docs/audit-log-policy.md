# سیاست Audit Log

## تضمین یکپارچگی

`AuditLog` append-only است. trigger دیتابیس هر `UPDATE` یا `DELETE` را رد می‌کند. عملیات حساس همراه تغییر اصلی در یک transaction نوشته می‌شوند تا تغییر بدون audit commit نشود. رخدادهای CLI reconciliation پیش از اجرای کار با actor سیستمی ثبت می‌شوند.

## رخدادهای فعلی

- `merchant.created` و `merchant.updated`
- `merchant.profile_updated`
- `membership.created` و `membership.updated`
- `membership.roles_changed`
- `role.permissions_changed`
- `finance.adjustment.created`
- `settlement.status_changed`
- `booking.manual_override`
- `refund.admin_status_changed`
- `support.status_changed`
- `reconciliation.booking.triggered`
- `reconciliation.payment.triggered`

هر رخداد می‌تواند actor user/organization، target organization، resource، before/after، request ID، IP، user agent و timestamp UTC داشته باشد.

## داده‌های ممنوع

OTP، session cookie، password، API key، provider secret، signature خام، اطلاعات کارت، فایل سند و payload کامل حساس نباید ثبت شوند. writer مرکزی قبل از ذخیره کلیدهای حساس را redact و اندازه payload را محدود می‌کند.

Audit API فقط خواندنی است و endpoint عمومی برای تغییر یا حذف ندارد. retention نهایی باید با الزامات حقوقی و سیاست `docs/data-retention.md` هماهنگ شود؛ حذف دوره‌ای مستلزم migration/فرایند حقوقی جداست، نه API اپراتوری.

