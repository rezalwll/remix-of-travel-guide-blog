import Link from "next/link";
import { ArrowLeft, CheckCircle2, Compass, Headphones, ShieldCheck } from "lucide-react";
import BookingSearch from "@/components/home/BookingSearch";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, MediaRail, OverlayCard, PromoBanner, RailItem, SectionHeader } from "@/components/media/Cards";
import { routePolicy } from "@/seo/routes";
import { createMetadata } from "@/seo/metadata";
import { seoDestinations } from "@/seo/content";
import { destinationAsset, serviceAsset, type MediaAsset } from "@/media/library";

type PageKey =
  | "flights"
  | "hotels"
  | "routes"
  | "tours"
  | "ziyarat"
  | "visa"
  | "trains"
  | "buses"
  | "insurance"
  | "cip"
  | "transfer"
  | "fast-track"
  | "esim"
  | "city-tours";

type LandingLink = { href: string; label: string; text: string };

const content: Record<PageKey, { intro: string; points: string[]; links: LandingLink[] }> = {
  flights: { intro: "مبدأ، مقصد و تاریخ را وارد کنید و گزینه‌ها را با توجه به زمان، بار مجاز و شرایط تغییر بررسی کنید. قیمت و ظرفیت فقط در نتیجهٔ جست‌وجوی متصل به تأمین‌کننده معتبر است.", points: ["مقایسهٔ ساعت و فرودگاه", "بررسی بار و قوانین نرخ", "ادامهٔ امن تا پرداخت"], links: [{ href: "/flights/tehran-to-mashhad", label: "تهران به مشهد", text: "فرودگاه‌ها، مدت مسیر و نکات انتخاب پرواز" }, { href: "/flights/tehran-to-kish", label: "تهران به کیش", text: "راهنمای مسیر و هماهنگی پرواز با اقامت" }, { href: "/flights/tehran-to-istanbul", label: "تهران به استانبول", text: "نکات مسیر بین‌المللی و مدارک سفر" }] },
  hotels: { intro: "پیش از انتخاب اقامت، محله، فاصله تا نقاط اصلی و شرایط لغو را کنار قیمت نهایی بسنجید.", points: ["انتخاب محلهٔ مناسب", "بررسی امکانات و قوانین", "تطبیق تاریخ ورود و خروج"], links: [{ href: "/hotels/kish", label: "هتل‌های کیش", text: "راهنمای محله‌ها و انتخاب اقامت در جزیره" }, { href: "/hotels/mashhad", label: "هتل‌های مشهد", text: "فاصله، دسترسی و نکات رزرو" }, { href: "/hotels/istanbul", label: "هتل‌های استانبول", text: "مقایسهٔ محله‌های اصلی شهر" }] },
  routes: { intro: "مسیرهای پیشنهادی برای ساختن یک برنامهٔ واقع‌بینانه؛ زمان آزاد، جابه‌جایی و فصل مناسب را پیش از رزرو بسنجید.", points: ["برنامهٔ روزبه‌روز", "زمان‌بندی جابه‌جایی", "نکات فصل و بودجه"], links: [{ href: "/routes/turkiye-city-coast", label: "استانبول و ساحل اژه", text: "ترکیب شهر و ساحل با ریتم متعادل" }, { href: "/routes/persian-classic", label: "مسیر کلاسیک ایران", text: "تهران، کاشان، اصفهان و شیراز" }] },
  tours: { intro: "برنامه، خدمات مشمول و غیرمشمول و وضعیت مدارک را شفاف مقایسه کنید. ظرفیت نمایشی به معنی تأیید رزرو نیست.", points: ["برنامه و مدت روشن", "خدمات قابل مقایسه", "کنترل مدارک پیش از خرید"], links: [{ href: "/tours/tour-استانبول-0", label: "نمونه تور استانبول", text: "مشاهدهٔ برنامه و خدمات نمونه" }, { href: "/support", label: "راهنمای خرید", text: "پاسخ پرسش‌های رایج پیش از رزرو" }] },
  ziyarat: { intro: "نوع جابه‌جایی، محل اقامت، مدارک و خدمات کاروان را پیش از انتخاب برنامه بررسی کنید.", points: ["برنامهٔ آرام و شفاف", "مدارک و مقررات سفر", "خدمات اقامت و ترانسفر"], links: [{ href: "/ziyarat/ziyarat-0-0", label: "نمونه نجف و کربلا", text: "برنامه و خدمات نمونهٔ سفر زیارتی" }, { href: "/travel-preparation", label: "آمادگی سفر", text: "چک‌لیست عمومی پیش از حرکت" }] },
  visa: { intro: "اطلاعات این بخش راهنمای عمومی است؛ مدارک، هزینه و زمان رسیدگی را همیشه از مرجع رسمی مقصد کنترل کنید.", points: ["تفکیک نوع ویزا", "چک‌لیست مدارک", "ارجاع به مقررات رسمی"], links: [{ href: "/visa/canada", label: "ویزای کانادا", text: "انواع درخواست و مدارک عمومی" }, { href: "/visa/schengen", label: "ویزای شنگن", text: "راهنمای اولیهٔ درخواست" }, { href: "/visa/uae", label: "ویزای امارات", text: "اطلاعات عمومی سفر و درخواست" }] },
  trains: { intro: "زمان حرکت، ایستگاه، نوع واگن و قوانین استرداد را در نتیجهٔ معتبر بررسی کنید.", points: ["مقایسهٔ نوع واگن", "کنترل ایستگاه", "قوانین استرداد"], links: [{ href: "/trains/search", label: "جست‌وجوی قطار", text: "مشاهدهٔ گزینه‌های موجود" }] },
  buses: { intro: "پایانهٔ مبدأ و مقصد، نوع اتوبوس و ساعت حضور را پیش از خرید کنترل کنید.", points: ["انتخاب پایانه", "مقایسهٔ نوع اتوبوس", "اطلاعات سوارشدن"], links: [{ href: "/buses/search", label: "جست‌وجوی اتوبوس", text: "مشاهدهٔ گزینه‌های موجود" }] },
  insurance: { intro: "مقصد، مدت سفر، سن مسافران و سقف پوشش روی انتخاب بیمه اثر دارد.", points: ["مقایسهٔ سقف پوشش", "بررسی استثناها", "ثبت دقیق مسافران"], links: [{ href: "/support", label: "پشتیبانی", text: "پرسش دربارهٔ فرایند خرید" }] },
  cip: { intro: "فرودگاه، پرواز و تعداد مسافران را ثبت کنید تا امکان ارائهٔ خدمت بررسی شود.", points: ["تشریفات ورود یا خروج", "هماهنگی اطلاعات پرواز", "تأیید نهایی ارائه‌دهنده"], links: [{ href: "/fast-track", label: "فست ترک", text: "تفاوت خدمات عبور سریع و CIP" }] },
  transfer: { intro: "شماره پرواز، زمان رسیدن و تعداد بارها برای هماهنگی ترانسفر ضروری است.", points: ["زمان‌بندی با پرواز", "انتخاب ظرفیت خودرو", "اطلاعات محل ملاقات"], links: [{ href: "/cip", label: "خدمات فرودگاهی", text: "سایر خدمات هنگام ورود و خروج" }] },
  "fast-track": { intro: "این خدمت برای تسهیل مراحل فرودگاهی است و دامنهٔ آن در هر فرودگاه متفاوت است.", points: ["بررسی فرودگاه پشتیبانی‌شده", "هماهنگی ساعت پرواز", "تأیید محدودهٔ خدمت"], links: [{ href: "/cip", label: "خدمات CIP", text: "مقایسهٔ خدمات تشریفاتی" }] },
  esim: { intro: "سازگاری گوشی، کشورهای پوشش و حجم بسته را پیش از خرید کنترل کنید.", points: ["کنترل سازگاری دستگاه", "انتخاب پوشش مقصد", "فعال‌سازی پیش از سفر"], links: [{ href: "/travel-preparation", label: "آمادگی سفر", text: "چک‌لیست ارتباط و مدارک" }] },
  "city-tours": { intro: "مدت گشت، نقطهٔ شروع، زبان راهنما و خدمات مشمول را برای انتخاب تجربهٔ مناسب مقایسه کنید.", points: ["برنامه و مدت مشخص", "محل شروع روشن", "تفکیک هزینه‌های جانبی"], links: [{ href: "/destinations", label: "راهنمای مقصدها", text: "شناخت شهر پیش از انتخاب تجربه" }] },
};

