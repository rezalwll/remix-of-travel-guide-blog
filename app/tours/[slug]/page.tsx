import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, MapPinned, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, PromoBanner, SectionHeader } from "@/components/media/Cards";
import LegacyPage from "@/components/next/LegacyPage";
import { tours } from "@/data/experiences";
import { destinationAsset, serviceAsset } from "@/media/library";
import { getTourLanding, seoTourLandings } from "@/seo/content";
import { isIndexableSeoPath } from "@/seo/inventory";
import { createMetadata, privateMetadata } from "@/seo/metadata";

export const revalidate = 86_400;
export const dynamicParams = false;

const legacyTourSlugs = new Set(tours.map((tour) => tour.slug));
const collisions = seoTourLandings.filter((item) => legacyTourSlugs.has(item.slug));
if (collisions.length) throw new Error(`Tour landing/detail slug collision: ${collisions.map((item) => item.slug).join(", ")}`);

export function generateStaticParams() {
  return [
    ...seoTourLandings.map((item) => ({ slug: item.slug })),
    ...tours.map((tour) => ({ slug: tour.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getTourLanding(slug);
  if (item) return createMetadata({ title: item.title, description: item.description, path: `/tours/${slug}`, index: isIndexableSeoPath(`/tours/${slug}`) });
  const legacy = tours.find((tour) => tour.slug === slug);
  return legacy ? privateMetadata(legacy.title, "جزئیات نمایشی تور تا زمان اتصال ظرفیت معتبر از ایندکس خارج است.") : {};
}

export default async function TourDestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getTourLanding(slug);
  if (!item) {
    if (!legacyTourSlugs.has(slug)) notFound();
    return <LegacyPage name="TourDetail" />;
  }
  const media = destinationAsset(item.slug, `نمایی از ${item.destination}`);
  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={media} title={item.title} description={item.summary} badges={["برنامه سفر", "خدمات اعلام‌شده", "قوانین لغو"]} primary={{ href: "/tours", label: "مشاهده تورها" }} />
      <div className="container-page pt-7"><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "تورها", href: "/tours" }, { label: item.destination, href: `/tours/${item.slug}` }]} /></div>

      <section className="media-section pt-5"><div className="container-page"><SectionHeader title={`برای انتخاب تور ${item.destination}`} description="پیشنهاد واقعی را بر اساس جزئیات برنامه و قرارداد مقایسه کنید، نه یک عدد یا عنوان تبلیغاتی." /><div className="mt-7 grid gap-4 md:grid-cols-3">{item.planningNotes.map((note, index) => { const icons = [CalendarCheck, MapPinned, ShieldCheck]; const Icon = icons[index] ?? ShieldCheck; return <article key={note} className="rounded-2xl border bg-card p-6"><Icon className="size-6 text-secondary" /><p className="mt-3 text-sm leading-7 text-muted-foreground">{note}</p></article>; })}</div></div></section>

      <section className="media-section-tinted"><div className="container-page grid gap-5 lg:grid-cols-2"><ImageCard href={item.relatedDestination} asset={media} title={`راهنمای سفر به ${item.destination}`} description="زمان سفر، رفت‌وآمد و انتخاب محله را پیش از رزرو بشناسید." cta="راهنمای مقصد" />{item.relatedFlight && <ImageCard href={`/flights/${item.relatedFlight}`} asset={serviceAsset("flights", `پرواز به ${item.destination}`)} title={`پرواز به ${item.destination}`} description="فرودگاه، بار مجاز و شرایط نرخ را روی نتیجه معتبر بررسی کنید." cta="راهنمای مسیر" />}</div></section>

      <section className="pb-14 pt-10 sm:pb-20"><div className="container-page"><PromoBanner href="/tours" asset={serviceAsset("tours", "برنامه‌ریزی تور")} title="پیشنهادهای تور را مقایسه کن" description="ظرفیت و مبلغ نهایی فقط در نتیجه متصل به تأمین‌کننده معتبر است." cta="مشاهده تورها" align="center" /></div></section>
    </main>
  );
}
