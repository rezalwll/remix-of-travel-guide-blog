# چک‌لیست انتشار production

- [ ] CI، typecheck، lint، unit/provider، API integration و frontend build سبز
- [ ] image با Node 20، user غیر root و بدون `.env` build شده است
- [ ] secretها خارج از git و `DATABASE_URL`/URLهای HTTPS تنظیم شده‌اند
- [ ] TLS certificate، HTTP redirect، HSTS و `TRUST_PROXY` بازبینی شده است
- [ ] PostgreSQL backup پیش از migration گرفته و restore drill برنامه‌ریزی شده است
- [ ] migration با `prisma migrate deploy` و بدون migration destructive تأیید شده است
- [ ] seed فقط دستی در dev/test/staging است و production startup آن را اجرا نمی‌کند
- [ ] `/health/live`، `/health/ready`، `/health/version` و provider status بررسی شده‌اند
- [ ] auth، search، checkout sandbox، tracking و logout smoke شده‌اند
- [ ] log redaction و نبود credential واقعی در providerها بررسی شده است
- [ ] schedulerهای booking/payment reconciliation با batch و run id تنظیم شده‌اند
- [ ] cache assetها immutable و API/auth/payment callback no-store است
- [ ] rollback کد و محدودیت rollback schema برای همین release ثبت شده است
- [ ] دامنه، TLS، support، legal/content و provider credentialهای واقعی وضعیت مشخص دارند
