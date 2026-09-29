import type { SeoAirportGuide, SeoDestination, SeoHotelLanding, SeoRoute, SeoTourLanding } from "./content";

const updatedAt = "2026-09-27";

type DestinationSeed = {
  countrySlug: string;
  citySlug: string;
  country: string;
  city: string;
  summary: string;
  bestTime: string;
  transport: string;
  highlights: string[];
  route?: string;
  hotel?: string;
};

const destinationSeeds: DestinationSeed[] = [
  { countrySlug: "iran", citySlug: "tehran", country: "ایران", city: "تهران", summary: "تهران برای موزه، بازار، معماری معاصر و دسترسی به مسیرهای داخلی نقطه شروع مهمی است. برنامه روزانه را با فاصله محله‌ها و ترافیک هماهنگ کنید.", bestTime: "بهار و پاییز برای پیاده‌روی شهری متعادل‌ترند؛ وضعیت آلودگی هوا و بارش را نزدیک سفر بررسی کنید.", transport: "مترو بخش مهمی از شهر را پوشش می‌دهد. برای فرودگاه مهرآباد و امام خمینی مسیر و زمان جداگانه در نظر بگیرید.", highlights: ["کاخ گلستان", "بازار بزرگ", "موزه‌های مرکز شهر", "پل طبیعت"], route: "tehran-to-mashhad", hotel: "tehran" },
  { countrySlug: "iran", citySlug: "shiraz", country: "ایران", city: "شیراز", summary: "شیراز ترکیبی از باغ، شعر، معماری تاریخی و مسیرهای یک‌روزه پیرامون شهر است. فاصله تخت جمشید تا مرکز شهر را در برنامه مستقل حساب کنید.", bestTime: "بهار و پاییز برای گردش شهری مناسب‌ترند؛ تعطیلات نوروز معمولاً پرتردد است.", transport: "برای مرکز تاریخی می‌توان بخشی از مسیر را پیاده رفت؛ بازدیدهای بیرون شهر به برنامه حمل‌ونقل جدا نیاز دارند.", highlights: ["حافظیه", "باغ ارم", "بازار وکیل", "تخت جمشید"], route: "tehran-to-shiraz", hotel: "shiraz" },
  { countrySlug: "iran", citySlug: "isfahan", country: "ایران", city: "اصفهان", summary: "اصفهان برای معماری، پل‌ها، بازار و میدان‌های تاریخی مقصدی مناسب سفر چندروزه است. اقامت نزدیک مرکز تاریخی زمان رفت‌وآمد را کمتر می‌کند.", bestTime: "بهار و اوایل پاییز معمولاً برای گشت شهری مناسب‌تر است؛ دمای روز را پیش از حرکت بررسی کنید.", transport: "بخش زیادی از دیدنی‌های مرکزی نزدیک یکدیگرند؛ برای جلفا و نقاط دورتر تاکسی یا حمل‌ونقل عمومی لازم است.", highlights: ["میدان نقش جهان", "سی‌وسه‌پل", "محله جلفا", "کاخ چهلستون"], route: "tehran-to-isfahan", hotel: "isfahan" },
  { countrySlug: "iran", citySlug: "qeshm", country: "ایران", city: "قشم", summary: "قشم مقصدی برای طبیعت ساحلی، ژئوپارک و روستاهای جزیره است. فاصله جاذبه‌ها زیاد است و برنامه هر روز باید بر اساس یک بخش جزیره چیده شود.", bestTime: "فصل خنک‌تر سال برای بیشتر برنامه‌های فضای باز مناسب‌تر است؛ جزرومد و وضعیت دریا را همان روز بررسی کنید.", transport: "برای دیدن نقاط دور از شهر قشم معمولاً خودرو لازم است. زمان اسکله و انتقال دریایی را با حاشیه امن برنامه‌ریزی کنید.", highlights: ["دره ستارگان", "جنگل حرا", "جزایر ناز", "تنگه چاهکوه"], route: "tehran-to-qeshm", hotel: "qeshm" },
  { countrySlug: "uae", citySlug: "dubai", country: "امارات", city: "دبی", summary: "دبی محله‌های ساحلی، مراکز شهری و جاذبه‌های خانوادگی متنوعی دارد. انتخاب محل اقامت بر هزینه و زمان رفت‌وآمد روزانه اثر مستقیم می‌گذارد.", bestTime: "ماه‌های خنک‌تر برای فضای باز راحت‌ترند؛ برنامه رویدادها و ساعات کاری را نزدیک سفر کنترل کنید.", transport: "مترو برای محورهای اصلی مناسب است اما همه نقاط را پوشش نمی‌دهد؛ فاصله آخر مسیر و هزینه تاکسی را هم بسنجید.", highlights: ["دبی قدیم", "داون‌تاون", "ساحل جمیرا", "دبی مارینا"], route: "tehran-to-dubai", hotel: "dubai" },
  { countrySlug: "georgia", citySlug: "tbilisi", country: "گرجستان", city: "تفلیس", summary: "تفلیس برای بافت قدیمی، حمام‌ها، کافه‌ها و سفرهای یک‌روزه پیرامون شهر شناخته می‌شود. اختلاف ارتفاع محله‌ها را هنگام انتخاب اقامت در نظر بگیرید.", bestTime: "بهار و اوایل پاییز برای پیاده‌روی متعادل‌ترند؛ پیش‌بینی بارش را نزدیک سفر ببینید.", transport: "مترو و اتوبوس مسیرهای اصلی را پوشش می‌دهند و بافت قدیمی برای پیاده‌روی مناسب است.", highlights: ["شهر قدیم", "قلعه ناریکالا", "خیابان روستاولی", "حمام‌های گوگردی"], route: "tehran-to-tbilisi", hotel: "tbilisi" },
  { countrySlug: "armenia", citySlug: "yerevan", country: "ارمنستان", city: "ایروان", summary: "ایروان شهری جمع‌وجور برای میدان‌ها، موزه‌ها و کافه‌هاست و می‌تواند پایگاه سفرهای یک‌روزه ارمنستان باشد. مرکز شهر برای پیاده‌روی دسترسی مناسبی دارد.", bestTime: "بهار و پاییز برای گردش شهری متعادل‌ترند؛ زمستان سرد و تابستان گرم‌تر است.", transport: "مرکز شهر را می‌توان پیاده دید و برای مسیرهای دورتر مترو، اتوبوس و تاکسی در دسترس‌اند.", highlights: ["میدان جمهوری", "کاسکاد", "ماتناداران", "بازار ورنیساژ"], route: "tehran-to-yerevan", hotel: "yerevan" },
  { countrySlug: "azerbaijan", citySlug: "baku", country: "آذربایجان", city: "باکو", summary: "باکو بافت تاریخی دیوارشده را کنار بلوار ساحلی و معماری معاصر قرار می‌دهد. باد و فاصله جاذبه‌های بیرون شهر روی برنامه روزانه اثر دارند.", bestTime: "بهار و پاییز برای گشت شهری ملایم‌ترند؛ وضعیت باد را پیش از برنامه ساحلی بررسی کنید.", transport: "مترو و اتوبوس برای مرکز شهر کاربردی‌اند؛ مقصدهای بیرون شهر به هماهنگی حمل‌ونقل جدا نیاز دارند.", highlights: ["ایچری‌شهر", "بلوار باکو", "مرکز حیدر علی‌اف", "برج‌های شعله"], route: "tehran-to-baku" },
  { countrySlug: "qatar", citySlug: "doha", country: "قطر", city: "دوحه", summary: "دوحه برای موزه‌ها، بازار سنتی و ساحل شهری مقصدی فشرده است. گرما و فاصله میان مجموعه‌های بزرگ باید در زمان‌بندی روزانه دیده شود.", bestTime: "فصل خنک‌تر برای فضای باز مناسب‌تر است؛ ساعات بازدید مراکز فرهنگی را نزدیک سفر بررسی کنید.", transport: "مترو چند محور اصلی را پوشش می‌دهد؛ برای آخر مسیر یا نقاط خارج از شبکه، زمان تاکسی را هم لحاظ کنید.", highlights: ["سوق واقف", "کورنیش", "موزه هنر اسلامی", "کتارا"], route: "tehran-to-doha" },
  { countrySlug: "oman", citySlug: "muscat", country: "عمان", city: "مسقط", summary: "مسقط شهری گسترده میان کوه و دریاست و دیدنی‌های آن در چند ناحیه جدا قرار دارند. برنامه واقع‌بینانه به زمان کافی برای جابه‌جایی نیاز دارد.", bestTime: "ماه‌های خنک‌تر برای ساحل و فضای باز مناسب‌ترند؛ دمای روز را نزدیک سفر کنترل کنید.", transport: "فاصله‌ها زیاد است و خودرو یا تاکسی معمولاً نقش اصلی دارد؛ محل اقامت را بر اساس برنامه روزانه انتخاب کنید.", highlights: ["مسجد جامع سلطان قابوس", "مطرح", "کورنیش", "خانه اپرای سلطنتی"], route: "tehran-to-muscat" },
  { countrySlug: "iraq", citySlug: "najaf", country: "عراق", city: "نجف", summary: "نجف مقصد زیارتی پرترددی است و برنامه سفر باید بر محل اقامت، مسیرهای پیاده و هماهنگی جابه‌جایی بین‌شهری متمرکز باشد.", bestTime: "دمای هوا و تقویم مناسبت‌ها روی شلوغی اثر دارد؛ هر دو را نزدیک تاریخ سفر بررسی کنید.", transport: "برای فرودگاه، محل اقامت و سفر بین نجف و شهرهای اطراف زمان جداگانه و حاشیه امن در نظر بگیرید.", highlights: ["حرم امام علی", "بازار پیرامون حرم", "مسجد کوفه", "مسیر نجف تا کربلا"], route: "tehran-to-najaf" },
];

