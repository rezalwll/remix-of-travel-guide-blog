import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Plane, TramFront } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, ImageMosaic, PromoBanner, SectionHeader } from "@/components/media/Cards";
import { getDestination, isIndexableContent, seoDestinations } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";
import { continents } from "@/data/destinations";
import { destinationAsset, experienceAsset, legacyAsset, serviceAsset, type MediaAsset } from "@/media/library";

export const revalidate = 86_400;
export const dynamicParams = false;
export function generateStaticParams() { return [...seoDestinations.filter((item) => isIndexableContent(item, 4)).map((item) => ({ country: item.countrySlug, city: item.citySlug })), ...continents.flatMap((continent) => continent.countries.map((country) => ({ country: continent.slug, city: country.slug })))]; }

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string }> }): Promise<Metadata> {
  const { country, city } = await params;
  const item = getDestination(country, city);
  if (!item) {
    const continent = continents.find((value) => value.slug === country);
    const legacy = continent?.countries.find((value) => value.slug === city);
    return legacy ? createMetadata({ title: `راهنمای سفر به ${legacy.name}`, description: legacy.about, path: `/destinations/${country}/${city}`, image: legacy.heroImage, index: true }) : {};
  }
  return createMetadata({ title: item.title, description: item.description, path: `/destinations/${country}/${city}`, image: item.heroImage, index: isIndexableContent(item, 4) });
}

type DestinationView = {
  city: string;
  countryLabel: string;
  countryHref: string;
  title: string;
  summary: string;
  media: MediaAsset;
  bestTime: string;
  transport: string;
  highlights: string[];
  routes: string[];
  hotels: string[];
  articles: { slug: string; title: string; description: string; media: MediaAsset }[];
  updatedAt?: string;
};

