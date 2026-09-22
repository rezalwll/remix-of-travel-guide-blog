import Link from "next/link";
import {
  ArmchairIcon,
  BadgeCheck,
  BusFront,
  Compass,
  FileText,
  Headphones,
  Hotel,
  LifeBuoy,
  Plane,
  Signal,
  Sparkles,
  TrainFront,
  Car,
  ShieldCheck,
} from "lucide-react";
import BookingSearch from "@/components/home/BookingSearch";
import TravelHero from "@/components/media/TravelHero";
import {
  CategoryBubble,
  EditorialCard,
  ImageCard,
  MediaRail,
  OverlayCard,
  PromoBanner,
  RailItem,
  RouteCard,
  SectionHeader,
  ServiceTile,
} from "@/components/media/Cards";
import { createMetadata } from "@/seo/metadata";
import { seoArticles, seoDestinations, seoHotelLandings, seoRoutes } from "@/seo/content";
import {
  destinationAsset,
  editorialMedia,
  experienceAsset,
  photoLibrary,
  serviceAsset,
  stayMedia,
} from "@/media/library";

export const metadata = createMetadata({
  title: "پرواز، هتل و راهنمای سفر",
  description: "جست‌وجوی پرواز و هتل، راهنمای مقصدهای منتخب و مدیریت شفاف سفر در کی‌آشی.",
  path: "/",
  image: "/hero-kish-premium.webp",
});

export const revalidate = 86_400;

const services = [
  { href: "/flights", label: "پرواز", hint: "داخلی و خارجی", icon: Plane, media: "flights" },
  { href: "/hotels", label: "هتل", hint: "اقامت شهری و ساحلی", icon: Hotel, media: "hotels" },
  { href: "/tours", label: "تور", hint: "برنامه‌های چندروزه", icon: Compass, media: "tours" },
  { href: "/ziyarat", label: "زیارت", hint: "نجف، کربلا و مشهد", icon: Sparkles, media: "ziyarat" },
  { href: "/trains", label: "قطار", hint: "مسیرهای ریلی", icon: TrainFront, media: "trains" },
  { href: "/buses", label: "اتوبوس", hint: "پوشش جاده‌ای", icon: BusFront, media: "buses" },
  { href: "/insurance", label: "بیمه سفر", hint: "پوشش متناسب مقصد", icon: ShieldCheck, media: "insurance" },
  { href: "/cip", label: "CIP", hint: "تشریفات فرودگاهی", icon: ArmchairIcon, media: "cip" },
  { href: "/transfer", label: "ترانسفر", hint: "استقبال فرودگاهی", icon: Car, media: "transfer" },
  { href: "/visa", label: "ویزا", hint: "راهنمای مدارک", icon: FileText, media: "visa" },
  { href: "/fast-track", label: "فست ترک", hint: "عبور سریع", icon: LifeBuoy, media: "fast-track" },
  { href: "/esim", label: "eSIM", hint: "اینترنت مقصد", icon: Signal, media: "esim" },
] as const;

const categories = [
  { href: "/destinations/iran/kish", label: "ساحلی", media: "beach" },
  { href: "/city-tours", label: "طبیعت", media: "nature" },
  { href: "/destinations/turkey/istanbul", label: "شهری", media: "city" },
  { href: "/ziyarat", label: "زیارتی", media: "pilgrimage" },
  { href: "/destinations/iran/mashhad", label: "تاریخی", media: "heritage" },
  { href: "/hotels/istanbul", label: "لوکس", media: "luxury" },
  { href: "/buses", label: "اقتصادی", media: "budget" },
] as const;

const trust = [
  { icon: ShieldCheck, title: "پرداخت و نشست امن", text: "کوکی HttpOnly، مالکیت سفارش و کنترل کامل سمت سرور." },
  { icon: BadgeCheck, title: "اطلاعات بدون اغراق", text: "محتوای راهنما از موجودی و نرخ واقعی تأمین‌کننده جدا می‌ماند." },
  { icon: Headphones, title: "پیگیری شفاف", text: "وضعیت سفارش، استرداد و پشتیبانی در یک حساب کاربری." },
] as const;

const [leadArticle, ...restArticles] = seoArticles;

