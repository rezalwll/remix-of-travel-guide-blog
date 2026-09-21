"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="container-page grid min-h-[65vh] place-items-center py-16 text-center"><section role="alert" className="max-w-lg rounded-2xl border bg-card p-8"><h1 className="text-2xl font-black">نمایش صفحه با مشکل روبه‌رو شد</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">اطلاعات حساس یا جزئیات فنی نمایش داده نمی‌شود. دوباره تلاش کنید یا به خانه برگردید.</p><div className="mt-6 flex justify-center gap-2"><button type="button" onClick={reset} className="primary-cta">تلاش دوباره</button><a href="/" className="secondary-cta">خانه</a></div></section></main>;
}