export const scaledDestinations: SeoDestination[] = destinationSeeds.map((seed) => ({
  countrySlug: seed.countrySlug,
  citySlug: seed.citySlug,
  country: seed.country,
  city: seed.city,
  title: `راهنمای سفر به ${seed.city}`,
  description: `راهنمای کاربردی سفر به ${seed.city}؛ زمان مناسب، رفت‌وآمد، دیدنی‌ها و پیوندهای لازم برای بررسی پرواز و اقامت.`,
  summary: seed.summary,
  heroImage: "/hero-red-mountain-lake.webp",
  bestTime: seed.bestTime,
  transportNotes: seed.transport,
  highlights: seed.highlights,
  relatedRoutes: seed.route ? [seed.route] : [],
  relatedHotels: seed.hotel ? [seed.hotel] : [],
  relatedArticles: [],
  updatedAt,
  indexable: true,
}));

type RouteSeed = { slug: string; origin: string; originCode: string; destination: string; destinationCode: string; destinationPath: string; hotel?: string };
const routeSeeds: RouteSeed[] = [
  { slug: "tehran-to-shiraz", origin: "تهران", originCode: "THR", destination: "شیراز", destinationCode: "SYZ", destinationPath: "/destinations/iran/shiraz", hotel: "shiraz" },
  { slug: "tehran-to-isfahan", origin: "تهران", originCode: "THR", destination: "اصفهان", destinationCode: "IFN", destinationPath: "/destinations/iran/isfahan", hotel: "isfahan" },
  { slug: "tehran-to-qeshm", origin: "تهران", originCode: "THR", destination: "قشم", destinationCode: "GSM", destinationPath: "/destinations/iran/qeshm", hotel: "qeshm" },
  { slug: "tehran-to-dubai", origin: "تهران", originCode: "IKA", destination: "دبی", destinationCode: "DXB", destinationPath: "/destinations/uae/dubai", hotel: "dubai" },
  { slug: "tehran-to-tbilisi", origin: "تهران", originCode: "IKA", destination: "تفلیس", destinationCode: "TBS", destinationPath: "/destinations/georgia/tbilisi", hotel: "tbilisi" },
  { slug: "tehran-to-yerevan", origin: "تهران", originCode: "IKA", destination: "ایروان", destinationCode: "EVN", destinationPath: "/destinations/armenia/yerevan", hotel: "yerevan" },
  { slug: "tehran-to-baku", origin: "تهران", originCode: "IKA", destination: "باکو", destinationCode: "GYD", destinationPath: "/destinations/azerbaijan/baku" },
  { slug: "tehran-to-doha", origin: "تهران", originCode: "IKA", destination: "دوحه", destinationCode: "DOH", destinationPath: "/destinations/qatar/doha" },
  { slug: "tehran-to-muscat", origin: "تهران", originCode: "IKA", destination: "مسقط", destinationCode: "MCT", destinationPath: "/destinations/oman/muscat" },
  { slug: "tehran-to-najaf", origin: "تهران", originCode: "IKA", destination: "نجف", destinationCode: "NJF", destinationPath: "/destinations/iraq/najaf" },
];

