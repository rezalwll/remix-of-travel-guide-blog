import type { Article } from "@/data/destinations";

/**
 * Persian editorial copy for the legacy travel archive.
 *
 * The original demo dataset is intentionally kept intact for stable ids and
 * routes, while every customer-facing magazine surface consumes this layer.
 */
const articleTitlesFa: Record<string, string> = {
  feat1: "راهنمای سفر به سانتورینی؛ از ساحل‌ها تا تماشای غروب",
  feat2: "راهنمای تماشای شفق قطبی در ۱۰ مقصد تماشایی",
  feat3: "سفر به مراکش؛ از کوچه‌های مدینه تا شب‌های صحرا",
  fr1: "سفر به بورگونی؛ تاکستان‌ها و شهرهای تاریخی فرانسه",
  fr2: "سفر جاده‌ای در ریویرای فرانسه و ساحل‌های پنهان",
  fr3: "پاریس فراتر از برج ایفل؛ ۱۰ جای دنج محبوب محلی‌ها",
  fr4: "۸ اردوگاه ساحلی زیبا در بریتانی فرانسه",
  fr5: "ماجراجویی در کرس؛ کوهستان و ساحل در قلب مدیترانه",
  gr1: "راهنمای آتن؛ نکته‌های ضروری برای گشت‌وگذار در پایتخت یونان",
  gr2: "سفر یک‌روزه به جزیره‌های سارونیک و دیدنی‌های آیگینا",
  gr3: "شهر رودس؛ جاذبه‌های تاریخی و ساحل‌های دیدنی",
  gr4: "بهترین اقامتگاه‌های استخردار یونان برای سفری آرام",
  gr5: "۱۰ جای دیدنی یونان که نباید از دست بدهید",
  is1: "۸ جای تماشایی ایسلند برای فهرست سفرهای رؤیایی",
  is2: "راهنمای ریکیاویک؛ ۱۰ تجربه در پایتخت ایسلند و اطراف آن",
  is3: "سفر جاده‌ای هفت‌روزه در ایسلند؛ از حلقه طلایی تا شمال",
  is4: "در منطقه میواتن ایسلند چه کارهایی انجام دهیم؟",
  is5: "۵ دلیل برای سفر زمستانی به ایسلند",
  it1: "سفر جاده‌ای در توسکانی؛ تپه‌ها، تاکستان‌ها و شهرهای قرون وسطایی",
  it2: "سه روز در رم؛ برنامه پیشنهادی برای نخستین سفر",
  it3: "راهنمای کامل ساحل آمالفی؛ تماشایی‌ترین مسیر ساحلی ایتالیا",
  it4: "ونیز بدون شلوغی؛ کانال‌های آرام و تجربه‌های محلی",
  it5: "سیسیل؛ از ویرانه‌های باستانی تا خوراک خیابانی و آتشفشان",
  nl1: "آمستردام از نگاه محلی‌ها؛ فراتر از مسیرهای همیشگی",
  nl2: "فصل لاله‌ها در هلند؛ بهترین زمان و مکان تماشا",
  nl3: "دوچرخه‌سواری در روستاهای هلند؛ آسیاب‌ها و دهکده‌ها",
  pt1: "راهنمای لیسبون؛ برنامه کامل چهارروزه برای پایتخت پرتغال",
  pt2: "آلگاروه؛ زیباترین ساحل‌ها و خلیج‌های پنهان",
  pt3: "پورتو و دره دورو؛ نوشیدنی‌های محلی، پل‌ها و سفر رودخانه‌ای",
  es1: "چهار روز در بارسلونا؛ معماری گائودی، غذا و ساحل",
  es2: "سفر جاده‌ای در اندلس؛ از سویا تا گرانادا",
  es3: "سن‌سباستین؛ پایتخت خوش‌طعم اسپانیا",
  ph1: "جزیره‌گردی در پالاوان؛ راهنمای کامل ال‌نیدو",
  ph2: "بوهول و تپه‌های شکلاتی؛ راهنمای کامل سفر",
  ph3: "سیارگائو؛ پایتخت موج‌سواری فیلیپین",
  id1: "بالی فراتر از مسیرهای گردشگری؛ معبدها و شالیزارهای پنهان",
  id2: "پارک ملی کومودو؛ دیدار با اژدهای کومودو",
  id3: "جاوه؛ معبدها، آتشفشان‌ها و خوراک خیابانی",
  jp1: "اجاره کمپر در ژاپن؛ راهنمای کامل سفر جاده‌ای هفت‌روزه",
  jp2: "پنج روز در توکیو؛ راهنمای کامل پایتخت ژاپن",
  jp3: "راهنمای معبدهای کیوتو؛ ۱۲ معبد تماشایی",
  cn1: "دیوار بزرگ چین؛ بهترین بخش‌ها و راه‌های دوری از شلوغی",
  cn2: "گوییلین و یانگ‌شو؛ کوهستان‌های آهکی و سفر رودخانه‌ای",
  cn3: "شانگهای؛ جایی که شرق و غرب به هم می‌رسند",
  lk1: "دو هفته در سری‌لانکا؛ مسیر پیشنهادی از کلمبو تا ساحل",
  lk2: "الا در سری‌لانکا؛ پیاده‌روی، قطار و بهترین چشم‌اندازها",
  th1: "خوراک خیابانی بانکوک؛ راهنمای طعم‌های محبوب شهر",
  th2: "چیانگ‌مای؛ معبدها، بازارها و ماجراجویی کوهستانی",
  th3: "جزیره‌های تایلند؛ چگونه بهترین ساحل را انتخاب کنیم؟",
  vn1: "ویتنام با موتورسیکلت؛ مسیر پیشنهادی از شمال تا جنوب",
  vn2: "خلیج هالونگ؛ کشتی‌سواری، کایاک و روستاهای شناور",
  vn3: "هوی‌آن؛ فانوس‌ها، خیاطی و بهترین غذاهای ویتنام",
  bw1: "سفر جاده‌ای نامیبیا و بوتسوانا؛ بهترین مسیر جنوب آفریقا",
  bw2: "دلتای اوکاوانگو؛ راهنمای یکی از خاص‌ترین سافاری‌های جهان",
  ke1: "سافاری ماسایی مارا؛ بهترین زمان سفر و آنچه باید بدانید",
  ke2: "صعود به کوه کنیا؛ مسیرها، آمادگی و نکته‌های ضروری",
  ma1: "مراکش؛ راهنمای مدینه و انتخاب بهترین ریاضها",
  ma2: "صحرای بزرگ آفریقا؛ شترسواری و شب‌مانی زیر ستاره‌ها",
  ma3: "شفشاون؛ مروارید آبی مراکش در کوه‌های ریف",
  za1: "تماشای نهنگ‌ها در آفریقای جنوبی؛ بهترین مکان و فصل",
  za2: "کیپ‌تاون؛ کوه تیبل، پنگوئن‌ها و تاکستان‌های کیپ",
  za3: "پارک ملی کروگر؛ راهنمای سافاری با خودروی شخصی",
  cr1: "دو هفته در کاستاریکا؛ آتشفشان، جنگل بارانی و ساحل",
  cr2: "حیات‌وحش کاستاریکا؛ کجا تنبل‌ها و توکان‌ها را ببینیم؟",
  mx1: "مکزیکوسیتی؛ پایتختی دیدنی و کمتر شناخته‌شده",
  mx2: "شبه‌جزیره یوکاتان؛ ویرانه‌ها، سنوته‌ها و ساحل کارائیب",
  pe1: "ماچوپیچو؛ هرآنچه پیش از سفر باید بدانید",
  pe2: "لیما؛ پایتخت خوش‌طعم آمریکای جنوبی",
  co1: "کارتاخنا؛ حال‌وهوای استعماری در ساحل کارائیب کلمبیا",
  co2: "مثلث قهوه کلمبیا؛ مزرعه‌ها، پیاده‌روی و یک فنجان عالی",
  au1: "ساحل شرقی استرالیا؛ سفر جاده‌ای از سیدنی تا کِرنز",
  au2: "دیواره بزرگ مرجانی؛ غواصی و حفاظت از طبیعت",
  nz1: "جزیره جنوبی نیوزیلند؛ سفر جاده‌ای کامل دوهفته‌ای",
  nz2: "هابیتون و فراتر از آن؛ لوکیشن‌های ارباب حلقه‌ها",
  us1: "۱۰ پارک ملی آمریکا که باید ببینید",
  us2: "نیویورک برای سفر اولی‌ها؛ راهنمای کامل شهر",
  ca1: "رشته‌کوه‌های راکی کانادا؛ بنف، جسپر و مسیر یخچال‌ها",
  ca2: "ونکوور و جزیره ونکوور؛ دیدار کوهستان و اقیانوس آرام",
};

