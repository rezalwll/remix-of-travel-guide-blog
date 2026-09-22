"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Headphones, RotateCcw, Search, TicketCheck } from "lucide-react";
import TravelHero from "@/components/media/TravelHero";
import { PromoBanner, SectionHeader } from "@/components/media/Cards";
import { serviceAsset } from "@/media/library";

const faqs = [
  ["اگر پرداخت ناموفق شود چه کار کنم؟", "ابتدا وضعیت سفارش را بررسی کنید. اگر مبلغ کسر شده و سفارش ثبت نشده است، شناسهٔ پرداخت را برای پشتیبانی ارسال کنید."],
  ["چطور سفارش را پیگیری کنم؟", "از صفحهٔ پیگیری سفارش، شناسهٔ سفارش و شماره موبایل خریدار را وارد کنید."],
  ["شرایط استرداد چیست؟", "شرایط دقیق به خدمت و نرخ انتخابی وابسته است و پیش از پرداخت نمایش داده می‌شود."],
  ["قیمت و ظرفیت چه زمانی قطعی است؟", "فقط اطلاعاتی که در پاسخ معتبر تأمین‌کننده و مرحلهٔ مرور سفارش نمایش داده می‌شود قابل اتکاست."],
  ["برای تغییر اطلاعات مسافر چه کنم؟", "پیش از پرداخت از مرحلهٔ مرور سفارش به اطلاعات مسافران برگردید. پس از صدور، امکان تغییر به قوانین خدمت وابسته است."],
];

const categories = [
  { href: "/help/purchase-guide", icon: TicketCheck, title: "راهنمای خرید", text: "از جست‌وجو تا ثبت سفارش" },
  { href: "/track-order", icon: Search, title: "پیگیری سفارش", text: "مشاهدهٔ آخرین وضعیت" },
  { href: "/help/refund-guide", icon: RotateCcw, title: "تغییر و استرداد", text: "قوانین و روند پیگیری" },
  { href: "/contact", icon: Headphones, title: "ارتباط با پشتیبانی", text: "مسیرهای تماس و اطلاعات لازم" },
];

export default function SupportCenter() {
  const [query, setQuery] = useState("");
  const shown = faqs.filter(([question, answer]) => `${question} ${answer}`.includes(query));
  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={serviceAsset("support", "تصویر همراهی و پشتیبانی سفر")} size="compact" eyebrow="مرکز راهنمای کی‌آشی" title="برای ادامهٔ سفر تنها نیستی" description="پاسخ سریع دربارهٔ خرید، پرداخت، پیگیری و استرداد. برای اطلاعات سفارش، شناسهٔ پیگیری را آماده داشته باشید." />

      <section className="media-section"><div className="container-page"><SectionHeader eyebrow="مسیر سریع" title="برای چه چیزی کمک می‌خواهی؟" /><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[var(--shadow-card)]"><span className="grid size-11 place-items-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-5" /></span><h2 className="mt-4 font-black group-hover:text-primary">{title}</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">{text}</p></Link>)}</div></div></section>

      <section id="faq" className="media-section-tinted scroll-mt-24"><div className="container-page grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><SectionHeader eyebrow="پاسخ سریع" title="سوالات متداول" description="موضوع یا عبارت موردنظر را بنویس. اطلاعات حساس سفارش را در این کادر وارد نکن." /><label className="relative mt-6 block"><span className="sr-only">جست‌وجوی راهنما</span><Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثلاً استرداد یا پرداخت" className="min-h-12 w-full rounded-xl border bg-background pe-4 ps-12 outline-none focus:ring-2 focus:ring-ring" /></label></div><section className="space-y-3" aria-label="پرسش‌های متداول">{shown.length ? shown.map(([question, answer]) => <details key={question} className="rounded-2xl border bg-card p-5"><summary className="cursor-pointer font-extrabold">{question}</summary><p className="mt-3 text-sm leading-7 text-muted-foreground">{answer}</p></details>) : <div role="status" className="rounded-2xl border bg-card p-8 text-center"><p className="font-bold">پاسخی با این عبارت پیدا نشد.</p><p className="mt-2 text-sm text-muted-foreground">عبارت کوتاه‌تری امتحان کنید یا با پشتیبانی تماس بگیرید.</p></div>}</section></div></section>

      <section className="media-section"><div className="container-page"><PromoBanner href="/track-order" asset={serviceAsset("routes", "تصویر مسیر پیگیری سفارش")} eyebrow="سفارش ثبت‌شده" title="آخرین وضعیت را بدون تماس بررسی کن" description="شناسهٔ سفارش و شمارهٔ موبایل خریدار را برای پیگیری آماده داشته باش." cta="پیگیری سفارش" /></div></section>

      <section className="pb-14 sm:pb-20"><div className="container-page rounded-2xl border bg-card p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CreditCard className="size-5" /></span><div><h2 className="font-black">اطلاعات پرداخت را ایمن نگه دارید</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">رمز، CVV2 و کد تأیید بانکی را در پیام پشتیبانی ارسال نکنید.</p></div></div><Link href="/privacy" className="secondary-cta mt-5 sm:mt-0">حریم خصوصی</Link></div></section>
    </main>
  );
}
