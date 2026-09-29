# بررسی dependencyها (۲۰۲۶-۰۹-۲۱)

`npm audit` با lockfile موجود ۹ advisory نشان می‌دهد: ۴ high و ۵ moderate، عمدتاً در ابزارهای build/test یا transitive:

- `@prisma/config`/`deepmerge-ts` و `prisma`: high؛ fix پیشنهادی npm با نسخهٔ ناسازگار/نامتناسب Prisma همراه است و بدون بررسی migration downgrade/major انجام نشد.
- `vite`/`esbuild`: یافتهٔ تاریخی پیش از cutover؛ Vite از runtime/build فرانت حذف شده و lockfile باید در audit بعدی برای باقی‌ماندهٔ transitive بررسی شود.
- `react-router`/`react-router-dom`: moderate؛ fix پیشنهادی Router 7 major است و نیازمند بازبینی route API است.
- `vitest`/`@vitest/mocker`: moderate؛ fix پیشنهادی Vitest 5 major است و باید همراه با تست‌ها انجام شود.

این اعداد snapshot تاریخی قبل از مهاجرت کامل Next.js هستند و نباید وضعیت فعلی dependencyها تلقی شوند. وضعیت جاری فقط با اجرای دوباره `npm audit` روی lockfile همین commit قابل اعلام است؛ مسیر Prisma config/CLI نیز باید جدا از dependencyهای runtime تفسیر شود.

هیچ `npm audit fix --force` اجرا نشده است. هر fix شامل major change یا downgrade باید در تغییر مستقل با regression کامل انجام شود. image production فقط dependencyهای لازم را نگه می‌دارد، ولی audit lockfile همچنان dependencyهای transitive/optional را گزارش می‌کند؛ بنابراین تا audit تازه ادعای صفرشدن advisory وجود ندارد.