const heroEyebrow: Record<PageKey, string> = {
  flights: "پرواز داخلی و خارجی",
  hotels: "اقامت شهری و ساحلی",
  routes: "برنامهٔ چندروزه",
  tours: "تور و برنامهٔ گروهی",
  ziyarat: "سفر زیارتی",
  visa: "راهنمای مدارک سفر",
  trains: "سفر ریلی",
  buses: "سفر جاده‌ای",
  insurance: "پوشش و ایمنی سفر",
  cip: "تشریفات فرودگاهی",
  transfer: "استقبال و ترانسفر",
  "fast-track": "عبور سریع فرودگاهی",
  esim: "اینترنت مقصد",
  "city-tours": "تجربه و گشت شهری",
};

/** Cross-sell tiles keep every service page connected instead of leaving it as a dead end. */
const crossSell: Record<PageKey, PageKey[]> = {
  flights: ["hotels", "transfer", "insurance"],
  hotels: ["flights", "city-tours", "transfer"],
  routes: ["flights", "hotels", "tours"],
  tours: ["ziyarat", "city-tours", "insurance"],
  ziyarat: ["tours", "transfer", "insurance"],
  visa: ["insurance", "flights", "esim"],
  trains: ["buses", "hotels", "insurance"],
  buses: ["trains", "hotels", "transfer"],
  insurance: ["visa", "flights", "esim"],
  cip: ["fast-track", "transfer", "flights"],
  transfer: ["cip", "hotels", "flights"],
  "fast-track": ["cip", "transfer", "flights"],
  esim: ["insurance", "visa", "city-tours"],
  "city-tours": ["tours", "hotels", "transfer"],
};

