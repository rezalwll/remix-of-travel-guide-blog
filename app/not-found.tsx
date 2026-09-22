import Link from "next/link";
import { Compass } from "lucide-react";
import MediaFrame from "@/components/media/MediaFrame";
import { serviceAsset } from "@/media/library";

export default function NotFound() {
  return <main id="main-content" className="container-page grid min-h-[68vh] place-items-center py-12"><section className="grid w-full max-w-5xl overflow-hidden rounded-[1.5rem] border bg-card shadow-[var(--shadow-card)] lg:grid-cols-2"><MediaFrame asset={serviceAsset("routes", "تصویرسازی مسیری که به مقصد نرسیده است")} ratio="4/3" sizes="(max-width: 1024px) 100vw, 50vw" className="min-h-64 lg:order-2 lg:size-full" /><div className="flex flex-col items-start justify-center p-7 sm:p-10"><Compass className="size-12 text-secondary" /><p className="mt-5 text-sm font-bold text-primary">خطای ۴۰۴</p><h1 className="mt-2 text-3xl font-black">این مسیر پیدا نشد</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">ممکن است نشانی تغییر کرده باشد یا صفحه در دسترس نباشد. از خانه یا راهنمای مقصدها مسیر تازه‌ای انتخاب کنید.</p><div className="mt-6 flex flex-wrap gap-2"><Link href="/" className="primary-cta">صفحه اصلی</Link><Link href="/destinations" className="secondary-cta">مقصدها</Link><Link href="/support" className="secondary-cta">مرکز راهنما</Link></div></div></section></main>;
}
