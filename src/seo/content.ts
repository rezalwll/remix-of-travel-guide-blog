export type SeoFaq = { question: string; answer: string };

export type SeoDestination = {
  countrySlug: string;
  citySlug: string;
  country: string;
  city: string;
  title: string;
  description: string;
  summary: string;
  heroImage: string;
  bestTime: string;
  transportNotes: string;
  highlights: string[];
  relatedRoutes: string[];
  relatedHotels: string[];
  relatedArticles: string[];
  updatedAt: string;
  indexable: boolean;
};

export type SeoRoute = {
  slug: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  title: string;
  description: string;
  summary: string;
  duration: string;
  originAirport: string;
  destinationAirport: string;
  baggageGuidance: string;
  refundGuidance: string;
  destinationGuide: string;
  faq: SeoFaq[];
  relatedRoutes: string[];
  relatedHotelCity?: string;
  destinationPath: string;
  updatedAt: string;
  indexable: boolean;
};

export type SeoHotelLanding = {
  slug: string;
  city: string;
  title: string;
  description: string;
  summary: string;
  neighborhoods: string[];
  tips: string[];
  destinationPath: string;
  updatedAt: string;
  indexable: boolean;
};

export type SeoArticle = {
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  body: string[];
  relatedDestination?: string;
  indexable: boolean;
};

export const seoDestinations: SeoDestination[] = [
  {
    countrySlug: "iran", citySlug: "kish", country: "ایران", city: "کیش",
    title: "راهنمای سفر به کیش", description: "راهنمای کاربردی سفر به کیش؛ بهترین زمان، رفت‌وآمد، محله‌های اقامت و پیوند به پرواز و هتل.",
    summary: "کیش برای سفر کوتاه ساحلی، خرید و تفریح‌های دریایی انتخابی در دسترس است. پیش از حرکت، وضعیت آب‌وهوا و اجرای برنامه‌های دریایی را بررسی کنید.",
    heroImage: "/hero-camping.jpg", bestTime: "از آبان تا فروردین هوا معمولاً برای پیاده‌روی و برنامه‌های فضای باز مناسب‌تر است.",
    transportNotes: "رفت‌وآمد اصلی با تاکسی انجام می‌شود. برای ساعت‌های شلوغ و رفت‌وآمد فرودگاهی زمان اضافه در نظر بگیرید.",
    highlights: ["ساحل و مسیر دوچرخه", "کشتی یونانی", "کاریز کیش", "تفریح‌های دریایی وابسته به شرایط جوی"],
    relatedRoutes: ["tehran-to-kish"], relatedHotels: ["kish"], relatedArticles: ["kish-travel-guide"], updatedAt: "2026-09-10", indexable: true,
  },
  {
    countrySlug: "iran", citySlug: "mashhad", country: "ایران", city: "مشهد",
    title: "راهنمای سفر به مشهد", description: "راهنمای برنامه‌ریزی سفر به مشهد با اطلاعات مسیر، اقامت، حمل‌ونقل شهری و زمان مناسب سفر.",
    summary: "مشهد علاوه بر سفر زیارتی، برای موزه‌گردی، بازار و گردش‌های یک‌روزه پیرامون شهر هم برنامه‌های متنوعی دارد.",
    heroImage: "/asia-temple.jpg", bestTime: "بهار و اوایل پاییز معمولاً آب‌وهوای متعادل‌تری دارند؛ تعطیلات مذهبی و نوروز شلوغ‌تر است.",
    transportNotes: "مترو، اتوبوس و تاکسی بخش زیادی از شهر را پوشش می‌دهند. فاصله هتل تا مقصد اصلی را پیش از رزرو بسنجید.",
    highlights: ["مجموعه حرم", "آرامگاه فردوسی", "بازار رضا", "طرقبه و شاندیز"],
    relatedRoutes: ["tehran-to-mashhad"], relatedHotels: ["mashhad"], relatedArticles: ["mashhad-travel-planning"], updatedAt: "2026-09-08", indexable: true,
  },
  {
    countrySlug: "turkey", citySlug: "istanbul", country: "ترکیه", city: "استانبول",
    title: "راهنمای سفر به استانبول", description: "راهنمای فارسی سفر به استانبول؛ محله‌ها، حمل‌ونقل، بهترین زمان و برنامه‌ریزی پرواز و هتل.",
    summary: "استانبول شهری بزرگ میان اروپا و آسیاست. انتخاب محله اقامت و استفاده از حمل‌ونقل عمومی می‌تواند زمان و هزینه رفت‌وآمد را کنترل کند.",
    heroImage: "/hero-greece.jpg", bestTime: "بهار و پاییز برای پیاده‌روی مناسب‌ترند؛ تابستان و تعطیلات معمولاً پرتردد است.",
    transportNotes: "استانبول‌کارت برای مترو، تراموا، اتوبوس و کشتی کاربرد دارد. برای مسیر فرودگاه زمان ترافیک را لحاظ کنید.",
    highlights: ["سلطان‌احمد و ایاصوفیه", "بسفر", "کادیکوی", "گالاتا و خیابان استقلال"],
    relatedRoutes: ["tehran-to-istanbul"], relatedHotels: ["istanbul"], relatedArticles: ["best-time-to-visit-istanbul"], updatedAt: "2026-09-12", indexable: true,
  },
];