const routeInsights: Record<string, { duration: string; arrival: string; guide: string }> = {
  "tehran-to-shiraz": { duration: "این مسیر داخلی معمولاً مستقیم عرضه می‌شود؛ مدت واقعی را کنار زمان حضور در مهرآباد و تحویل بار بسنجید.", arrival: "فرودگاه شیراز بیرون از بافت گردشگری مرکزی است؛ زمان انتقال تا محل اقامت را جداگانه در برنامه بگذارید.", guide: "دیدنی‌های مرکز شیراز و بازدید تخت جمشید برنامه‌های متفاوتی دارند؛ برای مسیر بیرون شهر یک روز مستقل مناسب‌تر است." },
  "tehran-to-isfahan": { duration: "در کنار مدت پرواز، زمان رفت‌وآمد فرودگاهی را با گزینه‌های زمینی همین مسیر مقایسه کنید.", arrival: "فرودگاه اصفهان از میدان نقش جهان و جلفا فاصله دارد؛ ساعت ورود روی انتخاب انتقال و تحویل اتاق اثر می‌گذارد.", guide: "اقامت نزدیک چهارباغ یا مرکز تاریخی برای برنامه کوتاه، تعداد جابه‌جایی‌های روزانه را کمتر می‌کند." },
  "tehran-to-qeshm": { duration: "شرایط جوی جنوب می‌تواند بر عملیات پرواز اثر بگذارد؛ وضعیت گزینه واقعی را نزدیک حرکت کنترل کنید.", arrival: "فرودگاه قشم از شهر قشم و درگهان فاصله‌های متفاوتی دارد؛ مقصد زمینی نهایی را پیش از انتخاب انتقال مشخص کنید.", guide: "جاذبه‌های قشم پراکنده‌اند؛ برنامه هر روز را بر یک ناحیه جزیره متمرکز کنید و جزرومد را همان روز ببینید." },
  "tehran-to-dubai": { duration: "برای این مسیر بین‌المللی، مدت پرواز تنها بخشی از زمان سفر است و کنترل گذرنامه و پذیرش باید جداگانه لحاظ شود.", arrival: "دبی چند ترمینال و گزینه انتقال دارد؛ شماره ترمینال را با مسیر مترو یا تاکسی تا محله اقامت تطبیق دهید.", guide: "محله اقامت را بر اساس محور برنامه انتخاب کنید؛ دیره، داون‌تاون و مارینا الگوهای رفت‌وآمد متفاوتی دارند." },
  "tehran-to-tbilisi": { duration: "زمان کل سفر به مستقیم یا توقف‌دار بودن گزینه وابسته است؛ مدت و توقف را در نتیجه نهایی بخوانید.", arrival: "پیش از ورود، مسیر فرودگاه تفلیس تا شهر قدیم یا محله اقامت و امکان جابه‌جایی در ساعت رسیدن را بررسی کنید.", guide: "بافت قدیمی شیب و سنگفرش دارد؛ محل اقامت و کفش مناسب روی تجربه پیاده‌روی اثر می‌گذارند." },
  "tehran-to-yerevan": { duration: "پرواز و مسیر زمینی دو الگوی متفاوت سفر به ایروان‌اند؛ این صفحه فقط راهنمای گزینه هوایی است.", arrival: "فرودگاه ایروان بیرون مرکز شهر است؛ ساعت رسیدن و روش انتقال تا میدان جمهوری را پیش از حرکت مشخص کنید.", guide: "مرکز ایروان جمع‌وجور است، اما سفرهای یک‌روزه بیرون شهر به زمان و حمل‌ونقل جدا نیاز دارند." },
  "tehran-to-baku": { duration: "عرضه مستقیم یا توقف‌دار می‌تواند تغییر کند؛ به‌جای فرض برنامه ثابت، جزئیات همان گزینه را مبنا بگیرید.", arrival: "مسیر فرودگاه باکو تا مرکز و ایچری‌شهر به ساعت ورود وابسته است؛ انتقال آخر شب را از قبل بررسی کنید.", guide: "برای بلوار و شهر قدیم پیاده‌روی مناسب است، ولی مقصدهای بیرون باکو در برنامه روزانه جدا قرار می‌گیرند." },
  "tehran-to-doha": { duration: "در پرواز بین‌المللی دوحه، زمان پذیرش و کنترل مدارک را علاوه بر مدت پرواز در نظر بگیرید.", arrival: "فرودگاه حمد به شبکه حمل‌ونقل شهر متصل است؛ مقصد نهایی و ساعت کار مسیر انتخابی را نزدیک سفر بررسی کنید.", guide: "گرمای روز می‌تواند برنامه فضای باز را جابه‌جا کند؛ موزه‌ها و برنامه ساحلی را با فصل سفر هماهنگ کنید." },
  "tehran-to-muscat": { duration: "مدت و توقف مسیر تهران–مسقط میان گزینه‌ها متفاوت است؛ زمان کل درج‌شده در نتیجه را مقایسه کنید.", arrival: "مسقط گسترده است و فاصله فرودگاه تا مطرح یا دیگر محله‌ها یکسان نیست؛ محل اقامت را پیش از انتخاب انتقال مشخص کنید.", guide: "دیدنی‌های مسقط در چند ناحیه پراکنده‌اند؛ برای هر روز مسیرهای نزدیک به هم را کنار هم بچینید." },
  "tehran-to-najaf": { duration: "تقویم مناسبت‌ها می‌تواند بر شلوغی فرودگاه و مسیر اثر بگذارد؛ حاشیه زمانی بیشتری برای روزهای پرتردد بگذارید.", arrival: "انتقال از فرودگاه نجف تا محل اقامت یا ادامه مسیر بین‌شهری باید با ساعت ورود و وضعیت روز هماهنگ شود.", guide: "در سفر زیارتی، فاصله محل اقامت، توان پیاده‌روی و برنامه جابه‌جایی میان شهرها را پیش از خرید هماهنگ کنید." },
};

