"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Gauge, MapPin, SunMedium } from "lucide-react";
import { shortTours } from "@/data/shortTours";
import { formatPersianNumber, formatPrice } from "@/utils/flight";

type DurationFilter = "all" | "one" | "two";

const filters: { id: DurationFilter; label: string }[] = [
  { id: "all", label: "همه برنامه‌ها" },
  { id: "one", label: "تورهای یک‌روزه" },
  { id: "two", label: "تورهای دو‌روزه" },
];

const persianDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Tehran",
});

const formatDeparture = (value: string) => persianDate.format(new Date(`${value}T12:00:00+03:30`));

export default function ShortTourCatalog() {
  const [duration, setDuration] = useState<DurationFilter>("all");
  const results = useMemo(
    () => shortTours.filter((tour) => duration === "all" || tour.durationDays === (duration === "one" ? 1 : 2)),
    [duration],
  );

  return (
    <section id="short-tour-list" className="media-section" aria-labelledby="short-tour-list-heading">
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold text-primary">انتخاب سریع برای آخر هفته</p>
            <h2 id="short-tour-list-heading" className="mt-2 text-2xl font-black leading-tight sm:text-3xl">تورهای کوتاه از تهران</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">مدت، سطح فعالیت، فصل مناسب و خدمات هر برنامه را کنار هم ببین و سپس وارد جزئیات رزرو شو.</p>
          </div>
          <div className="scrollbar-none flex max-w-full gap-2 overflow-x-auto pb-1" role="group" aria-label="فیلتر مدت تور">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setDuration(filter.id)}
                aria-pressed={duration === filter.id}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-extrabold transition-colors ${duration === filter.id ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground hover:border-primary/45 hover:text-primary"}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs font-bold text-muted-foreground" aria-live="polite">
          {formatPersianNumber(results.length)} برنامه نمایشی پیدا شد
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((tour, index) => (
            <article key={tour.slug} className="premium-media-card flex h-full flex-col overflow-hidden rounded-[1.35rem] border bg-card shadow-[var(--shadow-xs)]">
              <Link href={`/tours/${tour.slug}`} className="relative block aspect-[3/2] overflow-hidden bg-muted">
                <Image
                  src={tour.images[0]}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  priority={index < 3}
                  className="object-cover"
                />
                <span className="absolute start-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-primary shadow-sm backdrop-blur">
                  {formatPersianNumber(tour.durationDays)} روزه
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-primary" />تهران به {tour.destinations.join(" و ")}</span>
                </div>
                <h3 className="mt-3 text-lg font-black leading-8">{tour.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{tour.description}</p>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-muted/65 p-3">
                    <dt className="flex items-center gap-1 text-muted-foreground"><SunMedium className="size-3.5" />فصل مناسب</dt>
                    <dd className="mt-1.5 font-extrabold text-foreground">{tour.tags[1]}</dd>
                  </div>
                  <div className="rounded-xl bg-muted/65 p-3">
                    <dt className="flex items-center gap-1 text-muted-foreground"><Gauge className="size-3.5" />سطح فعالیت</dt>
                    <dd className="mt-1.5 font-extrabold text-foreground">{tour.tags[2]}</dd>
                  </div>
                </dl>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {tour.highlights.slice(0, 3).map((highlight) => <li key={highlight} className="soft-chip">{highlight}</li>)}
                </ul>

                <div className="mt-auto border-t border-border/70 pt-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-4 text-secondary" />نزدیک‌ترین حرکت: {formatDeparture(tour.departureOptions[0].startDate)}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <span className="block text-[11px] text-muted-foreground">شروع قیمت هر بزرگسال</span>
                      <strong className="mt-1 block text-base text-primary">{formatPrice(tour.startingPrice)}</strong>
                    </div>
                    <Link href={`/tours/${tour.slug}`} className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-extrabold text-white hover:bg-primary/90">
                      جزئیات تور <ArrowLeft className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