export const seoRoutes: SeoRoute[] = [
  {
    slug: "tehran-to-mashhad", origin: "تهران", originCode: "THR", destination: "مشهد", destinationCode: "MHD",
    title: "بلیط هواپیما تهران به مشهد", description: "راهنمای مسیر پرواز تهران به مشهد، فرودگاه‌ها، مدت تقریبی سفر و جست‌وجوی پرواز بدون ادعای قیمت زنده.",
    summary: "این مسیر یکی از پرترددترین مسیرهای داخلی است. ساعت پرواز، فرودگاه مبدأ و شرایط بار را در جزئیات گزینه منتخب بررسی کنید.",
    duration: "مدت پرواز مستقیم معمولاً حدود ۱ ساعت و ۲۰ دقیقه است و ممکن است با شرایط عملیاتی تغییر کند.",
    originAirport: "پروازها ممکن است از مهرآباد انجام شوند؛ ترمینال را روی اطلاعات نهایی بررسی کنید.", destinationAirport: "فرودگاه بین‌المللی شهید هاشمی‌نژاد به مترو و تاکسی دسترسی دارد.",
    baggageGuidance: "میزان بار به ایرلاین و کلاس نرخی وابسته است؛ عدد نهایی همان چیزی است که در نتیجه جست‌وجو و بلیط درج می‌شود.",
    refundGuidance: "قوانین تغییر و استرداد وابسته به نرخ منتخب است. پیش از پرداخت، جریمه و محدودیت‌ها را بخوانید.",
    destinationGuide: "برای سفرهای زیارتی یا تعطیلات شلوغ، اقامت و زمان رفت‌وآمد را زودتر برنامه‌ریزی کنید.",
    faq: [
      { question: "پرواز تهران به مشهد چقدر طول می‌کشد؟", answer: "پرواز مستقیم معمولاً نزدیک به یک ساعت و بیست دقیقه است؛ زمان دقیق به مسیر و شرایط عملیاتی بستگی دارد." },
      { question: "آیا قیمت نمایش‌داده‌شده در این صفحه زنده است؟", answer: "خیر. این صفحه راهنمای مسیر است؛ قیمت و ظرفیت معتبر فقط پس از جست‌وجوی متصل به تأمین‌کننده نمایش داده می‌شود." },
    ],
    relatedRoutes: ["tehran-to-kish", "tehran-to-istanbul"], relatedHotelCity: "mashhad", destinationPath: "/destinations/iran/mashhad", updatedAt: "2026-09-14", indexable: true,
  },
  {
    slug: "tehran-to-kish", origin: "تهران", originCode: "THR", destination: "کیش", destinationCode: "KIH",
    title: "بلیط هواپیما تهران به کیش", description: "اطلاعات کاربردی پرواز تهران به کیش، فرودگاه‌ها، مدت مسیر و جست‌وجوی پرواز بدون قیمت ساختگی.",
    summary: "برای سفر کیش، زمان ورود هتل و فاصله فرودگاه تا محل اقامت را با ساعت پرواز هماهنگ کنید.", duration: "پرواز مستقیم معمولاً حدود ۱ ساعت و ۴۵ دقیقه طول می‌کشد.",
    originAirport: "بیشتر پروازهای داخلی این مسیر از مهرآباد انجام می‌شوند؛ ترمینال را در بلیط نهایی ببینید.", destinationAirport: "فرودگاه کیش با تاکسی به بخش‌های اصلی جزیره متصل است.",
    baggageGuidance: "بار مجاز بین ایرلاین‌ها و نرخ‌ها متفاوت است و باید در نتیجه واقعی کنترل شود.", refundGuidance: "قوانین کنسلی به کلاس نرخی وابسته است؛ نرخ‌های ارزان‌تر ممکن است محدودیت بیشتری داشته باشند.",
    destinationGuide: "برنامه‌های دریایی به وضعیت باد و دریا وابسته‌اند؛ برای آن‌ها زمان جایگزین در نظر بگیرید.",
    faq: [{ question: "بهترین فصل سفر هوایی به کیش چه زمانی است؟", answer: "از آبان تا فروردین هوا برای بیشتر فعالیت‌های فضای باز مناسب‌تر است، اما زمان دقیق را با پیش‌بینی هوا بررسی کنید." }],
    relatedRoutes: ["tehran-to-mashhad", "tehran-to-istanbul"], relatedHotelCity: "kish", destinationPath: "/destinations/iran/kish", updatedAt: "2026-09-14", indexable: true,
  },
  {
    slug: "tehran-to-istanbul", origin: "تهران", originCode: "IKA", destination: "استانبول", destinationCode: "IST",
    title: "بلیط هواپیما تهران به استانبول", description: "راهنمای پرواز تهران به استانبول، فرودگاه‌های مسیر، نکات بار و ورود؛ بدون نمایش قیمت یا ظرفیت غیرواقعی.",
    summary: "پیش از خرید، فرودگاه مقصد، شرایط ورود و اعتبار مدارک را از منابع رسمی بررسی کنید.", duration: "پرواز مستقیم معمولاً حدود ۳ تا ۳ ساعت و ۳۰ دقیقه است.",
    originAirport: "پروازهای خارجی معمولاً از فرودگاه امام خمینی انجام می‌شوند.", destinationAirport: "استانبول چند فرودگاه دارد؛ نام دقیق فرودگاه مقصد روی گزینه پرواز اهمیت دارد.",
    baggageGuidance: "بار کابین و بار تحویلی به ایرلاین و نرخ وابسته است؛ برای پرواز بین‌المللی شرایط را دقیق بخوانید.", refundGuidance: "نرخ‌های بین‌المللی می‌توانند قوانین تغییر، no-show و استرداد متفاوتی داشته باشند.",
    destinationGuide: "محله اقامت را با برنامه روزانه و دسترسی مترو انتخاب کنید تا رفت‌وآمد ساده‌تر شود.",
    faq: [{ question: "پرواز تهران به استانبول در کدام فرودگاه می‌نشیند؟", answer: "بسته به ایرلاین ممکن است فرودگاه استانبول یا صبیحه گوکچن باشد؛ کد فرودگاه را پیش از خرید بررسی کنید." }],
    relatedRoutes: ["tehran-to-mashhad", "tehran-to-kish"], relatedHotelCity: "istanbul", destinationPath: "/destinations/turkey/istanbul", updatedAt: "2026-09-15", indexable: true,
  },
];

