import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Search, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, ImageMosaic, PromoBanner, SectionHeader } from "@/components/media/Cards";
import { getHotelLanding, isIndexableContent, seoHotelLandings } from "@/seo/content";
import { createMetadata, privateMetadata } from "@/seo/metadata";
import { hotels } from "@/data/hotels";
import LegacyPage from "@/components/next/LegacyPage";
import { destinationAsset, serviceAsset, stayMedia } from "@/media/library";
import { PersianDatePicker } from "@/components/ui/PersianDatePicker";

export const revalidate = 43_200;
export const dynamicParams = false;
const hotelDetailSlugs = new Set(hotels.map((item) => item.slug));
const landingCollisions = seoHotelLandings.filter((item) => hotelDetailSlugs.has(item.slug));
if (landingCollisions.length) throw new Error(`Hotel landing/detail slug collision: ${landingCollisions.map((item) => item.slug).join(", ")}`);
export function generateStaticParams() { return [...seoHotelLandings.filter((item) => isIndexableContent(item, 3)).map((item) => ({ slug: item.slug })), ...hotels.map((item) => ({ slug: item.slug }))]; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getHotelLanding(slug);
  if (item) {
    const media = destinationAsset(item.slug);
    return createMetadata({ title: `${item.title} | مقایسه و رزرو هتل`, description: item.description, path: `/hotels/${slug}`, image: media.kind === "photo" ? media.src : undefined, index: isIndexableContent(item, 3) });
  }
  const hotel = hotels.find((value) => value.slug === slug);
  return hotel ? privateMetadata(hotel.name, "جزئیات نمایشی هتل تا زمان اتصال موجودی معتبر از ایندکس خارج است.") : {};
}

export default async function HotelLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getHotelLanding(slug);
  if (!item) {
    if (!hotels.some((value) => value.slug === slug)) notFound();
    return <LegacyPage name="HotelDetail" />;
  }
  if (!isIndexableContent(item, 3)) notFound();

  const destinationMedia = destinationAsset(item.slug, `نمایی از مقصد ${item.city}`);
  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={destinationMedia} title={item.title} description={item.summary} badges={["انتخاب محله", "شرایط لغو", "هماهنگی با پرواز"]} overlapBottom />

      <form action="/hotels/search" method="get" className="container-page relative z-10 -mt-24">
        <div className="grid gap-3 rounded-2xl border bg-card p-5 shadow-xl sm:grid-cols-[1.5fr_1fr_1fr_auto]">
          <label className="text-xs font-bold">مقصد<input name="destination" defaultValue={item.slug} readOnly className="mt-2 min-h-12 w-full rounded-xl border bg-muted/40 px-3" /></label>
          <PersianDatePicker label="ورود" name="checkIn" required />
          <PersianDatePicker label="خروج" name="checkOut" required />
          <button type="submit" className="primary-cta self-end"><Search className="size-4" /> جست‌وجوی هتل</button>
        </div>
      </form>

      <div className="container-page pt-7"><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "هتل‌ها", href: "/hotels" }, { label: item.city, href: `/hotels/${item.slug}` }]} /></div>

      <section className="media-section pt-5"><div className="container-page"><SectionHeader title={`پیش از رزرو در ${item.city}`} description="نوع اقامت را با برنامهٔ روزانه، مسیر رفت‌وآمد و ساعت ورود هماهنگ کنید." /><div className="mt-7"><ImageMosaic label={`گالری الهام‌بخش اقامت در ${item.city}`} assets={[destinationMedia, stayMedia.city, stayMedia.boutique]} /></div></div></section>

      <section className="media-section-tinted"><div className="container-page grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border bg-card p-6"><MapPin className="size-6 text-secondary" /><h2 className="mt-3 text-xl font-black">محله‌های قابل بررسی</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{item.neighborhoods.map((value) => <li key={value} className="rounded-xl bg-muted/60 p-4 text-sm font-bold">{value}</li>)}</ul></section><section className="rounded-2xl border bg-card p-6"><Building2 className="size-6 text-secondary" /><h2 className="mt-3 text-xl font-black">نکات انتخاب اقامت</h2><ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{item.tips.map((value) => <li key={value}>• {value}</li>)}</ul></section></div></section>

      <section className="media-section"><div className="container-page"><SectionHeader title="هر سفر، یک انتخاب متفاوت" /><div className="media-grid sm:grid-cols-2 lg:grid-cols-3"><ImageCard href={`/hotels/search?destination=${item.slug}`} asset={stayMedia.resort} title="اقامت تفریحی" description="برای سفرهای آرام و زمان بیشتر در محل اقامت." chips={["تصویر نمایشی", "بررسی امکانات"]} cta="جست‌وجو" /><ImageCard href={`/hotels/search?destination=${item.slug}`} asset={stayMedia.city} title="هتل شهری" description="برای دسترسی ساده‌تر به حمل‌ونقل و برنامه‌های روزانه." chips={["تصویر نمایشی", "بررسی موقعیت"]} cta="جست‌وجو" /><ImageCard href={`/hotels/search?destination=${item.slug}`} asset={stayMedia.traditional} title="اقامت متفاوت" description="برای تجربهٔ معماری و فضای محلی؛ موجودی در جست‌وجو مشخص می‌شود." chips={["تصویر نمایشی", "بدون ادعای موجودی"]} cta="جست‌وجو" /></div></div></section>

      <section className="media-section-tinted"><div className="container-page grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><aside className="rounded-2xl border bg-card p-6"><ShieldCheck className="size-6 text-secondary" /><h2 className="mt-3 text-xl font-black">این صفحه چه چیزی را ادعا نمی‌کند؟</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">قیمت، ظرفیت، امتیاز و موجودی زنده در دادهٔ ساختاریافتهٔ این صفحه منتشر نمی‌شود. اطلاعات تجاری فقط پس از پاسخ معتبر تأمین‌کننده قابل اتکاست.</p><Link href={item.destinationPath} className="secondary-cta mt-5">راهنمای سفر به {item.city}</Link></aside><PromoBanner href={item.destinationPath} asset={destinationMedia} title={`${item.city} فقط محل اقامت نیست`} description="راهنمای زمان سفر، رفت‌وآمد و دیدنی‌ها را پیش از انتخاب محله ببین." cta="راهنمای مقصد" /></div></section>

      <section className="pb-14 sm:pb-20"><div className="container-page"><PromoBanner href="/support" asset={serviceAsset("support", "تصویر پشتیبانی رزرو اقامت")} title="دربارهٔ شرایط اقامت سؤال داری؟" description="شرایط لغو و اطلاعات مهمان را پیش از پرداخت بررسی کن." cta="مرکز راهنما" align="center" /></div></section>
    </main>
  );
}