export const scaledRoutes: SeoRoute[] = routeSeeds.map((seed, index) => ({
  ...seed,
  title: `بلیط هواپیما ${seed.origin} به ${seed.destination}`,
  description: `راهنمای مسیر پرواز ${seed.origin} به ${seed.destination}، فرودگاه‌ها، نکات بار و جست‌وجوی گزینه‌های معتبر بدون نمایش قیمت یا ظرفیت غیرواقعی.`,
  summary: `برای مسیر ${seed.origin} به ${seed.destination}، کد فرودگاه، ساعت حضور و قوانین نرخ را روی نتیجهٔ نهایی بررسی کنید؛ این صفحه قیمت یا ظرفیت زنده اعلام نمی‌کند.`,
  duration: routeInsights[seed.slug]!.duration,
  originAirport: seed.originCode === "THR" ? "پروازهای داخلی معمولاً از مهرآباد انجام می‌شوند؛ ترمینال نهایی را روی بلیط بررسی کنید." : "پروازهای بین‌المللی تهران معمولاً از فرودگاه امام خمینی انجام می‌شوند؛ اطلاعات نهایی پرواز را کنترل کنید.",
  destinationAirport: `${routeInsights[seed.slug]!.arrival} کد مقصد ${seed.destinationCode} را روی بلیط نهایی تطبیق دهید.`,
  baggageGuidance: "بار کابین و بار تحویلی به ایرلاین و کلاس نرخی وابسته است و فقط جزئیات گزینهٔ واقعی معتبر است.",
  refundGuidance: "شرایط تغییر، استرداد و عدم حضور برای هر نرخ متفاوت است؛ قوانین همان گزینه را پیش از پرداخت بخوانید.",
  destinationGuide: routeInsights[seed.slug]!.guide,
  faq: [
    { question: `برای پرواز ${seed.origin} به ${seed.destination} چه چیزی را مقایسه کنم؟`, answer: "ساعت حرکت، کد فرودگاه، مدت کل سفر، بار مجاز و قوانین تغییر یا استرداد را کنار هم ببینید." },
    { question: "آیا این صفحه قیمت زنده نشان می‌دهد؟", answer: "خیر؛ قیمت و ظرفیت فقط پس از جست‌وجوی متصل به تأمین‌کننده و در نتیجهٔ نهایی معتبر است." },
  ],
  relatedRoutes: routeSeeds.filter((_, relatedIndex) => relatedIndex !== index).slice(0, 2).map((item) => item.slug),
  relatedHotelCity: seed.hotel,
  relatedAirports: seed.originCode === "IKA" ? ["ika"] : [],
  updatedAt,
  indexable: true,
}));

