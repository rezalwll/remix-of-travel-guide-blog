"use client";

import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

type Direction = "previous" | "next";

export function MediaRail({ children, label }: { children: ReactNode; label: string }) {
  const railRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef({ active: false, moved: false, pointerId: -1, startX: 0, startScrollLeft: 0 });
  const [canGoPrevious, setCanGoPrevious] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const position = Math.abs(rail.scrollLeft);
    const maxPosition = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const edgeTolerance = 24;
    setCanGoPrevious(position > edgeTolerance);
    setCanGoNext(position < maxPosition - edgeTolerance);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateControls();
    rail.addEventListener("scroll", updateControls, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateControls);
    observer?.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateControls);
      observer?.disconnect();
    };
  }, [updateControls]);

  const move = useCallback((direction: Direction) => {
    const rail = railRef.current;
    if (!rail) return;

    const rtlMultiplier = getComputedStyle(rail).direction === "rtl" ? -1 : 1;
    const directionMultiplier = direction === "next" ? 1 : -1;
    rail.scrollBy({
      left: rtlMultiplier * directionMultiplier * Math.max(280, rail.clientWidth * 0.82),
      behavior: "smooth",
    });
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;

    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
    };
    rail.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag.active || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.moved = true;
    if (!drag.moved) return;

    event.preventDefault();
    const isRtl = getComputedStyle(rail).direction === "rtl";
    rail.scrollLeft = drag.startScrollLeft + (isRtl ? distance : -distance);
  };

  const finishDrag = (event: PointerEvent<HTMLUListElement>) => {
    const rail = railRef.current;
    if (!rail || dragRef.current.pointerId !== event.pointerId) return;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    dragRef.current.active = false;
  };

  return (
    <div className="relative mt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <MoveHorizontal className="size-4 text-primary" aria-hidden="true" />
          برای دیدن موارد بیشتر، کارت‌ها را بکشید
        </p>
        <div className="flex shrink-0 gap-2" aria-label={`کنترل ${label}`}>
          <button
            type="button"
            onClick={() => move("previous")}
            disabled={!canGoPrevious}
            className="grid size-10 place-items-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="موارد قبلی"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move("next")}
            disabled={!canGoNext}
            className="grid size-10 place-items-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="موارد بعدی"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul
        ref={railRef}
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move("next");
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            move("previous");
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={(event) => {
          if (!dragRef.current.moved) return;
          event.preventDefault();
          event.stopPropagation();
          dragRef.current.moved = false;
        }}
        className="scrollbar-none -mx-4 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-3 active:cursor-grabbing sm:mx-0 sm:px-0"
      >
        {children}
      </ul>
    </div>
  );
}
