"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FLIGHT_DURATION_MS = 5_400;

type Point = { x: number; y: number };

const cubicPoint = (start: Point, controlA: Point, controlB: Point, end: Point, progress: number) => {
  const inverse = 1 - progress;
  return {
    x: (inverse ** 3 * start.x) + (3 * inverse ** 2 * progress * controlA.x) + (3 * inverse * progress ** 2 * controlB.x) + (progress ** 3 * end.x),
    y: (inverse ** 3 * start.y) + (3 * inverse ** 2 * progress * controlA.y) + (3 * inverse * progress ** 2 * controlB.y) + (progress ** 3 * end.y),
  };
};

const buildFlightKeyframes = (viewportWidth: number, viewportHeight: number) => {
  const isMobile = viewportWidth < 640;
  const planeWidth = Math.min(304, Math.max(176, viewportWidth * 0.22));
  const dockButtonSize = isMobile ? 92 : 112;
  const dockedWidth = dockButtonSize;
  const dockInset = isMobile ? 12 : 20;
  const dockedHeight = dockedWidth * (533 / 800);
  const landingPoint = {
    x: dockInset + ((dockButtonSize - dockedWidth) / 2),
    y: viewportHeight - dockInset - dockButtonSize + ((dockButtonSize - dockedHeight) / 2),
  };
  const landingScale = dockedWidth / planeWidth;
  const segments: [Point, Point, Point, Point][] = [
    [
      { x: -planeWidth, y: viewportHeight * 0.14 },
      { x: viewportWidth * 0.06, y: -40 },
      { x: viewportWidth * 0.65, y: -10 },
      { x: viewportWidth * 0.82, y: viewportHeight * 0.25 },
    ],
    [
      { x: viewportWidth * 0.82, y: viewportHeight * 0.25 },
      { x: viewportWidth * 1.06, y: viewportHeight * 0.42 },
      { x: viewportWidth * 0.58, y: viewportHeight * 0.75 },
      { x: viewportWidth * 0.22, y: viewportHeight * 0.56 },
    ],
    [
      { x: viewportWidth * 0.22, y: viewportHeight * 0.56 },
      { x: viewportWidth * 0.02, y: viewportHeight * 0.45 },
      { x: landingPoint.x, y: viewportHeight * 0.72 },
      landingPoint,
    ],
  ];
  const points = segments.flatMap((segment, segmentIndex) => Array.from({ length: 60 }, (_, index) => {
    const progress = index / 59;
    const point = cubicPoint(...segment, progress);
    const nextPoint = cubicPoint(...segment, Math.min(1, progress + 0.02));
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
    const overallProgress = (segmentIndex * 60 + index) / 179;
    const scale = overallProgress < 0.2
      ? 0.72 + (overallProgress * 0.7)
      : 0.86 + ((landingScale - 0.86) * ((overallProgress - 0.2) / 0.8));
    const pathRotation = Math.max(-16, Math.min(16, angle * 0.24));
    const rotation = overallProgress > 0.84
      ? pathRotation * (1 - ((overallProgress - 0.84) / 0.16))
      : pathRotation;
    return {
      transform: `translate3d(${point.x}px, ${point.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
      opacity: overallProgress < 0.035 ? overallProgress / 0.035 : 1,
    };
  }));
  return points;
};

export default function SupportAirplaneMascot() {
  const flightRef = useRef<HTMLDivElement>(null);
  const [hasLanded, setHasLanded] = useState(false);
  const [isGreetingOpen, setIsGreetingOpen] = useState(false);

  useEffect(() => {
    const land = () => {
      setHasLanded(true);
      setIsGreetingOpen(true);
    };
    const flightElement = flightRef.current;
    if (!flightElement) return;
    const keyframes = buildFlightKeyframes(window.innerWidth, window.innerHeight);
    const finalFrame = keyframes[keyframes.length - 1];
    const settleWithoutAnimation = () => {
      flightElement.style.transform = finalFrame.transform;
      flightElement.style.opacity = "1";
      land();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settleWithoutAnimation();
      return;
    }

    if (typeof flightElement.animate !== "function") {
      const landingTimer = window.setTimeout(settleWithoutAnimation, FLIGHT_DURATION_MS);
      return () => window.clearTimeout(landingTimer);
    }

    const animation = flightElement.animate(keyframes, {
      duration: FLIGHT_DURATION_MS,
      easing: "linear",
      fill: "forwards",
    });
    animation.onfinish = land;
    return () => animation.cancel();
  }, []);

  return (
    <>
      <div
        ref={flightRef}
        aria-hidden="true"
        className="support-airplane-flight pointer-events-none fixed left-0 top-0 z-[120]"
        data-support-mascot={hasLanded ? "landed-visual" : "flying"}
      >
        <Image
          src="/images/mascot/kiashi-support-airplane-v3.webp"
          alt=""
          width={800}
          height={533}
          priority
          sizes="(max-width: 640px) 176px, 304px"
          className="support-airplane-artwork support-airplane-artwork--flying"
        />
      </div>

      {hasLanded ? (
        <aside
          aria-label="پشتیبان کیاشی"
          className="support-airplane-dock fixed bottom-3 left-3 z-[121] flex items-end gap-2 sm:bottom-5 sm:left-5"
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
            className="support-airplane-button absolute bottom-0 left-0 size-[5.75rem] rounded-[2rem] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:size-28"
            aria-label={isGreetingOpen ? "پشتیبان کیاشی" : "بازکردن پیام پشتیبان کیاشی"}
            aria-expanded={isGreetingOpen}
            onClick={() => setIsGreetingOpen((current) => !current)}
          >
            <span className="sr-only">پشتیبان کیاشی</span>
          </button>
        </aside>
      ) : null}
    </>
  );
}