const hotelSeeds = [
  ["tehran", "تهران", "/destinations/iran/tehran", ["مرکز شهر", "ونک و جردن", "غرب تهران"]],
  ["shiraz", "شیراز", "/destinations/iran/shiraz", ["بافت تاریخی", "زند", "قصردشت"]],
  ["isfahan", "اصفهان", "/destinations/iran/isfahan", ["نقش جهان", "چهارباغ", "جلفا"]],
  ["qeshm", "قشم", "/destinations/iran/qeshm", ["شهر قشم", "درگهان", "ساحل جنوبی"]],
  ["dubai", "دبی", "/destinations/uae/dubai", ["دیره و بر دبی", "داون‌تاون", "مارینا"]],
  ["tbilisi", "تفلیس", "/destinations/georgia/tbilisi", ["شهر قدیم", "روستاولی", "ورا"]],
  ["yerevan", "ایروان", "/destinations/armenia/yerevan", ["میدان جمهوری", "کاسکاد", "مرکز شهر"]],
] as const;

const hotelTips: Record<string, [string, string]> = {
  tehran: ["فاصله هتل تا مترو و مقصدهای کاری را روی نقشه کنترل کنید.", "برای پرواز خارجی، زمان مسیر جداگانه تا فرودگاه امام خمینی را در نظر بگیرید."],
  shiraz: ["برای برنامه تاریخی، دسترسی به زند و بافت مرکزی را بسنجید.", "بازدید تخت جمشید بیرون شهر است و نزدیکی هتل به آن معیار مستقیمی نیست."],
  isfahan: ["برای سفر کوتاه، دسترسی پیاده به چهارباغ و نقش جهان ارزشمند است.", "موقعیت جلفا با مرکز تاریخی یکسان نیست؛ برنامه شبانه را هم در انتخاب محله ببینید."],
  qeshm: ["شهر قشم و درگهان برای برنامه خرید و جاذبه‌های طبیعی مبناهای متفاوتی هستند.", "فاصله تا اسکله یا فرودگاه را با ساعت رفت‌وبرگشت هماهنگ کنید."],
  dubai: ["نزدیکی به ایستگاه مترو را با مقصدهای روزانه مقایسه کنید.", "مالیات، ودیعه و شرایط لغو را فقط روی نرخ نهایی بررسی کنید."],
  tbilisi: ["شیب شهر قدیم و فاصله تا مترو را در انتخاب اقامت لحاظ کنید.", "برای ورود دیرهنگام، امکان پذیرش و انتقال فرودگاهی را از گزینه واقعی بخوانید."],
  yerevan: ["مرکز شهر برای پیاده‌روی مناسب است؛ فاصله تا میدان جمهوری را روی نقشه ببینید.", "اگر سفر یک‌روزه دارید، دسترسی محل اقامت به نقطه حرکت تور را بررسی کنید."],
};