const serviceLabel: Record<PageKey, string> = {
  flights: "پرواز",
  hotels: "هتل",
  routes: "مسیرهای سفر",
  tours: "تور",
  ziyarat: "زیارت",
  visa: "ویزا",
  trains: "قطار",
  buses: "اتوبوس",
  insurance: "بیمه سفر",
  cip: "CIP فرودگاهی",
  transfer: "ترانسفر",
  "fast-track": "فست ترک",
  esim: "eSIM",
  "city-tours": "گشت شهری",
};

/** Picks the most relevant visual for a related-guide card from its destination slug. */
function linkAsset(href: string, page: PageKey, label: string): MediaAsset {
  const flightRoute = href.match(/^\/flights\/[a-z]+-to-([a-z-]+)$/);
  if (flightRoute) return destinationAsset(flightRoute[1], `تصویر مقصد ${label}`);
  const hotelCity = href.match(/^\/hotels\/([a-z-]+)$/);
  if (hotelCity) return destinationAsset(hotelCity[1], `تصویر مقصد ${label}`);
  if (href.startsWith("/visa/")) return serviceAsset("visa", `تصویر راهنمای ${label}`);
  if (href.startsWith("/routes/")) return serviceAsset("routes", `تصویر ${label}`);
  if (href.startsWith("/support") || href.startsWith("/travel-preparation")) return serviceAsset("support", `تصویر ${label}`);
  return serviceAsset(page, `تصویر ${label}`);
}

