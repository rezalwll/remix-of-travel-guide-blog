import { photoLibrary } from "@/media/library";
import type { ExperienceOffer } from "@/types/experience";

type ShortTourSeed = {
  slug: string;
  title: string;
  destination: string;
  destinations: string[];
  days: 1 | 2;
  image: string;
  description: string;
  highlights: string[];
  season: string;
  difficulty: string;
  departureDates: [string, string][];
  price: number;
  itinerary: { title: string; description: string }[];
  overnight?: string;
};

const seeds: ShortTourSeed[] = [
  {
    slug: "qamsar-kashan-one-day",
    title: "تور یک‌روزه قمصر و گلاب‌گیری کاشان",
    destination: "قمصر",
    destinations: ["قمصر", "کاشان"],
    days: 1,
    image: photoLibrary.qamsar.src,
    description: "یک سفر بهاری از تهران با بازدید از قمصر، کارگاه سنتی گلاب‌گیری و باغ فین کاشان؛ زمان‌بندی برنامه برای فصل گل محمدی تنظیم شده است.",
    highlights: ["گلاب‌گیری سنتی", "باغ فین", "پیاده‌روی سبک"],
    season: "اردیبهشت و خرداد",
    difficulty: "آسان",
    departureDates: [["2027-05-07", "2027-05-07"], ["2027-05-21", "2027-05-21"]],
    price: 2_450_000,
    itinerary: [
      { title: "حرکت به قمصر و کاشان", description: "حرکت صبح زود از تهران، صبحانه در مسیر و رسیدن به قمصر." },
      { title: "گلاب‌گیری و باغ فین", description: "بازدید از کارگاه گلاب‌گیری، زمان آزاد برای خرید و بازدید از باغ فین پیش از بازگشت." },
    ],
  },
  {
    slug: "qom-jamkaran-one-day",
    title: "تور یک‌روزه قم و جمکران",
    destination: "قم",
    destinations: ["قم", "جمکران"],
    days: 1,
    image: photoLibrary.jamkaran.src,
    description: "سفر زیارتی کوتاه از تهران با زمان مستقل برای حرم حضرت معصومه، بازار اطراف حرم و مسجد جمکران، همراه با سرپرست برنامه.",
    highlights: ["حرم حضرت معصومه", "مسجد جمکران", "زمان آزاد زیارت"],
    season: "چهارفصل",
    difficulty: "آسان",
    departureDates: [["2026-10-23", "2026-10-23"], ["2026-11-06", "2026-11-06"]],
    price: 1_390_000,
    itinerary: [
      { title: "قم و حرم حضرت معصومه", description: "حرکت صبح از تهران، زیارت و زمان آزاد در محدوده حرم و بازار." },
      { title: "مسجد جمکران", description: "انتقال گروهی به جمکران، زیارت و بازگشت عصرگاهی به تهران." },
    ],
  },
  {
    slug: "palangan-kurdistan-two-day",
    title: "تور دو‌روزه کردستان؛ سنندج و پالنگان",
    destination: "کردستان",
    destinations: ["سنندج", "پالنگان"],
    days: 2,
    image: photoLibrary.palangan.src,
    description: "دو روز برای آشنایی با بافت پلکانی پالنگان، مسیرهای کوهستانی منطقه و حال‌وهوای سنندج؛ با یک شب اقامت محلی نمونه.",
    highlights: ["روستای پالنگان", "سنندج", "اقامت محلی"],
    season: "بهار و پاییز",
    difficulty: "متوسط",
    departureDates: [["2026-10-29", "2026-10-30"], ["2026-11-12", "2026-11-13"]],
    price: 6_980_000,
    overnight: "اقامتگاه بوم‌گردی منتخب در منطقه",
    itinerary: [
      { title: "حرکت و گشت سنندج", description: "حرکت شبانه، ورود صبحگاهی و گشت شهری سنندج پیش از تحویل اقامتگاه." },
      { title: "پالنگان و بازگشت", description: "حرکت به پالنگان، پیاده‌روی در بافت روستا، ناهار محلی و بازگشت به تهران." },
    ],
  },
  {
    slug: "abyaneh-natanz-one-day",
    title: "تور یک‌روزه ابیانه و نطنز",
    destination: "ابیانه",
    destinations: ["ابیانه", "نطنز"],
    days: 1,
    image: photoLibrary.abyaneh.src,
    description: "یک روز میان معماری سرخ‌رنگ ابیانه و دیدنی‌های نطنز، با فرصت کافی برای پیاده‌روی آرام و عکاسی در بافت تاریخی.",
    highlights: ["بافت تاریخی ابیانه", "نطنز", "عکاسی"],
    season: "بهار و پاییز",
    difficulty: "آسان تا متوسط",
    departureDates: [["2026-10-16", "2026-10-16"], ["2026-10-30", "2026-10-30"]],
    price: 2_290_000,
    itinerary: [
      { title: "نطنز", description: "حرکت صبح زود، صبحانه در مسیر و توقف برای بازدید کوتاه در نطنز." },
      { title: "ابیانه", description: "گشت پیاده در بافت تاریخی ابیانه، ناهار و بازگشت عصرگاهی." },
    ],
  },
  {
    slug: "alamut-ovan-one-day",
    title: "تور یک‌روزه الموت و دریاچه اوان",
    destination: "الموت",
    destinations: ["الموت", "دریاچه اوان"],
    days: 1,
    image: photoLibrary.ovanLake.src,
    description: "مسیر طبیعت‌گردی یک‌روزه از تهران تا دریاچه اوان و چشم‌اندازهای الموت، مناسب افرادی که با جاده کوهستانی و پیاده‌روی سبک راحت‌اند.",
    highlights: ["دریاچه اوان", "جاده الموت", "طبیعت‌گردی"],
    season: "بهار تا اوایل پاییز",
    difficulty: "متوسط",
    departureDates: [["2026-10-22", "2026-10-22"], ["2027-04-15", "2027-04-15"]],
    price: 2_650_000,
    itinerary: [
      { title: "جاده الموت", description: "حرکت بامدادی از تهران و توقف‌های کوتاه در مسیر کوهستانی الموت." },
      { title: "دریاچه اوان", description: "پیاده‌روی سبک کنار دریاچه، ناهار و بازگشت با توقف‌های برنامه‌ریزی‌شده." },
    ],
  },
  {
    slug: "masuleh-rudkhan-two-day",
    title: "تور دو‌روزه ماسوله و قلعه رودخان",
    destination: "گیلان",
    destinations: ["ماسوله", "قلعه رودخان"],
    days: 2,
    image: photoLibrary.rudkhanCastle.src,
    description: "ترکیب گشت در ماسوله با جنگل‌پیمایی و صعود پله‌های قلعه رودخان؛ یک برنامه فشرده با اقامت یک‌شب در فومن.",
    highlights: ["ماسوله", "قلعه رودخان", "جنگل‌پیمایی"],
    season: "بهار تا پاییز",
    difficulty: "متوسط رو به زیاد",
    departureDates: [["2026-11-05", "2026-11-06"], ["2027-04-22", "2027-04-23"]],
    price: 6_450_000,
    overnight: "هتل سه‌ستاره نمونه در فومن",
    itinerary: [
      { title: "ماسوله", description: "حرکت صبح، گشت در بافت ماسوله، زمان آزاد و انتقال به محل اقامت در فومن." },
      { title: "قلعه رودخان", description: "حرکت صبحگاهی به قلعه، جنگل‌پیمایی و بازگشت به تهران پس از ناهار." },
    ],
  },
  {
    slug: "varzaneh-desert-two-day",
    title: "تور دو‌روزه کویر ورزنه",
    destination: "ورزنه",
    destinations: ["ورزنه", "تالاب گاوخونی"],
    days: 2,
    image: photoLibrary.varzanehDesert.src,
    description: "سفر پاییزی و زمستانی به تپه‌های شنی ورزنه با تماشای غروب، شب‌نشینی کنترل‌شده و بازدید از دیدنی‌های بومی منطقه.",
    highlights: ["تپه‌های شنی", "غروب کویر", "اقامت بوم‌گردی"],
    season: "پاییز و زمستان",
    difficulty: "متوسط",
    departureDates: [["2026-11-12", "2026-11-13"], ["2026-12-03", "2026-12-04"]],
    price: 5_780_000,
    overnight: "اقامتگاه بوم‌گردی منتخب در ورزنه",
    itinerary: [
      { title: "ورود به ورزنه و غروب کویر", description: "حرکت صبح، ناهار محلی، حضور در تپه‌های شنی و بازگشت به اقامتگاه." },
      { title: "گشت محلی و بازگشت", description: "بازدید از دیدنی‌های بومی و حاشیه تالاب با توجه به شرایط مسیر، سپس بازگشت." },
    ],
  },
  {
    slug: "tang-e-vashi-one-day",
    title: "تور یک‌روزه تنگه واشی",
    destination: "فیروزکوه",
    destinations: ["فیروزکوه", "تنگه واشی"],
    days: 1,
    image: photoLibrary.tangEVashi.src,
    description: "برنامه تابستانی برای پیمایش تنگه واشی؛ مناسب مسافرانی که آمادگی راه‌رفتن در آب و مسیر ناهموار را دارند.",
    highlights: ["پیمایش در آب", "تنگه واشی", "طبیعت‌گردی"],
    season: "تابستان",
    difficulty: "متوسط رو به زیاد",
    departureDates: [["2027-06-17", "2027-06-17"], ["2027-07-01", "2027-07-01"]],
    price: 2_190_000,
    itinerary: [
      { title: "حرکت به فیروزکوه", description: "حرکت صبح زود، صبحانه در مسیر و انتقال تا ابتدای مسیر پیمایش." },
      { title: "پیمایش تنگه", description: "پیمایش گروهی با توقف‌های کنترل‌شده، ناهار و بازگشت عصرگاهی." },
    ],
  },
];

