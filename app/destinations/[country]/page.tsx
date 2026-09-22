import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SeoShell from "@/components/seo/SeoShell";
import { continents } from "@/data/destinations";
import { seoDestinations } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";

const editorialCountries = [...new Set(seoDestinations.map((item) => item.countrySlug))];
export const dynamicParams = false;
export function generateStaticParams() { return [...continents.map((item) => ({ country: item.slug })), ...editorialCountries.map((country) => ({ country }))]; }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const continent = continents.find((item) => item.slug === country);
  if (continent) return createMetadata({ title: `مقصدهای ${continent.name}`, description: continent.introduction, path: `/destinations/${country}`, image: continent.heroImage });
  const cities = seoDestinations.filter((item) => item.countrySlug === country);
  return cities.length ? createMetadata({ title: `راهنمای سفر به ${cities[0]!.country}`, description: `راهنمای شهرها، مسیرهای پرواز و اقامت در ${cities[0]!.country} برای برنامه‌ریزی آگاهانه سفر.`, path: `/destinations/${country}`, image: cities[0]!.heroImage }) : {};
}

export default async function DestinationArchive({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const continent = continents.find((item) => item.slug === country);
  const cities = seoDestinations.filter((item) => item.countrySlug === country);
  if (!continent && !cities.length) notFound();
  const title = continent ? `مقصدهای ${continent.name}` : `راهنمای سفر به ${cities[0]!.country}`;
  const intro = continent?.introduction || `شهرهای منتخب ${cities[0]!.country} با راهنمای زمان سفر، رفت‌وآمد، پرواز و اقامت.`;
  const cards = continent ? continent.countries.map((item) => ({ href: `/destinations/${continent.slug}/${item.slug}`, title: item.name, text: item.about, image: item.heroImage })) : cities.map((item) => ({ href: `/destinations/${item.countrySlug}/${item.citySlug}`, title: item.city, text: item.summary, image: item.heroImage }));
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مقصدها", href: "/destinations" }, { label: title, href: `/destinations/${country}` }]} /><header className="max-w-3xl"><h1 className="text-3xl font-black sm:text-5xl">{title}</h1><p className="mt-4 leading-8 text-muted-foreground">{intro}</p></header><section className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{cards.map((item) => <Link key={item.href} href={item.href} className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="relative aspect-[16/9]"><Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><div className="p-5"><h2 className="text-xl font-extrabold">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.text}</p></div></Link>)}</section></SeoShell>;
}
