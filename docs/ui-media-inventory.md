# ممیزی رسانهٔ رابط کاربری

وضعیت پیش از فاز: ۱۵ تصویر، تکرارشده در `public/` و `src/assets/`، سه فایل PNG بین ۲ تا ۲.۷ مگابایت، و استفادهٔ شدیداً تکراری از همان چند عکس در ده‌ها مقصد و مقاله.

## دارایی‌های عکاسی پروژه

| فایل | ابعاد | وضعیت | تصمیم | کاربرد فعلی |
| --- | --- | --- | --- | --- |
| `hero-kish-premium.webp` | 1920×768 | بهینه‌شده از PNG ۲۰۳۸KB → ۹۳KB | keep / hero | hero صفحهٔ اصلی، مقصد کیش، اقامت ساحلی |
| `hotel-tehran-premium.webp` | 1536×1024 | بهینه‌شده از PNG ۲۷۲۱KB → ۱۶۳KB | keep / hero | landing هتل، اقامت شهری |
| `hotel-istanbul-premium.webp` | 1536×1024 | بهینه‌شده از PNG ۲۴۵۰KB → ۱۵۰KB | keep / hero | اقامت بوتیک، تجربهٔ لوکس |
| `hero-greece.jpg` | 1920×1280 | مناسب | keep / card | مقصد استانبول، کارت‌های ساحلی |
| `hero-desert.jpg` | 1707×1280 | مناسب | keep / card | تجربهٔ کویر |
| `hero-camping.jpg` | 1920×1246 | مناسب | keep / card | اقامت در طبیعت |
| `morocco.jpg` | 1024×1280 | مناسب (پرتره) | keep / card | اقامت سنتی |
| `france.jpg` | 1920×1255 | مناسب | keep / card | تفلیس، خیابان شهری |
| `asia-temple.jpg` | 1920×1280 | مناسب | keep / card | بنای تاریخی |
| `iceland.jpg` | 1918×1280 | مناسب | keep / card | تجربهٔ ماجراجویی |
| `northern-lights.jpg` | 920×1280 | کیفیت متوسط، پرتره | keep / editorial | محتوای فصلی |
| `africa-lion.jpg` | 854×1280 | کیفیت پایین‌تر | keep / editorial | حیات وحش |
| `travel-books.jpg` | 1920×1280 | مناسب | keep / editorial | مجله و برنامه‌ریزی |
| `bloggers.jpg` | 1245×1280 | مناسب | keep / editorial | مجله |
| `world-map.webp` | 1600×1067 | بهینه‌شده از ۶۶۹KB → ۴۵۱KB | keep / editorial | صفحهٔ مقاصد legacy |

### حذف‌شده‌ها

| فایل | دلیل |
| --- | --- |
| `src/assets/hero-kish-premium.png` | جایگزین WebP؛ ۲MB بدون مزیت بصری |
| `src/assets/hotel-tehran-premium.png` | جایگزین WebP |
| `src/assets/hotel-istanbul-premium.png` | جایگزین WebP |
| `src/assets/world-map.jpg` | تکراری و بدون ارجاع |
| `public/world-map.jpg` | جایگزین WebP |

مجموع حجم `public/` + `src/assets/` از حدود ۱۳MB به حدود ۶MB کاهش یافت.

## شکاف رسانه‌ای شناسایی‌شده

مقصدها و سرویس‌هایی که **هیچ عکس معتبری** در مخزن ندارند:

مشهد، تهران، شیراز، اصفهان، یزد، تبریز، قشم، رشت/گیلان، مازندران، البرز، دبی، آنتالیا، وان، نجف، کربلا، ایروان — و همچنین سرویس‌های قطار، اتوبوس، بیمه، CIP، فست‌ترک، ترانسفر، eSIM، ویزا و گشت شهری.

استفاده از عکس نامرتبط برای این موارد دو مشکل داشت:
1. تکرار آشکار یک عکس در ده‌ها کارت (مشکل اصلی گزارش‌شده).
2. ادعای ضمنی نادرست («این عکس مشهد است» در حالی که عکس معبدی در آسیاست).

## راهکار: صحنه‌های برندشدهٔ کی‌آشی

به‌جای دانلود عکس با لایسنس نامشخص، یک سیستم **تصویرسازی SVG پارامتریک** ساخته شد (`src/components/media/TravelScene.tsx` + `src/media/scenes.ts`).

- ۱۴ کهن‌الگوی صحنه: `coast`, `city`, `heritage`, `mountain`, `desert`, `air`, `rail`, `road`, `lounge`, `shield`, `connect`, `document`, `market`, `forest`
- ۱۸ پالت رنگی مقصدمحور (کیش، قشم، مشهد، نجف، تهران، شیراز، اصفهان، یزد، خزر، البرز، استانبول، دبی و …)
- خروجی: SVG درون‌خطی، بدون درخواست شبکه، بدون ۴۰۴، بدون CLS، مقیاس‌پذیر در هر بریک‌پوینت
- هر مقصد ترکیب صحنه/پالت مخصوص خود را دارد، بنابراین دو کارت شبیه هم نیستند

این تصویرسازی‌ها آشکارا **گرافیک برند** هستند، نه عکس واقعی مقصد؛ بنابراین هیچ ادعای نادرستی ایجاد نمی‌کنند.

## مدل داده

`src/media/library.ts` تنها منبع ارجاع رسانه است:

- `photoLibrary` — عکس‌های واقعی با `width`/`height`/`alt`/`credit`/`licenseNote`
- `destinationMedia`, `serviceMedia`, `stayMedia`, `experienceMedia`, `editorialMedia`
- `destinationAsset()`, `serviceAsset()`, `experienceAsset()`, `legacyAsset()` — همیشه یک دارایی معتبر برمی‌گردانند (fallback برندشدهٔ قطعی، هرگز تصویر شکسته)

هیچ مسیر تصویر خامی نباید مستقیم در کامپوننت‌های جدید نوشته شود.

## ابزار

`npm run media:optimize` (`scripts/optimize-media.mjs`) با `sharp` نسخهٔ WebP بهینه می‌سازد و دارایی‌های بالای ۷۰۰KB را گزارش می‌دهد.
