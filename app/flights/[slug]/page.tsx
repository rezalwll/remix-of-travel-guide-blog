import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Clock3, Info, Luggage, Plane, RefreshCcw } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, PromoBanner, RouteCard, SectionHeader } from "@/components/media/Cards";
import { getRouteLanding, isIndexableContent, seoRoutes } from "@/seo/content";
import { absoluteUrl, createMetadata, privateMetadata } from "@/seo/metadata";
import { mockFlights } from "@/data/flights";
import { destinationAsset, serviceAsset } from "@/media/library";
import { PersianDatePicker } from "@/components/ui/PersianDatePicker";

export const revalidate = 43_200;
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...seoRoutes.filter((item) => isIndexableContent(item, 5)).map((item) => ({ slug: item.slug })),
    ...mockFlights.map((item) => ({ slug: item.id })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteLanding(slug);
  if (route) {
    const media = destinationAsset(route.destinationPath.split("/").at(-1) ?? "destination");
    return createMetadata({ title: `${route.title} | مقایسه پروازها`, description: route.description, path: `/flights/${slug}`, image: media.kind === "photo" ? media.src : undefined, index: isIndexableContent(route, 5) });
  }
  return mockFlights.some((item) => item.id === slug) ? privateMetadata("گزینهٔ پرواز منقضی‌شده", "این شناسه به نتیجهٔ یک جست‌وجوی قدیمی تعلق دارد.") : {};
}

export default async function FlightRoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = getRouteLanding(slug);
  const legacyFlight = mockFlights.find((item) => item.id === slug);
  if (legacyFlight) permanentRedirect(`/flights/search?from=${legacyFlight.fromCode}&to=${legacyFlight.toCode}&adults=1&trip=oneway`);
  if (!route || !isIndexableContent(route, 5)) notFound();

  const canonical = `/flights/${route.slug}`;
  const destinationSlug = route.destinationPath.split("/").at(-1) ?? route.destinationCode.toLowerCase();
  const destinationMedia = destinationAsset(destinationSlug, `نمایی از مقصد ${route.destination}`);
  const related = route.relatedRoutes.map(getRouteLanding).filter((item) => item !== undefined);

  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={destinationMedia} title={route.title} description={route.summary} badges={[route.duration, `${route.originCode} ← ${route.destinationCode}`]} overlapBottom />

      <form action="/flights/search" method="get" id="route-search" className="container-page relative z-10 -mt-24">
        <div className="grid gap-3 rounded-2xl border bg-card p-5 shadow-xl sm:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="text-xs font-bold">مبدأ<input name="from" defaultValue={route.originCode} readOnly className="mt-2 min-h-12 w-full rounded-xl border bg-muted/40 px-3" /></label>
          <label className="text-xs font-bold">مقصد<input name="to" defaultValue={route.destinationCode} readOnly className="mt-2 min-h-12 w-full rounded-xl border bg-muted/40 px-3" /></label>
          <PersianDatePicker label="تاریخ حرکت" name="departure" required />
          <button type="submit" className="primary-cta self-end">جست‌وجوی پرواز</button>
          <input type="hidden" name="adults" value="1" />
          <input type="hidden" name="trip" value="oneway" />
        </div>
      </form>

      <div className="container-page pt-7"><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "پروازها", href: "/flights" }, { label: `${route.origin} به ${route.destination}`, href: canonical }]} /></div>

      <section className="media-section pt-5"><div className="container-page"><SectionHeader title="اطلاعات کاربردی این مسیر" description="زمان، فرودگاه و قوانین نرخ را در گزینهٔ نهایی دوباره کنترل کنید." /><div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><InfoCard icon={Clock3} title="مدت تقریبی" text={route.duration} /><InfoCard icon={Plane} title="فرودگاه مبدأ" text={route.originAirport} /><InfoCard icon={Plane} title="فرودگاه مقصد" text={route.destinationAirport} /><InfoCard icon={Luggage} title="راهنمای بار" text={route.baggageGuidance} /><InfoCard icon={RefreshCcw} title="تغییر و استرداد" text={route.refundGuidance} /><InfoCard icon={Info} title={`راهنمای کوتاه ${route.destination}`} text={route.destinationGuide} /></div></div></section>

      <section className="media-section-tinted"><div className="container-page grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-2xl border bg-card p-6 sm:p-8"><h2 className="text-xl font-black">پرسش‌های کاربردی این مسیر</h2><div className="mt-4 space-y-3">{route.faq.map((item) => <details key={item.question} className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">{item.question}</summary><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p></details>)}</div></div><ImageCard href={route.destinationPath} asset={destinationMedia} title={`راهنمای سفر به ${route.destination}`} description={route.destinationGuide} cta="شناخت مقصد" ratio="4/3" /></div></section>

      {related.length > 0 && <section className="media-section"><div className="container-page"><SectionHeader title="برای سفر بعدی الهام بگیر" /><div className="media-grid md:grid-cols-2">{related.map((item) => { const relatedDestination = item.destinationPath.split("/").at(-1) ?? item.destinationCode.toLowerCase(); return <RouteCard key={item.slug} href={`/flights/${item.slug}`} originAsset={destinationAsset("tehran", "تصویرسازی مبدأ تهران")} destinationAsset={destinationAsset(relatedDestination, `نمای مقصد ${item.destination}`)} origin={item.origin} destination={item.destination} note={item.summary} />; })}</div></div></section>}

      <section className="pb-14 sm:pb-20"><div className="container-page"><PromoBanner href={route.relatedHotelCity ? `/hotels/${route.relatedHotelCity}` : "/hotels"} asset={serviceAsset("hotels", "تصویر اقامت برای ادامهٔ سفر")} title={`اقامت در ${route.destination} را هم بررسی کن`} description="محله، فاصله و شرایط لغو را کنار ساعت ورود پرواز بسنج." cta="راهنمای هتل‌ها" /></div></section>

      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: route.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })), url: absoluteUrl(canonical) }} />
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Plane; title: string; text: string }) {
  return <article className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-xs)]"><Icon className="size-5 text-secondary" /><h2 className="mt-3 font-black">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></article>;
}
