import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TravelHero from "@/components/media/TravelHero";
import { CategoryBubble, ImageCard, OverlayCard, PromoBanner, SectionHeader } from "@/components/media/Cards";
import { continents } from "@/data/destinations";
import { seoDestinations } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";
import { destinationAsset, experienceAsset, legacyAsset, photoLibrary, serviceAsset } from "@/media/library";

export const metadata = createMetadata({
  title: "راهنمای مقصدهای سفر",
  description: "راهنمای فارسی مقصدهای منتخب با اطلاعات زمان سفر، حمل‌ونقل، مسیرهای پرواز و اقامت.",
  path: "/destinations",
  image: "/hero-greece.jpg",
});
export const revalidate = 86_400;

const themes = [
  { href: "/destinations/iran/kish", label: "ساحلی", media: "beach" },
  { href: "/destinations/iran/mashhad", label: "زیارتی", media: "pilgrimage" },
  { href: "/destinations/turkey/istanbul", label: "شهری", media: "city" },
  { href: "/city-tours", label: "طبیعت", media: "nature" },
  { href: "/tours", label: "تاریخی", media: "heritage" },
  { href: "/hotels", label: "لوکس", media: "luxury" },
] as const;

export default function DestinationsPage() {
  return (
    <main>
      <TravelHero
        asset={photoLibrary.greece}
        eyebrow="راهنمای مقصد"
        title="مقصد را آگاهانه انتخاب کنید"
        description="هر صفحه فقط برای مقصدی منتشر می‌شود که راهنمای کاربردی، پیوند مرتبط و تاریخ به‌روزرسانی واقعی داشته باشد؛ ترکیب‌های نازک و خودکار وارد ایندکس نمی‌شوند."
        badges={["زمان مناسب سفر", "رفت‌وآمد شهری", "پیوند پرواز و اقامت"]}
        secondary={{ href: "/blog", label: "مجلهٔ سفر" }}
      />

      <div className="container-page pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مقصدها", href: "/destinations" }]} />
      </div>

      <section className="pb-4 pt-8">
        <div className="container-page">
          <SectionHeader
            eyebrow="مقصدهای منتخب"
            title="راهنماهای کامل کیاشی"
            description="این مقصدها راهنمای فارسی اختصاصی، نکات رفت‌وآمد و پیوند مستقیم به پرواز و اقامت دارند."
          />
          <div className="media-grid sm:grid-cols-2 lg:grid-cols-3">
            {seoDestinations.map((item) => (
              <OverlayCard
                key={`${item.countrySlug}/${item.citySlug}`}
                href={`/destinations/${item.countrySlug}/${item.citySlug}`}
                asset={destinationAsset(item.citySlug, `تصویر مقصد ${item.city}`)}
                title={item.city}
                subtitle={item.summary}
                badge={item.country}
                ratio="4/5"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ))}
          </div>

          <ul className="scrollbar-none mt-9 flex gap-4 overflow-x-auto pb-1" aria-label="سبک سفر">
            {themes.map((theme) => (
              <li key={theme.label}>
                <CategoryBubble href={theme.href} asset={experienceAsset(theme.media, `تصویر سبک ${theme.label}`)} label={theme.label} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page">
          <PromoBanner
            href="/flights/tehran-to-kish"
            asset={experienceAsset("beach", "تصویرسازی سفر ساحلی")}
            eyebrow="سفر کوتاه"
            title="جزیره در چند روز"
            description="مسیر پرواز، زمان تحویل اتاق و برنامهٔ ساحلی را با هم هماهنگ کن."
            cta="راهنمای مسیر تهران به کیش"
          />
        </div>
      </section>

      <section className="media-section-tinted">
        <div className="container-page">
          <SectionHeader
            eyebrow="آرشیو مقصدها"
            title="مرور بر اساس قاره"
            description="آرشیو راهنمای مقصدهای پیشین با نشانی پایدار حفظ شده است."
          />
          <div className="media-grid sm:grid-cols-2 lg:grid-cols-3">
            {continents.map((continent) => (
              <ImageCard
                key={continent.slug}
                href={`/destinations/${continent.slug}`}
                asset={legacyAsset(continent.heroImage, `تصویر ${continent.name}`, continent.slug)}
                title={continent.name}
                description={continent.introduction}
                meta={`${continent.countries.length} مقصد`}
                cta="مشاهدهٔ مقصدها"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            { href: "/flights", label: "جست‌وجوی پرواز", text: "مسیر و تاریخ را بررسی کن." },
            { href: "/hotels", label: "جست‌وجوی هتل", text: "محله و شرایط لغو را بسنج." },
            { href: "/visa", label: "راهنمای ویزا", text: "مدارک عمومی را ببین." },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="group flex items-center justify-between gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-secondary/40">
              <span>
                <span className="block font-extrabold group-hover:text-primary">{link.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{link.text}</span>
              </span>
              <ArrowLeft className="size-5 text-secondary" />
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-14">
        <div className="container-page">
          <PromoBanner
            href="/support"
            asset={serviceAsset("support", "تصویر پشتیبانی سفر")}
            eyebrow="کمک برای انتخاب"
            title="در انتخاب مقصد مردد هستی؟"
            description="راهنمای خرید و پرسش‌های متداول کیاشی می‌تواند تصمیم را ساده‌تر کند."
            cta="مرکز راهنما"
            align="center"
          />
        </div>
      </section>
    </main>
  );
}