export default function HomePage() {
  return (
    <main>
      <TravelHero
        asset={photoLibrary.kishShore}
        size="page"
        overlapBottom
        eyebrow="سفر آگاهانه، از جست‌وجو تا پیگیری"
        title={<>سفر را انتخاب کن،<br /><span className="text-accent">نگرانی‌اش با ما</span></>}
        description="پرواز، اقامت و تجربه‌های مقصد را مقایسه کن؛ راهنمای واقعی بخوان و همه جزئیات سفر را در یک حساب مدیریت کن."
        primary={{ href: "#booking", label: "شروع جست‌وجو" }}
        secondary={{ href: "/destinations", label: "کشف مقصدها" }}
        badges={["بدون قیمت ساختگی", "راهنمای فارسی مقصد", "پشتیبانی سفارش"]}
      />

      <BookingSearch />

      <section className="media-section" aria-labelledby="services-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="خدمات کی‌آشی"
            title="از کجا شروع می‌کنی؟"
            description="هر سرویس صفحهٔ راهنمای خودش را دارد؛ جست‌وجوی واقعی و نرخ فقط در نتیجهٔ متصل به تأمین‌کننده انجام می‌شود."
          />
          <h2 id="services-heading" className="sr-only">خدمات سفر</h2>
          <div className="media-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {services.map((service) => (
              <ServiceTile
                key={service.href}
                href={service.href}
                asset={serviceAsset(service.media, `تصویر معرفی ${service.label}`)}
                label={service.label}
                hint={service.hint}
                icon={service.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="media-section-tinted" aria-labelledby="routes-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="مسیرهای پرطرفدار"
            title="راهنمای مسیرهای پرتردد"
            description="فرودگاه، مدت مسیر، بار و شرایط استرداد را پیش از جست‌وجو بدان. این صفحه‌ها نرخ زنده اعلام نمی‌کنند."
            action={{ href: "/routes", label: "همهٔ مسیرها" }}
          />
          <h2 id="routes-heading" className="sr-only">مسیرهای پرطرفدار</h2>
          <div className="media-grid md:grid-cols-3">
            {seoRoutes.map((route) => (
              <RouteCard
                key={route.slug}
                href={`/flights/${route.slug}`}
                origin={route.origin}
                destination={route.destination}
                note={route.summary}
                badge="راهنمای مسیر"
                originAsset={destinationAsset(route.origin === "تهران" ? "tehran" : route.slug.split("-to-")[0], `تصویرسازی ${route.origin}`)}
                destinationAsset={destinationAsset(route.slug.split("-to-")[1], `تصویرسازی ${route.destination}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page">
          <PromoBanner
            href="/hotels/kish"
            asset={experienceAsset("beach", "تصویرسازی ساحل و آب‌های کیش")}
            eyebrow="پیشنهاد فصلی"
            title="چند روز آبی در کیش"
            description="پرواز، اقامت و برنامهٔ ساحلی را یکجا بچین. محتوای این بنر راهنماست و نرخ یا ظرفیت قطعی اعلام نمی‌کند."
            cta="راهنمای اقامت کیش"
          />
        </div>
      </section>

      <section className="media-section-tinted" aria-labelledby="destinations-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="مقصدهای منتخب"
            title="مقصد را با چشم باز انتخاب کن"
            description="هر مقصد فقط وقتی منتشر می‌شود که راهنمای واقعی، زمان مناسب سفر و پیوندهای کاربردی داشته باشد."
            action={{ href: "/destinations", label: "همهٔ مقصدها" }}
          />
          <h2 id="destinations-heading" className="sr-only">مقصدهای منتخب</h2>
          <div className="media-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {seoDestinations.map((destination, index) => (
              <OverlayCard
                key={`${destination.countrySlug}/${destination.citySlug}`}
                href={`/destinations/${destination.countrySlug}/${destination.citySlug}`}
                asset={destinationAsset(destination.citySlug, `تصویر مقصد ${destination.city}`)}
                title={destination.city}
                subtitle={destination.summary}
                badge={destination.country}
                ratio={index === 0 ? "4/5" : "4/5"}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ))}
          </div>

          <ul className="scrollbar-none mt-9 flex gap-4 overflow-x-auto pb-1" aria-label="دسته‌بندی سبک سفر">
            {categories.map((category) => (
              <li key={category.href}>
                <CategoryBubble href={category.href} asset={experienceAsset(category.media, `تصویر دستهٔ ${category.label}`)} label={category.label} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="media-section" aria-labelledby="stays-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="اقامت"
            title="راهنمای انتخاب هتل"
            description="محله، فاصله و شرایط لغو را پیش از رزرو بسنج. موجودی و نرخ فقط در جست‌وجوی واقعی معتبر است."
            action={{ href: "/hotels", label: "جست‌وجوی هتل" }}
          />
          <h2 id="stays-heading" className="sr-only">راهنمای اقامت</h2>
          <MediaRail label="شهرهای پیشنهادی برای اقامت">
            {seoHotelLandings.map((stay, index) => (
              <RailItem key={stay.slug}>
                <ImageCard
                  href={`/hotels/${stay.slug}`}
                  asset={index === 0 ? stayMedia.seaView : index === 1 ? stayMedia.city : stayMedia.boutique}
                  title={stay.title}
                  description={stay.summary}
                  chips={stay.neighborhoods.slice(0, 3)}
                  badge="راهنمای اقامت"
                  cta="مشاهدهٔ راهنما"
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 31vw"
                />
              </RailItem>
            ))}
          </MediaRail>
        </div>
      </section>

      <section className="media-section-tinted" aria-labelledby="experiences-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="تجربه‌های مقصد"
            title="سفر فقط بلیط نیست"
            description="تور، سفر زیارتی و گشت شهری با برنامه و خدمات مشخص؛ ظرفیت نمایشی به معنی تأیید رزرو نیست."
          />
          <h2 id="experiences-heading" className="sr-only">تجربه‌های مقصد</h2>
          <div className="media-grid md:grid-cols-3">
            <ImageCard
              href="/tours"
              asset={serviceAsset("tours", "تصویر معرفی تورهای کی‌آشی")}
              title="تورهای چندروزه"
              description="برنامهٔ روزبه‌روز، خدمات مشمول و شرایط مدارک را کنار هم مقایسه کن."
              chips={["برنامهٔ شفاف", "خدمات قابل مقایسه"]}
              cta="راهنمای تور"
            />
            <ImageCard
              href="/ziyarat"
              asset={serviceAsset("ziyarat", "تصویر معرفی سفرهای زیارتی")}
              title="سفر زیارتی"
              description="جابه‌جایی، اقامت، مدارک و خدمات کاروان با زبانی آرام و روشن."
              chips={["نجف و کربلا", "مشهد"]}
              cta="راهنمای زیارت"
            />
            <ImageCard
              href="/city-tours"
              asset={serviceAsset("city-tours", "تصویر معرفی گشت‌های شهری")}
              title="گشت شهری و تجربه"
              description="مدت گشت، نقطهٔ شروع و هزینه‌های جانبی را قبل از انتخاب بدان."
              chips={["نیم‌روزه", "تمام‌روز"]}
              cta="مشاهدهٔ تجربه‌ها"
            />
          </div>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page">
          <PromoBanner
            href="/flights/tehran-to-istanbul"
            asset={photoLibrary.greece}
            eyebrow="سفر شهری"
            title="استانبول، دو قاره در یک سفر"
            description="فرودگاه مقصد، محلهٔ اقامت و شرایط ورود را پیش از خرید بررسی کن."
            cta="راهنمای مسیر تهران به استانبول"
          />
        </div>
      </section>

      <section className="media-section-tinted" aria-labelledby="magazine-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="مجلهٔ سفر"
            title="قبل از حرکت بخوان"
            description="راهنماهای کوتاه و به‌روزشده برای تصمیم بهتر، با تاریخ به‌روزرسانی واقعی."
            action={{ href: "/blog", label: "همهٔ مقاله‌ها" }}
          />
          <h2 id="magazine-heading" className="sr-only">مجلهٔ سفر</h2>
          <div className="media-grid lg:grid-cols-[1.55fr_1fr]">
            {leadArticle && (
              <EditorialCard
                featured
                href={`/blog/${leadArticle.slug}`}
                asset={editorialMedia.seasons}
                title={leadArticle.title}
                description={leadArticle.description}
                category="راهنمای مقصد"
                date={new Date(leadArticle.updatedAt).toLocaleDateString("fa-IR")}
              />
            )}
            <div className="grid gap-4">
              {restArticles.map((article, index) => (
                <EditorialCard
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  asset={index === 0 ? editorialMedia.planning : editorialMedia.travellers}
                  title={article.title}
                  category="مجله"
                  date={new Date(article.updatedAt).toLocaleDateString("fa-IR")}
                />
              ))}
              <Link href="/travel-preparation" className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm font-bold transition hover:border-secondary/50 hover:text-secondary">
                چک‌لیست آمادگی سفر
                <Compass className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page">
          <h2 className="sr-only">چرا کی‌آشی</h2>
          <div className="grid overflow-hidden rounded-[1.25rem] border bg-card sm:grid-cols-3">
            {trust.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3 border-b p-6 last:border-0 sm:border-b-0 sm:border-l">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <PromoBanner
              href="/support"
              asset={serviceAsset("support", "تصویر بخش پشتیبانی سفر")}
              eyebrow="همراه سفر"
              title="سؤالی دربارهٔ سفر داری؟"
              description="راهنمای خرید، استرداد و پیگیری سفارش در مرکز راهنمای کی‌آشی جمع شده است."
              cta="مرکز راهنما"
              align="center"
            />
          </div>
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="container-page py-10">
          <h2 className="text-lg font-black">برنامه‌ریزی سفر با کی‌آشی</h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-muted-foreground">
            کی‌آشی مسیر انتخاب سفر را از جست‌وجوی پرواز و هتل تا پیگیری سفارش یکپارچه می‌کند.
            صفحه‌های راهنمای مقصد و مسیر برای تصمیم‌گیری نوشته شده‌اند و نرخ، ظرفیت و موجودی فقط
            در نتیجهٔ جست‌وجوی متصل به تأمین‌کننده معتبر است. خدمات مکمل مانند بیمه، ترانسفر،
            تشریفات فرودگاهی و اینترنت مقصد هم با همان منطق شفاف ارائه می‌شوند.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              { href: "/flights/tehran-to-mashhad", label: "پرواز تهران به مشهد" },
              { href: "/flights/tehran-to-kish", label: "پرواز تهران به کیش" },
              { href: "/hotels/mashhad", label: "هتل‌های مشهد" },
              { href: "/hotels/kish", label: "هتل‌های کیش" },
              { href: "/destinations/turkey/istanbul", label: "راهنمای استانبول" },
              { href: "/visa", label: "راهنمای ویزا" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="soft-chip hover:border-secondary/50 hover:text-secondary">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