export function PublicLanding({ page }: { page: PageKey }) {
  const policy = routePolicy(`/${page}`);
  const item = content[page];
  if (!policy) throw new Error(`Missing route policy for ${page}`);
  const showSearch = page === "flights" || page === "hotels";
  const showDestinations = ["flights", "hotels", "tours", "routes", "city-tours", "ziyarat"].includes(page);

  return (
    <main>
      <TravelHero
        asset={serviceAsset(page, `تصویر معرفی ${serviceLabel[page]}`)}
        eyebrow={heroEyebrow[page]}
        title={policy.title}
        description={item.intro}
        badges={item.points}
        overlapBottom={showSearch}
        primary={showSearch ? { href: "#booking", label: "شروع جست‌وجو" } : undefined}
        secondary={{ href: "/support", label: "راهنمای خرید" }}
      />

      {showSearch && <BookingSearch />}

      <section className="media-section">
        <div className="container-page">
          <h2 className="sr-only">نکات کلیدی {serviceLabel[page]}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {item.points.map((point) => (
              <li key={point} className="flex items-center gap-2.5 rounded-xl border bg-card p-4 text-sm font-bold">
                <CheckCircle2 className="size-5 shrink-0 text-secondary" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="media-section-tinted">
        <div className="container-page">
          <SectionHeader
            eyebrow="راهنماهای مرتبط"
            title={`ادامهٔ مسیر ${serviceLabel[page]}`}
            description="این صفحه‌ها برای تصمیم‌گیری نوشته شده‌اند و نرخ یا ظرفیت قطعی اعلام نمی‌کنند."
          />
          <div className={`media-grid ${item.links.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {item.links.map((link) => (
              <ImageCard
                key={link.href}
                href={link.href}
                asset={linkAsset(link.href, page, link.label)}
                title={link.label}
                description={link.text}
                cta="مشاهدهٔ راهنما"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ))}
          </div>
        </div>
      </section>

      {showDestinations && (
        <section className="media-section">
          <div className="container-page">
            <SectionHeader
              eyebrow="مقصدهای منتخب"
              title="مقصد را قبل از رزرو بشناس"
              description="زمان مناسب سفر، رفت‌وآمد و محله‌های اقامت در راهنمای هر مقصد آمده است."
              action={{ href: "/destinations", label: "همهٔ مقصدها" }}
            />
            <MediaRail label="مقصدهای پیشنهادی">
              {seoDestinations.map((destination) => (
                <RailItem key={`${destination.countrySlug}/${destination.citySlug}`}>
                  <OverlayCard
                    href={`/destinations/${destination.countrySlug}/${destination.citySlug}`}
                    asset={destinationAsset(destination.citySlug, `تصویر مقصد ${destination.city}`)}
                    title={destination.city}
                    subtitle={destination.summary}
                    badge={destination.country}
                    ratio="4/3"
                    sizes="(max-width: 640px) 78vw, 31vw"
                  />
                </RailItem>
              ))}
            </MediaRail>
          </div>
        </section>
      )}

      <section className="media-section-tinted">
        <div className="container-page">
          <SectionHeader eyebrow="خدمات مکمل" title="کنار این سرویس چه چیزی لازم می‌شود؟" />
          <div className="media-grid md:grid-cols-3">
            {crossSell[page].map((related) => (
              <Link
                key={related}
                href={`/${related}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-secondary/40"
              >
                <span>
                  <span className="block font-extrabold group-hover:text-primary">{serviceLabel[related]}</span>
                  <span className="mt-1 block text-xs leading-6 text-muted-foreground">{content[related].points[0]}</span>
                </span>
                <ArrowLeft className="size-5 shrink-0 text-secondary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6">
            <ShieldCheck className="size-6 text-secondary" />
            <h2 className="mt-3 font-black">پرداخت و نشست امن</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">نشست با کوکی HttpOnly نگه داشته می‌شود و مالکیت سفارش سمت سرور کنترل می‌شود.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Compass className="size-6 text-secondary" />
            <h2 className="mt-3 font-black">اطلاعات بدون اغراق</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">محتوای راهنما از موجودی و نرخ واقعی تأمین‌کننده جدا نگه داشته می‌شود.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Headphones className="size-6 text-secondary" />
            <h2 className="mt-3 font-black">پیگیری سفارش</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">وضعیت سفارش، استرداد و پشتیبانی در حساب کاربری قابل پیگیری است.</p>
          </div>
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className="container-page">
          <PromoBanner
            href="/support"
            asset={serviceAsset("support", "تصویر بخش پشتیبانی سفر")}
            eyebrow="همراه سفر"
            title="قبل از خرید سؤال داری؟"
            description="راهنمای خرید، شرایط استرداد و پیگیری سفارش در مرکز راهنما جمع شده است."
            cta="مرکز راهنما"
            align="center"
          />
        </div>
      </section>
    </main>
  );
}

export type { PageKey };

export function publicPageMetadata(page: PageKey) {
  const policy = routePolicy(`/${page}`);
  if (!policy) throw new Error(`Missing route policy for ${page}`);
  return createMetadata({ title: policy.title, description: policy.description, path: policy.path });
}