const categoryTitlesFa: Record<string, string> = {
  Europe: "اروپا",
  Asia: "آسیا",
  Africa: "آفریقا",
  Adventure: "ماجراجویی",
  Nature: "طبیعت",
  Culture: "فرهنگ",
  Food: "خوراک و رستوران",
  Museums: "موزه‌ها",
  Attractions: "دیدنی‌ها",
  Islands: "جزیره‌ها",
  History: "تاریخ",
  Beaches: "ساحل‌ها",
  Wildlife: "حیات‌وحش",
  "Hot Springs": "چشمه‌های آب‌گرم",
  "Northern Lights": "شفق قطبی",
};

const magazineCoverPaths = [
  "/hero-greece.webp",
  "/france.webp",
  "/iceland.webp",
  "/northern-lights.webp",
  "/morocco.webp",
  "/asia-temple.webp",
  "/africa-lion.webp",
  "/hero-desert.webp",
  "/hero-camping.webp",
  "/hero-kish-premium.webp",
  "/hero-hormuz-red.webp",
  "/hotel-istanbul-premium.webp",
  "/media/beach.webp",
  "/media/city.webp",
  "/media/lake.webp",
  "/media/mountain.webp",
  "/media/road.webp",
  "/media/train-b.webp",
  "/media/hotel-pool.webp",
  "/media/destinations/istanbul.webp",
  "/media/destinations/dubai.webp",
  "/media/destinations/tbilisi.webp",
  "/media/destinations/yerevan.webp",
  "/media/destinations/shiraz.webp",
  "/media/destinations/isfahan.webp",
  "/media/destinations/qeshm.webp",
];

