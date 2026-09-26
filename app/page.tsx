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
  description: "جست‌وجوی پرواز و هتل، راهنمای مقصدهای منتخب و مدیریت شفاف سفر در کیاشی.",
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

const trust = [
  { icon: ShieldCheck, title: "پرداخت امن", text: "اطلاعات پرداخت در درگاه بانکی و با استانداردهای امنیتی پردازش می‌شود." },
  { icon: BadgeCheck, title: "مقایسه و انتخاب آسان", text: "گزینه‌های سفر را بر اساس زمان، قیمت و شرایط رزرو بررسی کنید." },
  { icon: Headphones, title: "پیگیری آنلاین", text: "سفارش‌ها و درخواست‌های پشتیبانی را از حساب کاربری دنبال کنید." },
] as const;

const [leadArticle, ...restArticles] = seoArticles;

export default function HomePage() {
  return (
    <main>
      <TravelHero
        asset={photoLibrary.kishShore}
        size="page"
        overlapBottom
        bright
        brandWash
        relaxedCopy
        title={<>سفر بعدی‌ات را<br /><span className="text-[#ffdd9c]">همین‌جا پیدا کن</span></>}
        description="بلیط هواپیما، قطار و اتوبوس، هتل، تور و خدمات سفر را جست‌وجو و رزرو کن."
        primary={{ href: "#booking", label: "جست‌وجوی سفر" }}
        secondary={{ href: "/track-order", label: "پیگیری خرید" }}
      />

      <BookingSearch />

      <section className="media-section" aria-labelledby="services-heading">
        <div className="container-page">
          <SectionHeader
            title="خدمات سفر"
            description="برای خرید بلیط، رزرو اقامت یا استفاده از خدمات تکمیلی، گزینهٔ موردنظرت را انتخاب کن."
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
            title="پرواز به مقصدهای پرطرفدار"
            description="مسیرهای محبوب را ببین و اطلاعات پرواز، فرودگاه و شرایط سفر را بررسی کن."
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
                badge="مسیر پرطرفدار"
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
            eyebrow="سفر به کیش"
            title="تعطیلاتی کنار خلیج فارس"
            description="پرواز و هتل کیش را برای تاریخ سفرت بررسی کن و برای تفریحات جزیره برنامه بریز."
            cta="مشاهده هتل‌های کیش"
          />
        </div>
      </section>

      <section className="media-section-tinted" aria-labelledby="destinations-heading">
        <div className="container-page">
          <SectionHeader
            title="مقصدهای محبوب ایران و جهان"
            description="با شهرهای پرطرفدار، بهترین زمان سفر و دیدنی‌های هر مقصد آشنا شو."
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
        </div>
      </section>

      <section className="media-section" aria-labelledby="stays-heading">
        <div className="container-page">
          <SectionHeader
            title="هتل‌های پرطرفدار"
            description="هتل‌های مقصدهای محبوب را بر اساس موقعیت، امکانات و شرایط رزرو مقایسه کن."
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
                  badge="اقامت محبوب"
                  cta="مشاهده هتل‌ها"
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
            title="تور و تجربه‌های سفر"
            description="از تورهای چندروزه تا سفرهای زیارتی و گشت شهری، برنامهٔ مناسب سفرت را پیدا کن."
          />
          <h2 id="experiences-heading" className="sr-only">تجربه‌های مقصد</h2>
          <div className="media-grid md:grid-cols-3">
            <ImageCard
              href="/tours"
              asset={serviceAsset("tours", "تصویر معرفی تورهای کیاشی")}
              title="تورهای چندروزه"
              description="تورهای داخلی و خارجی را بر اساس مقصد، مدت سفر و خدمات مقایسه کن."
              chips={["تور داخلی", "تور خارجی"]}
              cta="مشاهده تورها"
            />
            <ImageCard
              href="/ziyarat"
              asset={serviceAsset("ziyarat", "تصویر معرفی سفرهای زیارتی")}
              title="سفر زیارتی"
              description="برنامه‌های سفر به مشهد، نجف و کربلا را همراه با خدمات هر سفر ببین."
              chips={["نجف و کربلا", "مشهد"]}
              cta="راهنمای زیارت"
            />
            <ImageCard
              href="/city-tours"
              asset={serviceAsset("city-tours", "تصویر معرفی گشت‌های شهری")}
              title="گشت شهری و تجربه"
              description="دیدنی‌های هر شهر را با گشت‌های نیم‌روزه و تمام‌روز تجربه کن."
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
            title="راهنمای سفر"
            description="پیشنهادهای کاربردی برای انتخاب مقصد، برنامه‌ریزی و تجربهٔ بهتر سفر."
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
          <h2 className="mb-7 text-2xl font-black sm:text-3xl">چرا کیاشی؟</h2>
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
              eyebrow="پشتیبانی"
              title="برای رزرو یا پیگیری خرید کمک می‌خواهی؟"
              description="پاسخ پرسش‌های متداول، راهنمای استرداد و وضعیت سفارش را در مرکز پشتیبانی ببین."
              cta="رفتن به پشتیبانی"
              align="center"
            />
          </div>
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="container-page py-10">
          <h2 className="text-lg font-black">رزرو خدمات سفر با کیاشی</h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-muted-foreground">
            در کیاشی می‌توانید پرواز، هتل، قطار، اتوبوس و تور را جست‌وجو کنید و خدماتی مثل بیمه،
            ترانسفر، تشریفات فرودگاهی و اینترنت سفر را هم در کنار رزرو اصلی ببینید. راهنماهای مسیر
            و مقصد نیز برای آشنایی با زمان سفر، فرودگاه‌ها، محله‌های اقامتی و دیدنی‌ها در دسترس‌اند.
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