export const scaledHotels: SeoHotelLanding[] = hotelSeeds.map(([slug, city, destinationPath, neighborhoods]) => ({
  slug,
  city,
  title: `راهنمای هتل‌های ${city}`,
  description: `راهنمای انتخاب و جست‌وجوی هتل در ${city} بر اساس محله، دسترسی و سبک سفر؛ بدون ادعای قیمت، امتیاز یا موجودی زنده.`,
  summary: `در ${city} محل اقامت را با برنامهٔ روزانه، دسترسی حمل‌ونقل و شرایط لغو هماهنگ کنید و اطلاعات تجاری را فقط در نتیجهٔ واقعی بسنجید.`,
  neighborhoods: [...neighborhoods],
  tips: hotelTips[slug] ?? ["موقعیت هتل را روی نقشه و با برنامهٔ روزانه مقایسه کنید.", "قوانین پذیرش و لغو را پیش از پرداخت بخوانید."],
  destinationPath,
  updatedAt,
  indexable: true,
}));

const tourSeeds = [
  ["istanbul", "استانبول", "ترکیه", "/destinations/turkey/istanbul", "tehran-to-istanbul"],
  ["dubai", "دبی", "امارات", "/destinations/uae/dubai", "tehran-to-dubai"],
  ["tbilisi", "تفلیس", "گرجستان", "/destinations/georgia/tbilisi", "tehran-to-tbilisi"],
  ["yerevan", "ایروان", "ارمنستان", "/destinations/armenia/yerevan", "tehran-to-yerevan"],
  ["kish", "کیش", "ایران", "/destinations/iran/kish", "tehran-to-kish"],
  ["qeshm", "قشم", "ایران", "/destinations/iran/qeshm", "tehran-to-qeshm"],
  ["mashhad", "مشهد", "ایران", "/destinations/iran/mashhad", "tehran-to-mashhad"],
  ["najaf-karbala", "نجف و کربلا", "عراق", "/destinations/iraq/najaf", "tehran-to-najaf"],
] as const;

