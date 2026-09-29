import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Plane, Signpost } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TravelHero from "@/components/media/TravelHero";
import { ImageCard, SectionHeader } from "@/components/media/Cards";
import { destinationAsset, serviceAsset } from "@/media/library";
import { getAirportGuide, seoAirportGuides } from "@/seo/content";
import { isIndexableSeoPath } from "@/seo/inventory";
import { createMetadata } from "@/seo/metadata";

export const revalidate = 86_400;
export const dynamicParams = false;

export function generateStaticParams() {
  return seoAirportGuides.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getAirportGuide(slug);
  return item ? createMetadata({ title: item.title, description: item.description, path: `/airports/${slug}`, index: isIndexableSeoPath(`/airports/${slug}`) }) : {};
}

export default async function AirportGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getAirportGuide(slug);
  if (!item) notFound();
  const media = serviceAsset("cip", `مسافر در ${item.airport}`);

  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={media} title={item.title} description={item.summary} badges={[item.code, item.city, "منبع رسمی"]} />
      <div className="container-page pt-7"><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "فرودگاه‌ها", href: "/airports" }, { label: item.airport, href: `/airports/${item.slug}` }]} /></div>

      <section className="media-section pt-5"><div className="container-page"><SectionHeader title="پیش از حرکت به فرودگاه" description="اطلاعات عملیاتی ممکن است تغییر کند؛ بلیط، اعلان ایرلاین و وب‌سایت رسمی مرجع نهایی‌اند." /><div className="mt-7 grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border bg-card p-6"><MapPin className="size-6 text-secondary" /><h2 className="mt-3 text-lg font-black">دسترسی و زمان مسیر</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.access}</p></article><article className="rounded-2xl border bg-card p-6"><Signpost className="size-6 text-secondary" /><h2 className="mt-3 text-lg font-black">ترمینال و گیت</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.terminals}</p></article></div></div></section>

      <section className="media-section-tinted"><div className="container-page grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="rounded-2xl border bg-card p-6"><h2 className="text-xl font-black">چک‌لیست کوتاه</h2><ul className="mt-4 space-y-3">{item.beforeDeparture.map((note) => <li key={note} className="flex gap-2 text-sm leading-7"><CheckCircle2 className="mt-1 size-4 shrink-0 text-secondary" />{note}</li>)}</ul><p className="mt-5 text-xs text-muted-foreground">بازبینی محتوا: {item.reviewedAt}</p>{item.sources.map((source) => <Link key={source.url} href={source.url} rel="nofollow noopener" target="_blank" className="secondary-cta mt-4">{source.label}</Link>)}</section><ImageCard href={item.relatedDestination} asset={destinationAsset(item.relatedDestination.split("/").at(-1) ?? item.city)} title={`راهنمای سفر به ${item.city}`} description="مقصد، محله‌ها و رفت‌وآمد را پیش از انتخاب پرواز بررسی کنید." cta="راهنمای مقصد" /></div></section>

      <section className="media-section"><div className="container-page"><SectionHeader title="مسیرهای مرتبط" /><div className="mt-7 grid gap-4 md:grid-cols-2">{item.relatedFlights.map((flight) => <Link key={flight} href={`/flights/${flight}`} className="flex items-center justify-between rounded-2xl border bg-card p-5 font-bold"><span>راهنمای مسیر پرواز</span><Plane className="size-5 text-secondary" /></Link>)}</div></div></section>
    </main>
  );
}
