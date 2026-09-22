import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Clock3, Info, Luggage, Plane, RefreshCcw } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import SeoShell from "@/components/seo/SeoShell";
import { getRouteLanding, isIndexableContent, seoRoutes } from "@/seo/content";
import { absoluteUrl, createMetadata } from "@/seo/metadata";
import { privateMetadata } from "@/seo/metadata";
import { mockFlights } from "@/data/flights";

export const revalidate = 43_200;
export const dynamicParams = false;
export function generateStaticParams() { return [...seoRoutes.filter((item) => isIndexableContent(item, 5)).map((item) => ({ slug: item.slug })), ...mockFlights.map((item) => ({ slug: item.id }))]; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteLanding(slug);
  if (route) return createMetadata({ title: `${route.title} | مقایسه پروازها`, description: route.description, path: `/flights/${slug}`, index: isIndexableContent(route, 5) });
  return mockFlights.some((item) => item.id === slug) ? privateMetadata("گزینهٔ پرواز منقضی‌شده", "این شناسه به نتیجهٔ یک جست‌وجوی قدیمی تعلق دارد.") : {};
}

export default async function FlightRoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = getRouteLanding(slug);
  const legacyFlight = mockFlights.find((item) => item.id === slug);
  if (legacyFlight) permanentRedirect(`/flights/search?from=${legacyFlight.fromCode}&to=${legacyFlight.toCode}&adults=1&trip=oneway`);
  if (!route || !isIndexableContent(route, 5)) notFound();
  const canonical = `/flights/${route.slug}`;
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "پروازها", href: "/flights" }, { label: `${route.origin} به ${route.destination}`, href: canonical }]} /><header className="rounded-3xl bg-[hsl(220_22%_17%)] p-7 text-white sm:p-10"><p className="text-xs font-bold text-accent">راهنمای مسیر · بدون ادعای قیمت زنده</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{route.title}</h1><p className="mt-5 max-w-3xl text-sm leading-8 text-white/75">{route.summary}</p></header><form action="/flights/search" method="get" id="route-search" className="relative -mt-5 mx-3 grid gap-3 rounded-2xl border bg-card p-5 shadow-xl sm:mx-8 sm:grid-cols-[1fr_1fr_1fr_auto]"><label className="text-xs font-bold">مبدأ<input name="from" defaultValue={route.originCode} readOnly className="mt-2 min-h-12 w-full rounded-xl border bg-muted/40 px-3" /></label><label className="text-xs font-bold">مقصد<input name="to" defaultValue={route.destinationCode} readOnly className="mt-2 min-h-12 w-full rounded-xl border bg-muted/40 px-3" /></label><label className="text-xs font-bold">تاریخ حرکت<input type="date" name="departure" required className="mt-2 min-h-12 w-full rounded-xl border px-3" /></label><button type="submit" className="primary-cta self-end">جست‌وجوی پرواز</button><input type="hidden" name="adults" value="1" /><input type="hidden" name="trip" value="oneway" /></form><div className="mt-9 grid gap-4 md:grid-cols-2"><InfoCard icon={Clock3} title="مدت تقریبی" text={route.duration} /><InfoCard icon={Plane} title="فرودگاه مبدأ" text={route.originAirport} /><InfoCard icon={Plane} title="فرودگاه مقصد" text={route.destinationAirport} /><InfoCard icon={Luggage} title="راهنمای بار" text={route.baggageGuidance} /><InfoCard icon={RefreshCcw} title="تغییر و استرداد" text={route.refundGuidance} /><InfoCard icon={Info} title={`راهنمای کوتاه ${route.destination}`} text={route.destinationGuide} /></div><section className="mt-9 rounded-2xl border bg-card p-6"><h2 className="text-xl font-black">پرسش‌های کاربردی این مسیر</h2><div className="mt-4 space-y-3">{route.faq.map((item) => <details key={item.question} className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">{item.question}</summary><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p></details>)}</div></section><section className="mt-9"><h2 className="text-xl font-black">پیوندهای مرتبط</h2><div className="mt-4 flex flex-wrap gap-2"><Link href={route.destinationPath} className="secondary-cta">راهنمای {route.destination}</Link>{route.relatedHotelCity && <Link href={`/hotels/${route.relatedHotelCity}`} className="secondary-cta">هتل‌های {route.destination}</Link>}{route.relatedRoutes.map((value) => <Link key={value} href={`/flights/${value}`} className="secondary-cta">مسیر پرواز مرتبط</Link>)}</div></section><JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: route.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })), url: absoluteUrl(canonical) }} /></SeoShell>;
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Plane; title: string; text: string }) { return <section className="rounded-2xl border bg-card p-6"><Icon className="size-5 text-secondary" /><h2 className="mt-3 font-black">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></section>; }