const tourPlanning: Record<string, [string, string, string]> = {
  istanbul: ["تعادل گشت تاریخی، بخش آسیایی و زمان آزاد را در برنامه بخوانید.", "فرودگاه مقصد و محل هتل را با زمان انتقال گروه تطبیق دهید.", "مقررات ورود و اعتبار گذرنامه را از مرجع رسمی کنترل کنید."],
  dubai: ["برنامه فضای باز را با فصل و ساعت اجرا مقایسه کنید.", "نام هتل، مالیات و خدمات انتقال را در قرارداد واقعی ببینید.", "شرایط ورود امارات را نزدیک سفر فقط از مرجع رسمی بررسی کنید."],
  tbilisi: ["میزان پیاده‌روی در بافت قدیم و شیب مسیرها را بسنجید.", "گشت‌های خارج شهر و وعده‌های غذایی را از خدمات پایه جدا کنید.", "بیمه و مقررات ورود را بر اساس تاریخ حرکت کنترل کنید."],
  yerevan: ["روزهای شهری و سفرهای بیرون ایروان را در برنامه تفکیک کنید.", "نوع اتاق و موقعیت هتل نسبت به مرکز را روی پیشنهاد واقعی ببینید.", "مدارک مرزی را نزدیک حرکت از مرجع رسمی بررسی کنید."],
  kish: ["اجرای برنامه‌های دریایی را وابسته به شرایط جوی بدانید.", "ساعت ورود هتل و پرواز رفت‌وبرگشت را با هم هماهنگ کنید.", "خدمات تفریحی مشمول و غیرمشمول را در قرارداد بخوانید."],
  qeshm: ["فاصله جاذبه‌های جزیره و زمان هر گشت را واقع‌بینانه بسنجید.", "شناور و برنامه دریایی ممکن است با وضعیت باد تغییر کند.", "محل اقامت را با مسیر گشت‌های روزانه مقایسه کنید."],
  mashhad: ["فاصله محل اقامت تا مقصد اصلی و سرویس رفت‌وآمد را بررسی کنید.", "تقویم مناسبت‌ها را در ارزیابی شلوغی و زمان آزاد لحاظ کنید.", "نوع حمل‌ونقل و قواعد لغو را روی بسته واقعی بخوانید."],
  "najaf-karbala": ["زمان جابه‌جایی بین‌شهری و توان پیاده‌روی گروه را بسنجید.", "محل اقامت و وعده‌های اعلام‌شده را دقیقاً در قرارداد کنترل کنید.", "مدارک و مقررات ورود را نزدیک حرکت از منبع رسمی بررسی کنید."],
};

