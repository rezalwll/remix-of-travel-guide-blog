import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Plane, TramFront } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SeoShell from "@/components/seo/SeoShell";
import { getDestination, isIndexableContent, seoDestinations } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";
import { continents } from "@/data/destinations";

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

export default async function DestinationPage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country, city } = await params;
  const item = getDestination(country, city);
  if (!item) {
    const continent = continents.find((value) => value.slug === country);
    const legacy = continent?.countries.find((value) => value.slug === city);
    if (!continent || !legacy) notFound();
    return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مقصدها", href: "/destinations" }, { label: continent.name, href: `/destinations/${continent.slug}` }, { label: legacy.name, href: `/destinations/${continent.slug}/${legacy.slug}` }]} /><header className="grid overflow-hidden rounded-3xl bg-[hsl(220_22%_17%)] text-white lg:grid-cols-2"><div className="p-7 sm:p-10"><p className="text-xs font-bold text-accent">آرشیو راهنمای مقصد</p><h1 className="mt-3 text-4xl font-black">راهنمای سفر به {legacy.name}</h1><p className="mt-5 text-sm leading-8 text-white/75">{legacy.about}</p></div><div className="relative min-h-64"><Image src={legacy.heroImage} alt={`نمایی از ${legacy.name}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div></header><section className="mt-8 rounded-2xl border bg-card p-6"><h2 className="text-xl font-black">زمان مناسب و ناحیه‌ها</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">ماه‌های پیشنهادی آرشیو: {legacy.bestMonths.join("، ")}. برنامه را با وضعیت روز آب‌وهوا و مقررات مقصد تطبیق دهید.</p><div className="mt-4 flex flex-wrap gap-2">{legacy.regions?.map((value) => <span key={value} className="soft-chip">{value}</span>)}</div></section><section className="mt-8"><h2 className="text-xl font-black">مقاله‌های مرتبط</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{legacy.articles.map((article) => <Link key={article.id} href={`/blog/${article.id}`} className="rounded-xl border bg-card p-4 font-bold hover:text-primary">{article.title}</Link>)}</div></section></SeoShell>;
  }
  if (!isIndexableContent(item, 4)) notFound();
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مقصدها", href: "/destinations" }, { label: item.country, href: `/destinations/${item.countrySlug}` }, { label: item.city, href: `/destinations/${item.countrySlug}/${item.citySlug}` }]} /><header className="grid overflow-hidden rounded-3xl bg-[hsl(220_22%_17%)] text-white lg:grid-cols-2"><div className="p-7 sm:p-10"><p className="text-xs font-bold text-accent">به‌روزرسانی واقعی: {new Date(item.updatedAt).toLocaleDateString("fa-IR")}</p><h1 className="mt-3 text-4xl font-black">{item.title}</h1><p className="mt-5 text-sm leading-8 text-white/75">{item.summary}</p></div><div className="relative min-h-64"><Image src={item.heroImage} alt={`نمایی از ${item.city}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div></header><div className="mt-8 grid gap-5 lg:grid-cols-2"><InfoCard icon={CalendarDays} title="بهترین زمان سفر" text={item.bestTime} /><InfoCard icon={TramFront} title="رفت‌وآمد" text={item.transportNotes} /></div><section className="mt-8 rounded-2xl border bg-card p-6"><h2 className="text-xl font-black">چه چیزهایی را در برنامه بگذاریم؟</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{item.highlights.map((value) => <li key={value} className="flex gap-2 rounded-xl bg-muted/60 p-4 text-sm"><MapPin className="size-4 shrink-0 text-primary" />{value}</li>)}</ul></section><section className="mt-8"><h2 className="text-xl font-black">ادامه برنامه‌ریزی</h2><div className="mt-4 flex flex-wrap gap-3">{item.relatedRoutes.map((slug) => <Link key={slug} href={`/flights/${slug}`} className="secondary-cta"><Plane className="size-4" /> راهنمای مسیر پرواز</Link>)}{item.relatedHotels.map((slug) => <Link key={slug} href={`/hotels/${slug}`} className="secondary-cta">هتل‌های {item.city}</Link>)}{item.relatedArticles.map((slug) => <Link key={slug} href={`/blog/${slug}`} className="secondary-cta">مقاله مرتبط</Link>)}</div></section></SeoShell>;
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof CalendarDays; title: string; text: string }) { return <section className="rounded-2xl border bg-card p-6"><Icon className="size-6 text-secondary" /><h2 className="mt-3 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></section>; }
