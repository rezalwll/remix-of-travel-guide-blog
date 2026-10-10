"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Plane } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ROUTE_NAVIGATION_START_EVENT } from "@/lib/navigation";

const SHOW_DELAY_MS = 90;
const MIN_VISIBLE_MS = 420;
const SAFETY_TIMEOUT_MS = 15_000;

const isInternalNavigation = (anchor: HTMLAnchorElement) => {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  const destination = new URL(anchor.href, window.location.href);
  if (destination.origin !== window.location.origin) return false;
  return `${destination.pathname}${destination.search}` !== `${window.location.pathname}${window.location.search}`;
};

export default function RouteTransitionOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const shownAtRef = useRef(0);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedRef = useRef(new Set<string>());
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const clearTimer = (timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = useCallback(() => {
    clearTimer(showTimerRef);
    clearTimer(safetyTimerRef);
    if (!visibleRef.current) return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAtRef.current));
    clearTimer(hideTimerRef);
    hideTimerRef.current = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
    }, remaining);
  }, []);

  const show = useCallback(() => {
    clearTimer(showTimerRef);
    clearTimer(hideTimerRef);
    clearTimer(safetyTimerRef);
    showTimerRef.current = setTimeout(() => {
      shownAtRef.current = performance.now();
      visibleRef.current = true;
      setVisible(true);
    }, SHOW_DELAY_MS);
    safetyTimerRef.current = setTimeout(hide, SAFETY_TIMEOUT_MS);
  }, [hide]);

  useEffect(() => hide(), [routeKey, hide]);

  useEffect(() => {
    const onStart = () => show();
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (anchor instanceof HTMLAnchorElement && isInternalNavigation(anchor)) show();
    };
    const prefetch = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement) || !isInternalNavigation(anchor)) return;
      const destination = new URL(anchor.href, window.location.href);
      const href = `${destination.pathname}${destination.search}`;
      if (prefetchedRef.current.has(href)) return;
      prefetchedRef.current.add(href);
      router.prefetch(href);
    };

    window.addEventListener(ROUTE_NAVIGATION_START_EVENT, onStart);
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", prefetch, true);
    document.addEventListener("touchstart", prefetch, { capture: true, passive: true });
    return () => {
      window.removeEventListener(ROUTE_NAVIGATION_START_EVENT, onStart);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", prefetch, true);
      document.removeEventListener("touchstart", prefetch, true);
      clearTimer(showTimerRef);
      clearTimer(hideTimerRef);
      clearTimer(safetyTimerRef);
    };
  }, [router, show]);

  return (
    <div
      data-route-loading={visible ? "true" : "false"}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-[200] grid place-items-center bg-white/58 px-4 backdrop-blur-[2px] transition-opacity duration-200 ${visible ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div className="route-loader-card flex min-w-56 flex-col items-center rounded-[1.5rem] border border-primary/25 bg-white/95 px-8 py-7 text-center shadow-[0_24px_70px_rgb(137_20_10/0.24)]">
        <div className="relative grid size-24 place-items-center" aria-hidden="true">
          <span className="absolute inset-2 rounded-full border-2 border-dashed border-primary/30" />
          <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </span>
          <span className="route-loader-plane-orbit absolute inset-0">
            <span className="absolute start-1/2 top-0 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
              <Plane className="size-5 -rotate-45" />
            </span>
          </span>
        </div>
        <strong className="mt-3 text-base font-black text-foreground">در حال آماده‌کردن مسیر بعدی…</strong>
        <span className="mt-1 text-xs leading-6 text-muted-foreground">چند لحظه همراه ما باش</span>
      </div>
    </div>
  );
}
