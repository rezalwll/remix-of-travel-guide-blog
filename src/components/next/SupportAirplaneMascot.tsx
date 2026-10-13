"use client";

import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const FLIGHT_DURATION_MS = 5_400;

export default function SupportAirplaneMascot() {
  const [hasLanded, setHasLanded] = useState(false);
  const [isGreetingOpen, setIsGreetingOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasLanded(true);
      setIsGreetingOpen(true);
      return;
    }

    const landingTimer = window.setTimeout(() => {
      setHasLanded(true);
      setIsGreetingOpen(true);
    }, FLIGHT_DURATION_MS);

    return () => window.clearTimeout(landingTimer);
  }, []);

  if (!hasLanded) {
    return (
      <div
        aria-hidden="true"
        className="support-airplane-flight pointer-events-none fixed left-0 top-0 z-[120]"
        data-support-mascot="flying"
      >
        <span className="support-airplane-artwork support-airplane-artwork--flying" />
      </div>
    );
  }

  return (
    <aside
      aria-label="پشتیبان کیاشی"
      className="support-airplane-dock fixed bottom-3 left-3 z-[120] flex items-end gap-2 sm:bottom-5 sm:left-5"
      data-support-mascot="landed"
    >
      {isGreetingOpen ? (
        <div
          className="support-airplane-greeting relative mb-16 w-[min(17rem,calc(100vw-7rem))] rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-[0_18px_60px_rgb(115_20_12/0.22)] backdrop-blur-md sm:mb-20 sm:w-72"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            className="absolute left-2 top-2 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="بستن پیام پشتیبان"
            onClick={() => setIsGreetingOpen(false)}
          >
            <X className="size-4" />
          </button>
          <p className="pe-6 text-sm font-black leading-7 text-foreground">سلام، من پشتیبان کیاشی هستم 👋</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">برای راهنمایی سفر و پیگیری سفارش کنارت هستم.</p>
          <Link
            href="/support"
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-extrabold text-white shadow-md shadow-primary/20 transition-colors hover:bg-[#d91d0c]"
          >
            <MessageCircle className="size-4" />
            گفتگو با پشتیبانی
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        className="support-airplane-button group absolute bottom-0 left-0 grid size-[5.75rem] place-items-center rounded-[2rem] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:size-28"
        aria-label={isGreetingOpen ? "پشتیبان کیاشی" : "بازکردن پیام پشتیبان کیاشی"}
        aria-expanded={isGreetingOpen}
        onClick={() => setIsGreetingOpen((current) => !current)}
      >
        <span className="support-airplane-artwork support-airplane-artwork--landed" aria-hidden="true" />
      </button>
    </aside>
  );
}