export const seoHotelLandings: SeoHotelLanding[] = [
  { slug: "kish", city: "کیش", title: "راهنمای هتل‌های کیش", description: "راهنمای انتخاب و جست‌وجوی هتل‌های کیش بر اساس محله، سبک سفر، دسترسی و امکانات؛ بدون ادعای موجودی یا قیمت زنده.", summary: "برای انتخاب اقامت در کیش، نزدیکی به ساحل، مراکز خرید و هزینه رفت‌وآمد را کنار امکانات هتل بسنجید.", neighborhoods: ["مرکز جزیره", "ساحل غربی", "جاده جهان"], tips: ["ساعت ورود و خروج را با پرواز هماهنگ کنید.", "خدمات ساحلی و ترانسفر را مستقیماً در شرایط گزینه بررسی کنید."], destinationPath: "/destinations/iran/kish", updatedAt: "2026-09-12", indexable: true },
  { slug: "mashhad", city: "مشهد", title: "هتل‌های مشهد", description: "راهنمای جست‌وجوی هتل در مشهد با توجه به فاصله، حمل‌ونقل و نوع سفر؛ بدون قیمت یا ظرفیت ساختگی.", summary: "فاصله پیاده، دسترسی حمل‌ونقل و سرویس رفت‌وآمد، سه معیار مهم برای مقایسه اقامت در مشهد هستند.", neighborhoods: ["خیابان امام رضا", "مرکز شهر", "اطراف حرم"], tips: ["فاصله اعلام‌شده را روی نقشه کنترل کنید.", "قوانین پذیرش و مدارک را پیش از پرداخت بخوانید."], destinationPath: "/destinations/iran/mashhad", updatedAt: "2026-09-11", indexable: true },
  { slug: "istanbul", city: "استانبول", title: "هتل‌های استانبول", description: "راهنمای انتخاب هتل استانبول در محله‌های پرطرفدار و دسترسی به حمل‌ونقل؛ بدون ادعای موجودی یا امتیاز ساختگی.", summary: "سلطان‌احمد برای دیدنی‌های تاریخی، تکسیم برای مرکز شهری و کادیکوی برای تجربه بخش آسیایی انتخاب‌های متفاوتی هستند.", neighborhoods: ["سلطان‌احمد", "تکسیم و گالاتا", "بشیکتاش", "کادیکوی"], tips: ["مسیر فرودگاه تا هتل را پیش از رزرو بررسی کنید.", "مالیات و شرایط لغو را در نرخ واقعی کنترل کنید."], destinationPath: "/destinations/turkey/istanbul", updatedAt: "2026-09-13", indexable: true },
];