export default async function DestinationPage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country, city } = await params;
  const item = getDestination(country, city);
  let view: DestinationView;

  if (item) {
    if (!isIndexableContent(item, 4)) notFound();
    view = {
      city: item.city,
      countryLabel: item.country,
      countryHref: `/destinations/${item.countrySlug}`,
      title: item.title,
      summary: item.summary,
      media: destinationAsset(item.citySlug, `نمایی از ${item.city}`),
      bestTime: item.bestTime,
      transport: item.transportNotes,
      highlights: item.highlights,
      routes: item.relatedRoutes,
      hotels: item.relatedHotels,
      articles: item.relatedArticles.map((slug) => ({ slug, title: "راهنمای مرتبط مقصد", description: `پیشنهادهای کاربردی برای برنامه‌ریزی سفر به ${item.city}.`, media: destinationAsset(item.citySlug, `تصویر راهنمای ${item.city}`) })),
      updatedAt: item.updatedAt,
    };
  } else {
    const continent = continents.find((value) => value.slug === country);
    const legacy = continent?.countries.find((value) => value.slug === city);
    if (!continent || !legacy) notFound();
    view = {
      city: legacy.name,
      countryLabel: continent.name,
      countryHref: `/destinations/${continent.slug}`,
      title: `راهنمای سفر به ${legacy.name}`,
      summary: legacy.about,
      media: legacyAsset(legacy.heroImage, `نمایی از ${legacy.name}`, legacy.slug),
      bestTime: `ماه‌های پیشنهادی آرشیو: ${legacy.bestMonths.join("، ")}. برنامه را با وضعیت روز آب‌وهوا و مقررات مقصد تطبیق دهید.`,
      transport: "زمان جابه‌جایی، مسیر فرودگاه یا ایستگاه و دسترسی محلهٔ اقامت را پیش از رزرو بررسی کنید.",
      highlights: legacy.regions ?? [],
      routes: [],
      hotels: [],
      articles: legacy.articles.map((article) => ({ slug: article.id, title: article.title, description: article.excerpt, media: legacyAsset(article.image, article.title, article.id) })),
    };
  }

  const canonical = `/destinations/${country}/${city}`;
  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={view.media} eyebrow={view.updatedAt ? `به‌روزرسانی ${new Date(view.updatedAt).toLocaleDateString("fa-IR")}` : "آرشیو راهنمای مقصد"} title={view.title} description={view.summary} badges={["زمان سفر", "رفت‌وآمد", "دیدنی‌ها"]} primary={{ href: "#plan", label: "برنامه‌ریزی سفر" }} secondary={{ href: "/flights", label: "جست‌وجوی پرواز" }} />

      <div className="container-page pt-7"><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مقصدها", href: "/destinations" }, { label: view.countryLabel, href: view.countryHref }, { label: view.city, href: canonical }]} /></div>

      <section className="media-section pt-5"><div className="container-page"><SectionHeader eyebrow="حال‌وهوای مقصد" title={`${view.city} را قبل از حرکت ببین`} description="تصاویر و تصویرسازی‌های این بخش برای شناخت فضای سفرند؛ شرایط روز مقصد را جداگانه بررسی کنید." /><div className="mt-7"><ImageMosaic label={`گالری سفر ${view.city}`} assets={[view.media, experienceAsset("city", `تصویرسازی گشت شهری در ${view.city}`), experienceAsset("food", `تصویرسازی تجربهٔ محلی در ${view.city}`)]} /></div></div></section>

      <section id="plan" className="media-section-tinted scroll-mt-24"><div className="container-page"><SectionHeader eyebrow="برنامه‌ریزی" title="چیزهایی که تصمیم را ساده‌تر می‌کنند" /><div className="mt-7 grid gap-5 lg:grid-cols-2"><InfoCard icon={CalendarDays} title="بهترین زمان سفر" text={view.bestTime} /><InfoCard icon={TramFront} title="رفت‌وآمد" text={view.transport} /></div><section className="mt-5 rounded-2xl border bg-card p-6"><h2 className="text-xl font-black">چه چیزهایی را در برنامه بگذاریم؟</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{view.highlights.map((value) => <li key={value} className="flex gap-2 rounded-xl bg-muted/60 p-4 text-sm"><MapPin className="size-4 shrink-0 text-primary" />{value}</li>)}</ul></section></div></section>

      <section className="media-section"><div className="container-page"><SectionHeader eyebrow="ادامهٔ برنامه" title="از الهام تا رزرو" /><div className="mt-7 grid gap-5 lg:grid-cols-3"><ImageCard href={view.routes[0] ? `/flights/${view.routes[0]}` : "/flights"} asset={serviceAsset("flights", `تصویرسازی پرواز به ${view.city}`)} title={`پرواز به ${view.city}`} description="ساعت، فرودگاه و قوانین بار را در نتیجهٔ واقعی مقایسه کنید." cta="راهنمای پرواز" /><ImageCard href={view.hotels[0] ? `/hotels/${view.hotels[0]}` : "/hotels"} asset={serviceAsset("hotels", `تصویر اقامت در ${view.city}`)} title={`اقامت در ${view.city}`} description="محله، دسترسی و شرایط لغو را کنار هم بسنجید." cta="راهنمای هتل" /><ImageCard href="/city-tours" asset={experienceAsset("heritage", `تصویرسازی تجربه‌های ${view.city}`)} title={`تجربه‌های ${view.city}`} description="برای فرهنگ، خوراک و دیدنی‌های شهر زمان مستقل در نظر بگیرید." cta="گشت و تجربه" /></div></div></section>

      {view.articles.length > 0 && <section className="media-section-tinted"><div className="container-page"><SectionHeader eyebrow="مجلهٔ سفر" title={`بیشتر دربارهٔ ${view.city} بخوان`} action={{ href: "/blog", label: "همهٔ مقاله‌ها" }} /><div className="media-grid sm:grid-cols-2 lg:grid-cols-3">{view.articles.map((article) => <ImageCard key={article.slug} href={`/blog/${article.slug}`} asset={article.media} title={article.title} description={article.description} cta="خواندن مقاله" />)}</div></div></section>}

      <section className="pb-14 pt-10 sm:pb-20"><div className="container-page"><PromoBanner href="/support" asset={serviceAsset("support", "تصویر پشتیبانی برنامه‌ریزی سفر")} eyebrow="همراه برنامه‌ریزی" title="برای مرحلهٔ بعد سؤال داری؟" description="راهنمای خرید، پرداخت و پیگیری سفارش در مرکز راهنما جمع شده است." cta="مرکز راهنما" align="center" /></div></section>
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof CalendarDays; title: string; text: string }) {
  return <article className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-xs)]"><Icon className="size-6 text-secondary" /><h2 className="mt-3 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></article>;
}
