import Link from "next/link";
import type { Metadata } from "next";
import { Plane } from "lucide-react";
import TravelHero from "@/components/media/TravelHero";
import { SectionHeader } from "@/components/media/Cards";
import { serviceAsset } from "@/media/library";
import { seoAirportGuides } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "راهنمای فرودگاه‌ها",
  description: "راهنمای فارسی فرودگاه‌های منتخب، دسترسی، ترمینال و چک‌لیست پیش از حرکت با ارجاع به منابع رسمی.",
  path: "/airports",
});

export default function AirportsPage() {
  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={serviceAsset("cip", "راهنمای فرودگاه‌ها")} title="راهنمای فرودگاه‌ها" description="اطلاعات پایه برای برنامه‌ریزی ورود و خروج؛ وضعیت پرواز، ترمینال و گیت را نزدیک حرکت از منبع رسمی بررسی کنید." />
      <section className="media-section"><div className="container-page"><SectionHeader title="فرودگاه‌های منتخب" description="فقط فرودگاه‌هایی منتشر می‌شوند که منبع رسمی و تاریخ بازبینی مشخص دارند." /><div className="mt-7 grid gap-4 md:grid-cols-2">{seoAirportGuides.map((airport) => <Link key={airport.slug} href={`/airports/${airport.slug}`} className="flex items-center justify-between rounded-2xl border bg-card p-6"><span><span className="block font-black">{airport.airport}</span><span className="mt-2 block text-sm text-muted-foreground">{airport.city} · {airport.code}</span></span><Plane className="size-6 text-secondary" /></Link>)}</div></div></section>
    </main>
  );
}