export const seoArticles: SeoArticle[] = [
  {
    slug: "best-time-to-visit-istanbul", title: "بهترین زمان سفر به استانبول؛ راهنمای فصل‌به‌فصل", description: "مقایسه فصل‌های استانبول از نظر آب‌وهوا، شلوغی و نوع تجربه برای انتخاب زمان مناسب سفر.",
    image: "/hero-greece.jpg", author: "تحریریه کی‌آشی", publishedAt: "2026-08-20", updatedAt: "2026-09-12", relatedDestination: "/destinations/turkey/istanbul", indexable: true,
    body: ["بهترین زمان سفر به استانبول برای همه یکسان نیست. اگر پیاده‌روی طولانی و کافه‌گردی اولویت شماست، بهار و پاییز معمولاً دمای متعادل‌تری دارند.", "تابستان روزهای بلندتری دارد اما بخش‌های گردشگری شلوغ‌تر می‌شوند. زمستان خلوت‌تر است و برای موزه و خرید مناسب است، هرچند باران و باد می‌تواند برنامه فضای باز را تغییر دهد.", "پیش از انتخاب تاریخ، تعطیلات رسمی، رویدادها و پیش‌بینی هوا را بررسی کنید. قیمت و ظرفیت فقط در نتایج واقعی جست‌وجو معتبر است."],
  },
  {
    slug: "kish-travel-guide", title: "راهنمای برنامه‌ریزی سفر کوتاه به کیش", description: "یک چارچوب ساده برای برنامه‌ریزی سفر دو تا چهارروزه کیش، از پرواز و هتل تا برنامه‌های ساحلی.",
    image: "/hero-camping.jpg", author: "تحریریه کی‌آشی", publishedAt: "2026-08-18", updatedAt: "2026-09-10", relatedDestination: "/destinations/iran/kish", indexable: true,
    body: ["برای سفر کوتاه کیش بهتر است پرواز، زمان تحویل اتاق و برنامه‌های فضای باز را یک‌جا هماهنگ کنید.", "روز اول را سبک نگه دارید و برنامه‌های دریایی را به روزی با پیش‌بینی هوای مناسب بسپارید. بازار و برنامه‌های داخلی می‌توانند گزینه جایگزین باشند.", "این راهنما اطلاعات عمومی ارائه می‌کند و ادعای قیمت، ظرفیت یا اجرای قطعی خدمات ندارد."],
  },
  {
    slug: "mashhad-travel-planning", title: "چطور سفر به مشهد را بهتر برنامه‌ریزی کنیم؟", description: "نکات کاربردی انتخاب زمان، مسیر، اقامت و رفت‌وآمد در سفر مشهد.",
    image: "/asia-temple.jpg", author: "تحریریه کی‌آشی", publishedAt: "2026-08-15", updatedAt: "2026-09-08", relatedDestination: "/destinations/iran/mashhad", indexable: true,
    body: ["در سفر مشهد، محل اقامت روی زمان رفت‌وآمد روزانه اثر زیادی دارد. فاصله روی نقشه و دسترسی مترو یا سرویس هتل را بررسی کنید.", "در تعطیلات و مناسبت‌ها برای فرودگاه، راه‌آهن و مسیرهای مرکزی زمان اضافه در نظر بگیرید.", "شرایط تغییر و استرداد پرواز و هتل را پیش از پرداخت بخوانید تا برنامه سفر انعطاف‌پذیر بماند."],
  },
];

export const getDestination = (country: string, city: string) => seoDestinations.find((item) => item.countrySlug === country && item.citySlug === city);
export const getRouteLanding = (slug: string) => seoRoutes.find((item) => item.slug === slug);
export const getHotelLanding = (slug: string) => seoHotelLandings.find((item) => item.slug === slug);
export const getSeoArticle = (slug: string) => seoArticles.find((item) => item.slug === slug);

export const isIndexableContent = (item: { indexable: boolean; title: string; description: string }, uniqueSections: number) =>
  item.indexable && item.title.trim().length >= 12 && item.description.trim().length >= 60 && uniqueSections >= 3;
