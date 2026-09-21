import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SeoShell from "@/components/seo/SeoShell";
import { seoDestinations } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";

export const metadata = createMetadata({ title: "راهنمای مقصدهای سفر", description: "راهنمای فارسی مقصدهای منتخب با اطلاعات زمان سفر، حمل‌ونقل، مسیرهای پرواز و اقامت.", path: "/destinations" });
export const revalidate = 86_400;

export default function DestinationsPage() {
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مقصدها", href: "/destinations" }]} /><header className="max-w-3xl"><p className="section-eyebrow"><MapPin className="size-4" /> راهنمای مقصد</p><h1 className="page-heading">مقصد را آگاهانه انتخاب کنید</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">هر صفحه فقط برای مقصدی منتشر می‌شود که محتوای کاربردی، پیوندهای مرتبط و تاریخ به‌روزرسانی مشخص داشته باشد؛ ترکیب‌های نازک و خودکار وارد ایندکس نمی‌شوند.</p></header><div className="mt-8 grid gap-5 md:grid-cols-3">{seoDestinations.map((item) => <article key={`${item.countrySlug}/${item.citySlug}`} className="rounded-2xl border bg-card p-6 shadow-sm"><p className="text-xs font-bold text-secondary">{item.country}</p><h2 className="mt-2 text-2xl font-black">{item.city}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.summary}</p><Link href={`/destinations/${item.countrySlug}/${item.citySlug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">راهنمای {item.city} <ArrowLeft className="size-4" /></Link></article>)}</div></SeoShell>;
}