const buildPackages = (seed: ShortTourSeed) => {
  const hasOvernight = seed.days === 2;
  return [
    {
      id: `${seed.slug}-standard`,
      name: "پکیج استاندارد",
      hotel: seed.overnight ?? "بدون اقامت شبانه",
      hotelStars: hasOvernight ? 3 : 0,
      roomType: hasOvernight ? "اتاق دوتخته" : "رفت‌وبرگشت یک‌روزه",
      mealPlan: hasOvernight ? "صبحانه و یک وعده اصلی" : "صبحانه و یک وعده اصلی",
      includedServices: ["رفت‌وبرگشت گروهی", "سرپرست برنامه", "پذیرایی طبق برنامه"],
      pricePerAdult: seed.price,
      pricePerChild: Math.round(seed.price * 0.78),
      pricePerInfant: 350_000,
      currency: "TOMAN" as const,
      transport: "اتوبوس توریستی",
      capacityMock: 24,
    },
    {
      id: `${seed.slug}-comfort`,
      name: "پکیج راحت",
      hotel: seed.overnight ?? "بدون اقامت شبانه",
      hotelStars: hasOvernight ? 4 : 0,
      roomType: hasOvernight ? "اتاق دوتخته منتخب" : "صندلی ردیف جلو و گروه کوچک‌تر",
      mealPlan: hasOvernight ? "صبحانه و دو وعده اصلی" : "صبحانه و ناهار منتخب",
      includedServices: ["رفت‌وبرگشت گروهی", "سرپرست برنامه", "پذیرایی کامل‌تر"],
      pricePerAdult: Math.round(seed.price * 1.22),
      pricePerChild: Math.round(seed.price * 0.94),
      pricePerInfant: 450_000,
      currency: "TOMAN" as const,
      transport: "میدل‌باس توریستی",
      capacityMock: 16,
    },
  ];
};