export const scaledTours: SeoTourLanding[] = tourSeeds.map(([slug, destination, country, relatedDestination, relatedFlight]) => ({
  slug,
  destination,
  country,
  title: `راهنمای تور ${destination}`,
  description: `راهنمای مقایسه تورهای ${destination} بر اساس برنامه، نوع حمل‌ونقل، محل اقامت و خدمات اعلام‌شده؛ بدون قیمت یا ظرفیت ساختگی.`,
  summary: `برای انتخاب تور ${destination}، جزئیات هر روز، خدمات مشمول، محل اقامت و قواعد لغو را روی پیشنهاد واقعی کنار هم مقایسه کنید.`,
  planningNotes: tourPlanning[slug],
  relatedDestination,
  relatedFlight,
  updatedAt,
  indexable: true,
}));

export const scaledAirports: SeoAirportGuide[] = [
  {
    slug: "ika", airport: "فرودگاه بین‌المللی امام خمینی", city: "تهران", code: "IKA",
    title: "راهنمای فرودگاه امام خمینی (IKA)",
    description: "راهنمای برنامه‌ریزی حرکت به فرودگاه امام خمینی، کنترل ترمینال، زمان حضور و پیوندهای رسمی اطلاعات پرواز.",
    summary: "این راهنما برای آماده‌سازی سفر بین‌المللی است. ترمینال، ساعت پذیرش و وضعیت پرواز را نزدیک حرکت در بلیط و کانال رسمی فرودگاه کنترل کنید.",
    access: "زمان مسیر از تهران به ساعت حرکت و وضعیت راه وابسته است؛ حاشیه امن کافی برای رسیدن و مراحل فرودگاه در نظر بگیرید.",
    terminals: "شماره ترمینال و درگاه پذیرش ممکن است تغییر کند و باید روی اطلاعات نهایی ایرلاین یا فرودگاه بررسی شود.",
    beforeDeparture: ["گذرنامه و مدارک مقصد را کنترل کنید.", "بار مجاز همان نرخ را بخوانید.", "وضعیت پرواز و ترمینال را نزدیک حرکت دوباره ببینید."],
    relatedDestination: "/destinations/iran/tehran", relatedFlights: ["tehran-to-istanbul", "tehran-to-dubai"],
    sources: [{ label: "وب‌سایت رسمی شهر فرودگاهی امام خمینی", url: "https://ikac.ir/", publisher: "شهر فرودگاهی امام خمینی", checkedAt: updatedAt, official: true }],
    reviewedAt: updatedAt, updatedAt, indexable: true,
  },
  {
    slug: "ist", airport: "فرودگاه استانبول", city: "استانبول", code: "IST",
    title: "راهنمای فرودگاه استانبول (IST)",
    description: "راهنمای ورود و خروج از فرودگاه استانبول، کنترل گیت و ترمینال، برنامه‌ریزی رفت‌وآمد و منابع رسمی فرودگاه.",
    summary: "فرودگاه استانبول مجموعه بزرگی است؛ برای کنترل تابلوها، تحویل بار و رسیدن به گیت زمان کافی بگذارید و اطلاعات روز را از منبع رسمی ببینید.",
    access: "گزینه و زمان انتقال به شهر با مقصد نهایی و ساعت ترافیک تغییر می‌کند؛ مسیر را نزدیک سفر در منبع رسمی کنترل کنید.",
    terminals: "گیت و کانتر ممکن است جابه‌جا شوند. نمایشگر فرودگاه و اعلان ایرلاین مرجع نهایی روز سفر هستند.",
    beforeDeparture: ["فرودگاه مقصد را با کد IST تطبیق دهید.", "گیت و زمان بسته‌شدن پذیرش را کنترل کنید.", "برای پیاده‌روی داخل ترمینال زمان کافی بگذارید."],
    relatedDestination: "/destinations/turkey/istanbul", relatedFlights: ["tehran-to-istanbul"],
    sources: [{ label: "وب‌سایت رسمی فرودگاه استانبول", url: "https://www.istairport.com/", publisher: "İGA Istanbul Airport", checkedAt: updatedAt, official: true }],
    reviewedAt: updatedAt, updatedAt, indexable: true,
  },
];
