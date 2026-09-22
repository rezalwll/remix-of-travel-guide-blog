"use client";
import { useState } from "react";

const faqs = [
  ["اگر پرداخت ناموفق شود چه کار کنم؟", "ابتدا وضعیت سفارش را بررسی کنید. اگر مبلغ کسر شده و سفارش ثبت نشده است، شناسهٔ پرداخت را برای پشتیبانی ارسال کنید."],
  ["چطور سفارش را پیگیری کنم؟", "از صفحهٔ پیگیری سفارش، شناسهٔ سفارش و شماره موبایل خریدار را وارد کنید."],
  ["شرایط استرداد چیست؟", "شرایط دقیق به خدمت و نرخ انتخابی وابسته است و پیش از پرداخت نمایش داده می‌شود."],
];

export default function SupportCenter() {
  const [query, setQuery] = useState("");
  const shown = faqs.filter(([q, a]) => `${q} ${a}`.includes(query));
  return <main className="container-page py-14 sm:py-20"><h1 className="text-3xl font-black sm:text-5xl">سوالات متداول</h1><p className="mt-4 max-w-2xl leading-8 text-muted-foreground">پاسخ سریع دربارهٔ خرید، پرداخت، پیگیری و استرداد. برای اطلاعات سفارش، شناسهٔ پیگیری را آماده داشته باشید.</p><label className="mt-8 block max-w-xl"><span className="sr-only">جست‌وجوی راهنما</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="سوال یا موضوع خود را جست‌وجو کنید" className="min-h-12 w-full rounded-xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring" /></label><section className="mt-8 space-y-3" aria-label="پرسش‌های متداول">{shown.map(([question, answer]) => <article key={question} className="rounded-2xl border bg-card p-5"><h2 className="font-extrabold">{question}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{answer}</p></article>)}</section></main>;
}
