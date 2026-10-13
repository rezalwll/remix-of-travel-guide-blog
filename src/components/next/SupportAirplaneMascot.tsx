"use client";

import Image from "next/image";
import { MessageCircleMore, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import SupportAssistantPanel from "@/components/next/SupportAssistantPanel";

const FLIGHT_DURATION_MS = 5_400;

type Point = { x: number; y: number };

const interpolate = (start: number, end: number, progress: number) => start + ((end - start) * progress);

const smoothstep = (progress: number) => progress * progress * (3 - (2 * progress));

const catmullRomPoint = (pointA: Point, pointB: Point, pointC: Point, pointD: Point, progress: number) => {
  const progressSquared = progress * progress;
  const progressCubed = progressSquared * progress;

  return {
    x: 0.5 * (
      (2 * pointB.x)
      + ((-pointA.x + pointC.x) * progress)
      + ((2 * pointA.x - (5 * pointB.x) + (4 * pointC.x) - pointD.x) * progressSquared)
      + ((-pointA.x + (3 * pointB.x) - (3 * pointC.x) + pointD.x) * progressCubed)
    ),
    y: 0.5 * (
      (2 * pointB.y)
      + ((-pointA.y + pointC.y) * progress)
      + ((2 * pointA.y - (5 * pointB.y) + (4 * pointC.y) - pointD.y) * progressSquared)
      + ((-pointA.y + (3 * pointB.y) - (3 * pointC.y) + pointD.y) * progressCubed)
    ),
  };
};

const resampleByDistance = (points: Point[], sampleCount: number) => {
  const cumulativeDistances = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulativeDistances.push(
      cumulativeDistances[index - 1]
      + Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y),
    );
  }

  const totalDistance = cumulativeDistances[cumulativeDistances.length - 1];
  let sourceIndex = 1;

  return Array.from({ length: sampleCount }, (_, index) => {
    const targetDistance = totalDistance * (index / (sampleCount - 1));
    while (sourceIndex < cumulativeDistances.length - 1 && cumulativeDistances[sourceIndex] < targetDistance) {
      sourceIndex += 1;
    }

    const segmentStartDistance = cumulativeDistances[sourceIndex - 1];
    const segmentDistance = cumulativeDistances[sourceIndex] - segmentStartDistance;
    const progress = segmentDistance === 0 ? 0 : (targetDistance - segmentStartDistance) / segmentDistance;

    return {
      x: interpolate(points[sourceIndex - 1].x, points[sourceIndex].x, progress),
      y: interpolate(points[sourceIndex - 1].y, points[sourceIndex].y, progress),
    };
  });
};

export const buildFlightKeyframes = (viewportWidth: number, viewportHeight: number) => {
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
  const route: Point[] = [
    { x: -planeWidth, y: viewportHeight * 0.14 },
    { x: viewportWidth * 0.12, y: viewportHeight * 0.04 },
    { x: viewportWidth * 0.55, y: viewportHeight * 0.07 },
    { x: viewportWidth * 0.86, y: viewportHeight * 0.25 },
    { x: viewportWidth * 0.82, y: viewportHeight * 0.48 },
    { x: viewportWidth * 0.58, y: viewportHeight * 0.66 },
    { x: viewportWidth * 0.25, y: viewportHeight * 0.58 },
    { x: viewportWidth * 0.04, y: viewportHeight * 0.52 },
    { x: viewportWidth * 0.02, y: viewportHeight * 0.72 },
    landingPoint,
  ];

  const densePoints = [route[0]];
  for (let routeIndex = 0; routeIndex < route.length - 1; routeIndex += 1) {
    const pointA = route[Math.max(0, routeIndex - 1)];
    const pointB = route[routeIndex];
    const pointC = route[routeIndex + 1];
    const pointD = route[Math.min(route.length - 1, routeIndex + 2)];
    for (let sampleIndex = 1; sampleIndex <= 48; sampleIndex += 1) {
      densePoints.push(catmullRomPoint(pointA, pointB, pointC, pointD, sampleIndex / 48));
    }
  }

  const flightPoints = resampleByDistance(densePoints, 240);
  return flightPoints.map((point, index) => {
    const previousPoint = flightPoints[Math.max(0, index - 10)];
    const nextPoint = flightPoints[Math.min(flightPoints.length - 1, index + 10)];
    const horizontalTravel = Math.abs(nextPoint.x - previousPoint.x);
    const bankAngle = Math.atan2(nextPoint.y - previousPoint.y, horizontalTravel) * (180 / Math.PI);
    const overallProgress = index / (flightPoints.length - 1);
    const takeoffProgress = smoothstep(Math.min(1, overallProgress / 0.15));
    const landingProgress = smoothstep(Math.max(0, Math.min(1, (overallProgress - 0.7) / 0.3)));
    const cruiseScale = interpolate(0.72, 0.88, takeoffProgress);
    const scale = interpolate(cruiseScale, landingScale, landingProgress);
    const pathRotation = Math.max(-12, Math.min(12, bankAngle * 0.17));
    const rotationSettle = smoothstep(Math.max(0, Math.min(1, (overallProgress - 0.78) / 0.22)));
    const rotation = interpolate(pathRotation, 0, rotationSettle);

    return {
      transform: `translate3d(${point.x}px, ${point.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
      opacity: overallProgress < 0.04 ? smoothstep(overallProgress / 0.04) : 1,
    };
  });
};

export default function SupportAirplaneMascot() {
  const flightRef = useRef<HTMLDivElement>(null);
  const supportButtonRef = useRef<HTMLButtonElement>(null);
  const [hasLanded, setHasLanded] = useState(false);
  const [isGreetingOpen, setIsGreetingOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hasOpenedPanel, setHasOpenedPanel] = useState(false);

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

  const openPanel = () => {
    setIsGreetingOpen(false);
    setHasOpenedPanel(true);
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    window.setTimeout(() => supportButtonRef.current?.focus(), 0);
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

      {hasLanded && !isPanelOpen ? (
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
              <button
                type="button"
                onClick={openPanel}
                className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-extrabold text-white shadow-md shadow-primary/20 transition-colors hover:bg-[#d91d0c]"
              >
                <MessageCircleMore className="size-4" />
                شروع گفتگو
              </button>
            </div>
          ) : null}

          <button
            ref={supportButtonRef}
            type="button"
            className="support-airplane-button absolute bottom-0 left-0 size-[5.75rem] rounded-[2rem] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:size-28"
            aria-label="بازکردن دستیار پشتیبانی کیاشی"
            aria-expanded={isPanelOpen}
            onClick={openPanel}
          >
            <span className="sr-only">پشتیبان کیاشی</span>
          </button>
        </aside>
      ) : null}

      {hasOpenedPanel ? <SupportAssistantPanel isOpen={isPanelOpen} onClose={closePanel} /> : null}
    </>
  );
}
