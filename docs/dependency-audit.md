# بررسی dependencyها (۲۰۲۶-۰۹-۲۱)

`npm audit` با lockfile موجود ۹ advisory نشان می‌دهد: ۴ high و ۵ moderate، عمدتاً در ابزارهای build/test یا transitive:

- `@prisma/config`/`deepmerge-ts` و `prisma`: high؛ fix پیشنهادی npm با نسخهٔ ناسازگار/نامتناسب Prisma همراه است و بدون بررسی migration downgrade/major انجام نشد.
- `vite`/`esbuild`: high/moderate؛ fix پیشنهادی Vite 8 یک major upgrade است و باید جداگانه با build و deployment تست شود.
- `react-router`/`react-router-dom`: moderate؛ fix پیشنهادی Router 7 major است و نیازمند بازبینی route API است.
- `vitest`/`@vitest/mocker`: moderate؛ fix پیشنهادی Vitest 5 major است و باید همراه با تست‌ها انجام شود.

`npm audit --omit=dev` نیز ۵ مورد (۳ high و ۲ moderate) گزارش می‌کند: زنجیرهٔ Prisma config و React Router. مسیر آسیب‌پذیر Prisma مربوط به config/CLI است و برنامهٔ runtime آن را فراخوانی نمی‌کند؛ Router این پروژه client-side و بدون SSR hydration است، بااین‌حال هر دو به‌عنوان ریسک باز باقی می‌مانند.

هیچ `npm audit fix --force` اجرا نشده است. fixهای پیشنهادشده downgrade نامتناسب Prisma یا major upgradeهای Router/Vite/Vitest هستند و باید در branch ارتقای مستقل با regression کامل انجام شوند. image با `npm prune --omit=dev` ساخته می‌شود، ولی audit lockfile همچنان dependencyهای transitive/optional را گزارش می‌کند؛ بنابراین ادعای صفرشدن advisory در runtime وجود ندارد.