const featuredCoverPaths: Record<string, string> = {
  feat1: "/hero-greece.webp",
  feat2: "/northern-lights.webp",
  feat3: "/morocco.webp",
};

const destinationCoverPaths: Record<string, string[]> = {
  fr: [
    "/france.webp",
    "/media/city.webp",
    "/media/road.webp",
    "/hero-camping.webp",
    "/media/beach.webp",
  ],
  gr: [
    "/hero-greece.webp",
    "/media/beach.webp",
    "/media/resort.webp",
    "/media/hotel-pool.webp",
    "/media/lake.webp",
  ],
  is: [
    "/iceland.webp",
    "/northern-lights.webp",
    "/media/road.webp",
    "/media/mountain.webp",
    "/hero-camping.webp",
  ],
  it: [
    "/france.webp",
    "/media/city.webp",
    "/media/road.webp",
    "/media/beach.webp",
    "/morocco.webp",
  ],
  nl: ["/media/city.webp", "/france.webp", "/media/road.webp"],
  pt: ["/media/city.webp", "/media/beach.webp", "/media/road.webp"],
  es: ["/media/city.webp", "/media/road.webp", "/media/beach.webp"],
  ph: ["/media/beach.webp", "/media/hotel-pool.webp", "/media/mountain.webp"],
  id: ["/asia-temple.webp", "/media/mountain.webp", "/media/city.webp"],
  jp: ["/media/road.webp", "/media/city.webp", "/asia-temple.webp"],
  cn: ["/media/mountain.webp", "/media/lake.webp", "/media/city.webp"],
  lk: ["/media/train-b.webp", "/media/mountain.webp"],
  th: ["/media/city.webp", "/asia-temple.webp", "/media/beach.webp"],
  vn: ["/media/road.webp", "/media/lake.webp", "/asia-temple.webp"],
  bw: ["/hero-desert.webp", "/africa-lion.webp"],
  ke: ["/africa-lion.webp", "/media/mountain.webp"],
  ma: ["/morocco.webp", "/hero-desert.webp", "/media/city.webp"],
  za: ["/media/beach.webp", "/media/mountain.webp", "/africa-lion.webp"],
  cr: ["/media/mountain.webp", "/media/beach.webp"],
  mx: ["/media/city.webp", "/asia-temple.webp"],
  pe: ["/media/mountain.webp", "/media/city.webp"],
  co: ["/media/city.webp", "/media/mountain.webp"],
  au: ["/media/road.webp", "/media/beach.webp"],
  nz: ["/media/mountain.webp", "/media/road.webp"],
  us: ["/hero-camping.webp", "/media/city.webp"],
  ca: ["/media/mountain.webp", "/media/beach.webp"],
};

