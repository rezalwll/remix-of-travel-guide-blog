"use client";

import MediaFrame from "@/components/media/MediaFrame";
import { serviceAsset } from "@/media/library";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="container-page grid min-h-[68vh] place-items-center py-12"><section role="alert" className="grid w-full max-w-4xl overflow-hidden rounded-[1.5rem] border bg-card shadow-[var(--shadow-card)] md:grid-cols-[.8fr_1.2fr]"><MediaFrame asset={serviceAsset("support", "تصویرسازی پشتیبانی هنگام بروز خطا")} ratio="4/3" sizes="(max-width: 768px) 100vw, 40vw" className="min-h-56 md:size-full" /><div className="flex flex-col items-start justify-center p-7 sm:p-9"><p className="text-sm font-bold text-primary">خطای موقت</p><h1 className="mt-2 text-2xl font-black">نمایش صفحه با مشکل روبه‌رو شد</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">اطلاعات حساس یا جزئیات فنی نمایش داده نمی‌شود. دوباره تلاش کنید یا به خانه برگردید.</p><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={reset} className="primary-cta">تلاش دوباره</button><a href="/" className="secondary-cta">خانه</a></div></div></section></main>;
}
