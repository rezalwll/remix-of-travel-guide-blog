"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type PersianDatePickerProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  name?: string;
  required?: boolean;
  variant?: "default" | "travel";
  className?: string;
};

type PersianParts = { year: number; month: number; day: number };

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const numericPersian = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const monthTitle = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
});
const fullDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function parseIso(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function persianParts(date: Date): PersianParts {
  const values = Object.fromEntries(
    numericPersian
      .formatToParts(date)
      .filter((part) => part.type === "year" || part.type === "month" || part.type === "day")
      .map((part) => [part.type, Number(part.value)]),
  );
  return values as PersianParts;
}

function startOfPersianMonth(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - persianParts(start).day + 1);
  start.setHours(12, 0, 0, 0);
  return start;
}

function movePersianMonth(monthStart: Date, amount: number) {
  let cursor = startOfPersianMonth(monthStart);
  const direction = amount >= 0 ? 1 : -1;
  for (let step = 0; step < Math.abs(amount); step += 1) {
    if (direction > 0) {
      cursor.setDate(cursor.getDate() + 32);
      cursor = startOfPersianMonth(cursor);
    } else {
      cursor.setDate(cursor.getDate() - 1);
      cursor = startOfPersianMonth(cursor);
    }
  }
  return cursor;
}

function daysOfPersianMonth(monthStart: Date) {
  const start = startOfPersianMonth(monthStart);
  const current = persianParts(start);
  const dates: Date[] = [];
  for (let offset = 0; offset < 32; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const parts = persianParts(date);
    if (parts.year !== current.year || parts.month !== current.month) break;
    dates.push(date);
  }
  return dates;
}

function PersianMonth({
  month,
  selected,
  min,
  max,
  onSelect,
  className,
}: {
  month: Date;
  selected: string;
  min?: string;
  max?: string;
  onSelect: (date: Date) => void;
  className?: string;
}) {
  const days = useMemo(() => daysOfPersianMonth(month), [month]);
  const leadingDays = (days[0].getDay() + 1) % 7;
  const today = toIso(new Date());

  return (
    <section className={cn("min-w-0 flex-1 px-3 pb-3", className)}>
      <h3 className="py-4 text-center text-sm font-extrabold text-foreground">{monthTitle.format(month)}</h3>
      <div className="grid grid-cols-7" dir="rtl">
        {weekDays.map((day, index) => (
          <span key={day} className={cn("grid h-8 place-items-center text-xs font-bold text-muted-foreground", index === 6 && "text-primary")}>
            {day}
          </span>
        ))}
        {Array.from({ length: leadingDays }, (_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
        {days.map((date) => {
          const iso = toIso(date);
          const parts = persianParts(date);
          const weekIndex = (date.getDay() + 1) % 7;
          const disabled = Boolean((min && iso < min.slice(0, 10)) || (max && iso > max.slice(0, 10)));
          const isSelected = iso === selected.slice(0, 10);
          const isToday = iso === today;
          return (
            <button
              type="button"
              key={iso}
              disabled={disabled}
              onClick={() => onSelect(date)}
              aria-label={fullDate.format(date)}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              className={cn(
                "mx-auto my-0.5 grid size-9 place-items-center rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-25",
                weekIndex === 6 && "text-primary",
                isToday && !isSelected && "bg-primary/10 font-extrabold text-primary",
                isSelected && "bg-primary font-extrabold text-white",
              )}
            >
              {parts.day.toLocaleString("fa-IR", { useGrouping: false })}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function PersianDatePicker({
  value,
  defaultValue = "",
  onChange,
  label,
  placeholder = "انتخاب تاریخ",
  min,
  max,
  name,
  required,
  variant = "default",
  className,
}: PersianDatePickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfPersianMonth(parseIso(currentValue) ?? new Date()));
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseIso(currentValue);
  const secondMonth = useMemo(() => movePersianMonth(visibleMonth, 1), [visibleMonth]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const choose = (date: Date) => {
    const nextValue = toIso(date);
    setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  };

  const openCalendar = () => {
    setVisibleMonth(startOfPersianMonth(selectedDate ?? new Date()));
    setOpen(true);
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      {variant === "default" && label ? <span className="mb-1.5 block text-xs font-bold">{label}</span> : null}
      <button
        type="button"
        onClick={() => open ? setOpen(false) : openCalendar()}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-required={required}
        className={cn(
          "flex w-full items-center text-start outline-none",
          variant === "travel"
            ? "travel-field min-h-[4.25rem] flex-col items-stretch justify-center"
            : "min-h-11 gap-2 rounded-lg border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {variant === "travel" ? (
          <span className="flex h-5 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
            {label}
          </span>
        ) : <CalendarDays className="size-4 shrink-0 text-secondary" aria-hidden="true" />}
        <span className={cn("truncate", variant === "travel" && "mt-1 h-5 text-sm font-extrabold leading-5", !selectedDate && "text-muted-foreground")}>
          {selectedDate ? fullDate.format(selectedDate) : placeholder}
        </span>
      </button>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}

      {open ? (
        <div
          role="dialog"
          aria-label={label ? `انتخاب ${label}` : "انتخاب تاریخ شمسی"}
          className="fixed inset-x-3 top-24 z-[90] mx-auto max-h-[calc(100vh-7rem)] max-w-[42rem] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl sm:absolute sm:inset-x-auto sm:end-0 sm:top-[calc(100%+0.5rem)] sm:w-[42rem]"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <button type="button" onClick={() => setVisibleMonth((month) => movePersianMonth(month, -1))} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="ماه قبل">
              <ChevronRight className="size-4" />
            </button>
            <button type="button" onClick={() => setVisibleMonth(startOfPersianMonth(new Date()))} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5">
              <RotateCcw className="size-3.5" /> امروز
            </button>
            <button type="button" onClick={() => setVisibleMonth((month) => movePersianMonth(month, 1))} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="ماه بعد">
              <ChevronLeft className="size-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-x-reverse sm:divide-border" dir="rtl">
            <PersianMonth month={visibleMonth} selected={currentValue} min={min} max={max} onSelect={choose} />
            <PersianMonth month={secondMonth} selected={currentValue} min={min} max={max} onSelect={choose} className="hidden sm:block" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
