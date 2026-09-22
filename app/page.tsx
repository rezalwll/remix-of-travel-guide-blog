import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Compass, Headphones, ShieldCheck } from "lucide-react";
import BookingSearch from "@/components/home/BookingSearch";
import { createMetadata } from "@/seo/metadata";
import { seoArticles, seoDestinations, seoHotelLandings, seoRoutes } from "@/seo/content";
import heroImage from "@/assets/hero-kish-premium.webp";

export const metadata = createMetadata({
  title: "پرواز، هتل و راهنمای سفر",
  description: "جست‌وجوی پرواز و هتل، راهنمای مقصدهای منتخب و مدیریت شفاف سفر در کی‌آشی.",
  path: "/",
  image: "/hero-camping.jpg",
});

export const revalidate = 86_400;

const trust = [
  [ShieldCheck, "پرداخت و جلسه امن", "کوکی HttpOnly و کنترل سمت سرور"],
  [BadgeCheck, "اطلاعات روشن", "تفکیک محتوای راهنما از موجودی واقعی"],
  [Headphones, "پشتیبانی سفر", "پیگیری سفارش و مسیرهای راهنما"],
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate min-h-[620px] overflow-hidden pb-36 pt-16 text-white sm:min-h-[680px] sm:pt-24">
        <Image src={heroImage} alt="نمای ساحلی کیش برای برنامه‌ریزی سفر" fill priority sizes="100vw" className="-z-20 object-cover object-[38%_center]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(213_33%_10%/0.25),hsl(213_33%_10%/0.55)_45%,hsl(213_33%_9%/0.92)_100%)]" />
        <div className="container-page flex min-h-[430px] items-center">
          <div className="max-w-[720px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-4 py-2 text-xs font-bold backdrop-blur"><Compass className="size-4 text-accent" /> سفر آگاهانه، از جست‌وجو تا پیگیری</span>
            <h1 className="mt-6 text-[2.6rem] font-black leading-[1.3] sm:text-6xl lg:text-[4.6rem]">سفر را انتخاب کن،<br /><span className="text-accent">نگرانی‌اش با ما</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-8 text-white/80 sm:text-lg">پرواز، اقامت و تجربه‌های مقصد را مقایسه کن؛ راهنمای واقعی بخوان و همه جزئیات سفر را در یک حساب مدیریت کن.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="#booking" className="primary-cta bg-white text-foreground hover:bg-white/90">شروع جست‌وجو</Link><Link href="/destinations" className="secondary-cta border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white">کشف مقصدها <ArrowLeft className="size-4" /></Link></div>
          </div>
        </div>
      </section>

      <BookingSearch />

      <section className="container-page py-8"><h2 className="sr-only">مزیت‌های کی‌آشی</h2><div className="grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-3">{trust.map(([Icon, title, text]) => <div key={title} className="flex gap-3 border-b p-5 last:border-0 sm:border-b-0 sm:border-l"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-5" /></span><div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{text}</p></div></div>)}</div></section>

      <HomeCollection title="مسیرهای پرطرفدار" description="صفحه‌های راهنمای مسیر با اطلاعات کاربردی؛ بدون قیمت یا ظرفیت ساختگی." items={seoRoutes.map((item) => ({ href: `/flights/${item.slug}`, title: `${item.origin} ← ${item.destination}`, text: item.summary }))} />
      <HomeCollection title="مقصدها" description="راهنمای فارسی و پیوندهای کاربردی برای برنامه‌ریزی سفر." items={seoDestinations.map((item) => ({ href: `/destinations/${item.countrySlug}/${item.citySlug}`, title: item.city, text: item.summary }))} tone />
      <HomeCollection title="راهنمای انتخاب هتل" description="محله‌ها و نکات انتخاب اقامت، جدا از نتایج موجودی زنده." items={seoHotelLandings.map((item) => ({ href: `/hotels/${item.slug}`, title: item.title, text: item.summary }))} />
      <HomeCollection title="مجله سفر" description="راهنماهای کوتاه و به‌روزشده برای تصمیم بهتر." items={seoArticles.map((item) => ({ href: `/blog/${item.slug}`, title: item.title, text: item.description }))} tone />
    </main>
  );
}

function HomeCollection({ title, description, items, tone = false }: { title: string; description: string; items: { href: string; title: string; text: string }[]; tone?: boolean }) {
  return <section className={tone ? "bg-muted/50 py-14 sm:py-20" : "py-14 sm:py-20"}><div className="container-page"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p></div></div><div className="mt-7 grid gap-4 md:grid-cols-3">{items.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-secondary/40"><h3 className="text-lg font-extrabold group-hover:text-primary">{item.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.text}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-secondary">مشاهده راهنما <ArrowLeft className="size-4" /></span></Link>)}</div></div></section>;
}
