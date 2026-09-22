import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Search } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SeoShell from "@/components/seo/SeoShell";
import { getHotelLanding, isIndexableContent, seoHotelLandings } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";
import { hotels } from "@/data/hotels";
import LegacyPage from "@/components/next/LegacyPage";
import { privateMetadata } from "@/seo/metadata";

export const revalidate = 43_200;
export const dynamicParams = false;
const hotelDetailSlugs = new Set(hotels.map((item) => item.slug));
const landingCollisions = seoHotelLandings.filter((item) => hotelDetailSlugs.has(item.slug));
if (landingCollisions.length) throw new Error(`Hotel landing/detail slug collision: ${landingCollisions.map((item) => item.slug).join(", ")}`);
export function generateStaticParams() { return [...seoHotelLandings.filter((item) => isIndexableContent(item, 3)).map((item) => ({ slug: item.slug })), ...hotels.map((item) => ({ slug: item.slug }))]; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getHotelLanding(slug);
  if (item) return createMetadata({ title: `${item.title} | مقایسه و رزرو هتل`, description: item.description, path: `/hotels/${slug}`, index: isIndexableContent(item, 3) });
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
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "هتل‌ها", href: "/hotels" }, { label: item.city, href: `/hotels/${item.slug}` }]} /><header className="rounded-3xl bg-[hsl(220_22%_17%)] p-7 text-white sm:p-10"><p className="text-xs font-bold text-accent">راهنمای اقامت · موجودی و نرخ فقط در جست‌وجوی واقعی</p><h1 className="mt-3 text-4xl font-black">{item.title}</h1><p className="mt-5 max-w-3xl text-sm leading-8 text-white/75">{item.summary}</p><Link href={`/hotels/search?destination=${item.slug}`} className="primary-cta mt-6 bg-white text-foreground hover:bg-white/90"><Search className="size-4" /> جست‌وجوی هتل در {item.city}</Link></header><div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-2xl border bg-card p-6"><MapPin className="size-6 text-secondary" /><h2 className="mt-3 text-xl font-black">محله‌های قابل بررسی</h2><ul className="mt-4 space-y-2">{item.neighborhoods.map((value) => <li key={value} className="rounded-xl bg-muted/60 p-3 text-sm">{value}</li>)}</ul></section><section className="rounded-2xl border bg-card p-6"><Building2 className="size-6 text-secondary" /><h2 className="mt-3 text-xl font-black">نکات انتخاب اقامت</h2><ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{item.tips.map((value) => <li key={value}>• {value}</li>)}</ul></section></div><section className="mt-8 rounded-2xl border bg-card p-6"><h2 className="text-xl font-black">این صفحه چه چیزی را ادعا نمی‌کند؟</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">قیمت، ظرفیت، امتیاز و موجودی زنده در داده ساختاریافته این صفحه منتشر نمی‌شود. اطلاعات تجاری فقط پس از اتصال و پاسخ معتبر تأمین‌کننده قابل اتکاست.</p><Link href={item.destinationPath} className="secondary-cta mt-5">راهنمای سفر به {item.city}</Link></section></SeoShell>;
}