export function magazineCoverPath(id: string): string {
  if (featuredCoverPaths[id]) return featuredCoverPaths[id];

  const match = id.match(/^([a-z]+)(\d+)$/i);
  if (match) {
    const [, prefix, number] = match;
    const destinationCovers = destinationCoverPaths[prefix];
    if (destinationCovers?.length)
      return destinationCovers[(Number(number) - 1) % destinationCovers.length];
  }

  let hash = 0;
  for (const character of id)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return magazineCoverPaths[hash % magazineCoverPaths.length];
}

export function localizeLegacyArticle(article: Article): Article {
  const title =
    articleTitlesFa[article.id] ?? "راهنمای کاربردی برنامه‌ریزی سفر";
  const category = categoryTitlesFa[article.category] ?? "راهنمای سفر";
  const excerpt = `${title}؛ نکته‌های کاربردی برای دیدنی‌ها، زمان‌بندی و ساختن یک برنامه سفر متعادل.`;

  return {
    ...article,
    title,
    excerpt,
    image: magazineCoverPath(article.id),
    category,
    author: "تحریریه کیاشی",
    content: [
      `${title} موضوع این راهنمای مجله کیاشی است. در این مطلب، مهم‌ترین انتخاب‌ها را کوتاه و روشن مرور می‌کنیم تا پیش از رزرو تصویر دقیق‌تری از مقصد داشته باشید.`,
      "برای شروع، فصل سفر، مدت اقامت و فاصله دیدنی‌ها از محل اقامت را کنار هم بگذارید. برنامه‌ای که زمان استراحت و جابه‌جایی را هم در نظر بگیرد، در عمل لذت‌بخش‌تر و قابل‌اجراتر است.",
      "هزینه ورودی جاذبه‌ها، حمل‌ونقل محلی و ساعت فعالیت مجموعه‌ها ممکن است تغییر کند. پیش از حرکت، اطلاعات روز را از منبع رسمی مقصد بررسی کنید و برای بخش‌های مهم برنامه یک گزینه جایگزین داشته باشید.",
      "در پایان، انتخاب محله مناسب و رزرو منعطف می‌تواند بخش زیادی از فشار سفر را کم کند. چک‌لیست مدارک، بیمه و وسایل ضروری را نیز چند روز پیش از حرکت نهایی کنید.",
    ],
  };
}

export function localizeLegacyArticles(articles: Article[]): Article[] {
  return articles.map(localizeLegacyArticle);
}