export const shortTours: ExperienceOffer[] = seeds.map((seed) => ({
  id: `short-${seed.slug}`,
  slug: seed.slug,
  type: "tour",
  title: seed.title,
  destination: seed.destination,
  destinations: seed.destinations,
  origin: "تهران",
  country: "ایران",
  durationDays: seed.days,
  durationNights: seed.days - 1,
  images: [seed.image],
  description: seed.description,
  highlights: seed.highlights,
  departureOptions: seed.departureDates.map(([startDate, endDate], index) => ({
    id: `${seed.slug}-departure-${index + 1}`,
    startDate,
    endDate,
    availableMock: index === 0 ? 12 : 7,
    transport: "اتوبوس توریستی",
    basePrice: seed.price,
    status: index === 0 ? "available" : "limited",
  })),
  packages: buildPackages(seed),
  includedServices: ["رفت‌وبرگشت از تهران", "سرپرست برنامه", "بیمه مسئولیت گروهی نمونه", "وعده‌های اعلام‌شده در برنامه"],
  excludedServices: ["هزینه ورودیه‌های اعلام‌نشده", "خرید و هزینه‌های شخصی", "تجهیزات شخصی طبیعت‌گردی"],
  visaInfo: "برای سفر داخلی ویزا لازم نیست. اطلاعات ظرفیت، مبلغ و تاریخ‌ها در این نسخه نمایشی است و پیش از فروش باید با قرارداد تأمین‌کننده تطبیق داده شود.",
  documents: ["کارت ملی یا مدرک شناسایی معتبر", "اطلاعات تماس اضطراری", "فرم سلامت برای مسیرهای طبیعت‌گردی"],
  itinerary: seed.days === 1
    ? [{ day: 1, title: seed.itinerary.map((item) => item.title).join(" و "), description: seed.itinerary.map((item) => item.description).join(" ") }]
    : seed.itinerary.map((item, index) => ({ day: index + 1, ...item })),
  tags: [seed.days === 1 ? "یک‌روزه" : "دو‌روزه", seed.season, seed.difficulty],
  featured: true,
  startingPrice: seed.price,
  mealPlan: seed.days === 1 ? "صبحانه و ناهار" : "صبحانه و وعده‌های اعلام‌شده",
  guide: "سرپرست فارسی‌زبان برنامه",
}));
