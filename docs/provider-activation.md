# راهنمای فعال‌سازی Providerها

این پروژه اکنون مرز provider را برای فعال‌سازی واقعی آماده می‌کند، اما هیچ API یا credential واقعی در مخزن وجود ندارد. adapterهای فعلی `development` و `mock` فقط در حالت `sandbox` هستند و سیستم هرگز از real به mock fallback نمی‌کند.

## چرخهٔ وضعیت

- `UNCONFIGURED`: پیکربندی لازم کامل نیست.
- `DISABLED`: provider آگاهانه خاموش است.
- `SANDBOX`: adapter نمایشی یا محیط آزمون فعال است.
- `READY`: پیکربندی real معتبر است ولی health هنوز فعال‌بودن را تأیید نکرده است.
- `ACTIVE`: پیکربندی و health واقعی هر دو موفق‌اند.
- `DEGRADED`: adapter فعال است ولی health یا عملیات اخیر مشکل دارد.

`GET /api/health/providers` فقط نام adapter، mode، lifecycle و health را برمی‌گرداند؛ secret و URL خصوصی در پاسخ نیست. خرابی provider اختیاری کل API را unhealthy نمی‌کند. برای مشاهده و probe امن:

```bash
npm run provider:status -- --json
npm run provider:check -- --json
```

## پیکربندی و فعال‌سازی

متغیرها در `.env.example` مستند شده‌اند. برای هر گروه ابتدا mode را انتخاب کنید: `disabled`، `sandbox` یا `real`. حالت real باید URL امن و credentialهای همان گروه را داشته باشد و نام adapter نیز باید یک adapter واقعیِ پیاده‌سازی‌شده باشد. نبود هرکدام startup را fail می‌کند؛ استفادهٔ پنهانی از mock ممنوع است. URLهای credentialدار رد می‌شوند و در production فقط HTTPS مجاز است.

ترتیب rollout پیشنهادی:

1. adapter را در محیط توسعه با stub محلی و contract kit تأیید کنید.
2. credential محدودِ sandbox را خارج از Git تزریق کنید و `provider:check` را اجرا کنید.
3. callback URL و allowlist درگاه/تأمین‌کننده را ثبت کنید.
4. contract، timeout، rate-limit، malformed response، duplicate callback و unknown result را ثبت و تأیید کنید.
5. ابتدا یک provider و سهم ترافیک محدود را فعال کنید؛ metrics و reconciliation را زیر نظر بگیرید.
6. برای rollback، mode را `disabled` کنید یا deployment قبلی را برگردانید. به mock fallback نکنید.

## امنیت و داده

همهٔ outbound HTTPها باید از `ProviderHttpClient` عبور کنند: base URL ثابت، جلوگیری از cross-origin/SSRF، timeout واقعی با `AbortController`، سقف پاسخ، parsing امن و retry محدود دارد. POST فقط وقتی retry می‌شود که عملیات idempotent و دارای کلید idempotency باشد. redactor بازگشتی token، API key، secret، signature، OTP، کارت و موبایل را حذف و payload ذخیره‌شده را به 16KiB محدود می‌کند. callback secret یا امضای خام ذخیره نمی‌شود؛ فقط fingerprint نگه‌داری می‌شود.

## عملیات و reconciliation

```bash
npm run reconcile:payments -- --dry-run 50
npm run reconcile:payments -- 50
npm run reconcile:bookings -- --dry-run 50
npm run reconcile:bookings -- 50
```

پرداخت pending/unknown هرگز به‌صرف timeout موفق فرض نمی‌شود. reconciliation status را از provider می‌گیرد و تنها در پاسخ قطعی، payment/order را نهایی می‌کند. رزرو UNKNOWN نیز بازپرداخت عجولانه ایجاد نمی‌کند و تا پاسخ قطعی در بررسی دستی می‌ماند. ابتدا همیشه `--dry-run` اجرا شود.

## تست و رخداد

`npm run test:providers` contract مشترک SMS، پرداخت و سفر را اجرا می‌کند. stub فقط از کد تست/توسعه قابل ساخت است و در production خطا می‌دهد. سناریوهای success، timeout، rate-limit، malformed، partial، duplicate، rejected و unknown برای certification در دسترس‌اند.

در رخداد: provider را disable کنید، request ID و category خطا را بررسی کنید، dry-run reconciliation بگیرید، سپس موارد UNKNOWN را reconcile کنید. secret را log یا ticket نکنید؛ در صورت احتمال افشا آن را rotate کنید. callbackها باید امضا، مرجع ذخیره‌شده و idempotency/replay را بگذرانند.

## وضعیت dependency audit

در بازبینی ۲۰۲۶-۰۹-۱۹، `npm audit` پنج advisory متوسط و چهار advisory high گزارش کرد. highها در زنجیرهٔ ابزار Prisma (`deepmerge-ts`) و بقیه در Vitest/Vite/React Router هستند؛ اصلاح پیشنهادی npm مستلزم تغییر major یا downgrade شکسته بود. طبق سیاست این فاز `npm audit fix --force` اجرا نشد. CI audit را گزارش می‌کند ولی تا migration کنترل‌شدهٔ نسخه‌های major آن را blocker خودکار نکرده‌ایم. این debt باید با migration جداگانه، تست کامل database/E2E و سپس حذف `continue-on-error` بسته شود.
