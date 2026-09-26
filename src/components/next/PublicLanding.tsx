import Link from "next/link";
import { ArrowLeft, Compass, Headphones, ShieldCheck } from "lucide-react";
import BookingSearch from "@/components/home/BookingSearch";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, MediaRail, OverlayCard, PromoBanner, RailItem, SectionHeader } from "@/components/media/Cards";
import { routePolicy } from "@/seo/routes";
import { createMetadata } from "@/seo/metadata";
import { seoDestinations } from "@/seo/content";
import { destinationAsset, photoLibrary, serviceAsset, type MediaAsset } from "@/media/library";

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
  | "transfer";

type LandingLink = { href: string; label: string; text: string };

const content: Record<PageKey, { intro: string; links: LandingLink[] }> = {
  flights: { intro: "مبدأ، مقصد و تاریخ را وارد کنید و گزینه‌ها را با توجه به زمان، بار مجاز و شرایط تغییر بررسی کنید. قیمت و ظرفیت فقط در نتیجهٔ جست‌وجوی متصل به تأمین‌کننده معتبر است.", links: [{ href: "/flights/tehran-to-mashhad", label: "تهران به مشهد", text: "فرودگاه‌ها، مدت مسیر و نکات انتخاب پرواز" }, { href: "/flights/tehran-to-kish", label: "تهران به کیش", text: "راهنمای مسیر و هماهنگی پرواز با اقامت" }, { href: "/flights/tehran-to-istanbul", label: "تهران به استانبول", text: "نکات مسیر بین‌المللی و مدارک سفر" }] },
  hotels: { intro: "پیش از انتخاب اقامت، محله، فاصله تا نقاط اصلی و شرایط لغو را کنار قیمت نهایی بسنجید.", links: [{ href: "/hotels/kish", label: "هتل‌های کیش", text: "راهنمای محله‌ها و انتخاب اقامت در جزیره" }, { href: "/hotels/mashhad", label: "هتل‌های مشهد", text: "فاصله، دسترسی و نکات رزرو" }, { href: "/hotels/istanbul", label: "هتل‌های استانبول", text: "مقایسهٔ محله‌های اصلی شهر" }] },
  routes: { intro: "مسیرهای پیشنهادی برای ساختن یک برنامهٔ واقع‌بینانه؛ زمان آزاد، جابه‌جایی و فصل مناسب را پیش از رزرو بسنجید.", links: [{ href: "/routes/turkiye-city-coast", label: "استانبول و ساحل اژه", text: "ترکیب شهر و ساحل با ریتم متعادل" }, { href: "/routes/persian-classic", label: "مسیر کلاسیک ایران", text: "تهران، کاشان، اصفهان و شیراز" }] },
  tours: { intro: "برنامه، خدمات مشمول و غیرمشمول و وضعیت مدارک را شفاف مقایسه کنید. ظرفیت نمایشی به معنی تأیید رزرو نیست.", links: [{ href: "/tours/tour-استانبول-0", label: "نمونه تور استانبول", text: "مشاهدهٔ برنامه و خدمات نمونه" }, { href: "/support", label: "راهنمای خرید", text: "پاسخ پرسش‌های رایج پیش از رزرو" }] },
  ziyarat: { intro: "نوع جابه‌جایی، محل اقامت، مدارک و خدمات کاروان را پیش از انتخاب برنامه بررسی کنید.", links: [{ href: "/ziyarat/ziyarat-0-0", label: "نمونه نجف و کربلا", text: "برنامه و خدمات نمونهٔ سفر زیارتی" }, { href: "/travel-preparation", label: "آمادگی سفر", text: "چک‌لیست عمومی پیش از حرکت" }] },
  visa: { intro: "اطلاعات این بخش راهنمای عمومی است؛ مدارک، هزینه و زمان رسیدگی را همیشه از مرجع رسمی مقصد کنترل کنید.", links: [{ href: "/visa/canada", label: "ویزای کانادا", text: "انواع درخواست و مدارک عمومی" }, { href: "/visa/schengen", label: "ویزای شنگن", text: "راهنمای اولیهٔ درخواست" }, { href: "/visa/uae", label: "ویزای امارات", text: "اطلاعات عمومی سفر و درخواست" }] },
  trains: { intro: "زمان حرکت، ایستگاه، نوع واگن و قوانین استرداد را در نتیجهٔ معتبر بررسی کنید.", links: [{ href: "/trains/search", label: "جست‌وجوی قطار", text: "مشاهدهٔ گزینه‌های موجود" }] },
  buses: { intro: "پایانهٔ مبدأ و مقصد، نوع اتوبوس و ساعت حضور را پیش از خرید کنترل کنید.", links: [{ href: "/buses/search", label: "جست‌وجوی اتوبوس", text: "مشاهدهٔ گزینه‌های موجود" }] },
  insurance: { intro: "مقصد، مدت سفر، سن مسافران و سقف پوشش روی انتخاب بیمه اثر دارد.", links: [{ href: "/support", label: "پشتیبانی", text: "پرسش دربارهٔ فرایند خرید" }] },
  cip: { intro: "فرودگاه، پرواز و تعداد مسافران را ثبت کنید تا امکان ارائهٔ خدمت بررسی شود.", links: [{ href: "/transfer", label: "ترانسفر فرودگاهی", text: "هماهنگی مسیر فرودگاه تا محل اقامت" }] },
  transfer: { intro: "شماره پرواز، زمان رسیدن و تعداد بارها برای هماهنگی ترانسفر ضروری است.", links: [{ href: "/cip", label: "خدمات فرودگاهی", text: "سایر خدمات هنگام ورود و خروج" }] },
};

/** Cross-sell tiles keep every service page connected instead of leaving it as a dead end. */
const crossSell: Record<PageKey, PageKey[]> = {
  flights: ["hotels", "transfer", "insurance"],
  hotels: ["flights", "tours", "transfer"],
  routes: ["flights", "hotels", "tours"],
  tours: ["ziyarat", "hotels", "insurance"],
  ziyarat: ["tours", "transfer", "insurance"],
  visa: ["insurance", "flights", "transfer"],
  trains: ["buses", "hotels", "insurance"],
  buses: ["trains", "hotels", "transfer"],
  insurance: ["visa", "flights", "transfer"],
  cip: ["transfer", "flights", "insurance"],
  transfer: ["cip", "hotels", "flights"],
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
  const showDestinations = ["flights", "hotels", "tours", "routes", "ziyarat"].includes(page);

  return (
    <main>
      <TravelHero
        asset={serviceAsset(page, `تصویر معرفی ${serviceLabel[page]}`)}
        title={policy.title}
        description={item.intro}
        overlapBottom={showSearch}
        primary={showSearch ? { href: "#booking", label: "شروع جست‌وجو" } : undefined}
        secondary={{ href: "/support", label: "راهنمای خرید" }}
      />

      {showSearch && <BookingSearch />}

      <section className="media-section-tinted">
        <div className="container-page">
          <SectionHeader
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
          <SectionHeader title="کنار این سرویس چه چیزی لازم می‌شود؟" />
          <div className="media-grid md:grid-cols-3">
            {crossSell[page].map((related) => (
              <Link
                key={related}
                href={`/${related}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-secondary/40"
              >
                <span>
                  <span className="block font-extrabold group-hover:text-primary">{serviceLabel[related]}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-6 text-muted-foreground">{content[related].intro}</span>
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
            asset={photoLibrary.kiashiTravelBanner}
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
