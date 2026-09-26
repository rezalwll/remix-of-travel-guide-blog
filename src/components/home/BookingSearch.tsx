"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router";
import {
  ArrowLeftRight,
  BusFront,
  Check,
  ChevronDown,
  Compass,
  Hotel,
  MapPin,
  Minus,
  Plane,
  Plus,
  Search,
  TrainFront,
  Users,
  X,
} from "lucide-react";
import { travelLocations, type TravelLocation } from "@/data/homepage";
import { cn } from "@/lib/utils";
import { PersianDatePicker } from "@/components/ui/PersianDatePicker";

type ServiceTab = "flight" | "hotel" | "tour" | "train" | "bus" | "ziyarat";
type Counts = { adults: number; children: number; infants: number };

const tabs = [
  { id: "flight", label: "پرواز", icon: Plane },
  { id: "hotel", label: "هتل", icon: Hotel },
  { id: "tour", label: "تور", icon: Compass },
  { id: "train", label: "قطار", icon: TrainFront },
  { id: "bus", label: "اتوبوس", icon: BusFront },
  { id: "ziyarat", label: "زیارت", icon: Compass },
] satisfies { id: ServiceTab; label: string; icon: typeof Plane }[];

const FieldLabel = ({
  icon: Icon,
  children,
}: {
  icon?: typeof MapPin;
  children: React.ReactNode;
}) => (
  <span className="flex h-5 items-center gap-1.5 text-[11px] font-semibold leading-none text-muted-foreground">
    {Icon ? <Icon className="size-3.5 shrink-0 text-secondary" aria-hidden="true" /> : null}
    {children}
  </span>
);

const LocationSelect = ({
  label,
  value,
  onChange,
  cityOnly = false,
}: {
  label: string;
  value: TravelLocation | null;
  onChange: (location: TravelLocation) => void;
  cityOnly?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const options = useMemo(
    () =>
      travelLocations
        .filter(
          (item) =>
            !query ||
            `${item.city} ${item.airport} ${item.code}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .slice(0, 7),
    [query],
  );

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="travel-field w-full text-start"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FieldLabel icon={MapPin}>{label}</FieldLabel>
        <span className="mt-1 flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm leading-5",
              value ? "font-extrabold text-foreground" : "text-muted-foreground",
            )}
          >
            {value ? value.city : "انتخاب کنید"}
          </span>
          {value ? (
            <span className="ltr-value hidden text-[11px] font-bold text-muted-foreground sm:inline">
              {value.code}
            </span>
          ) : null}
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl">
          <label className="relative block">
            <span className="sr-only">جست‌وجوی شهر یا فرودگاه</span>
            <Search className="absolute end-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="نام شهر یا فرودگاه"
              className="h-11 w-full rounded-xl border border-transparent bg-muted px-3 pe-9 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10"
            />
          </label>
          <div className="mt-2 max-h-60 overflow-y-auto" role="listbox">
            {options.length ? (
              options.map((item) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={value?.id === item.id}
                  key={item.id}
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-start transition hover:bg-muted focus-visible:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/10 text-xs font-black text-secondary">
                    {item.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{item.city}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {cityOnly ? item.country : item.airport}
                    </span>
                  </span>
                  <Check
                    className={cn(
                      "size-4 text-secondary",
                      value?.id === item.id ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-muted-foreground">موردی پیدا نشد</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const DateField = ({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}) => <PersianDatePicker label={label} value={value} min={min} onChange={onChange} variant="travel" />;

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <label className="travel-field min-w-0">
    <FieldLabel>{label}</FieldLabel>
    <span className="relative mt-1 block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-5 w-full appearance-none bg-transparent pe-5 text-sm font-extrabold leading-5 outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-0 top-0.5 size-4 text-muted-foreground" aria-hidden="true" />
    </span>
  </label>
);

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <label className="travel-field min-w-0">
    <FieldLabel icon={Users}>{label}</FieldLabel>
    <input
      type="number"
      min="1"
      max="9"
      value={value}
      onChange={(event) => onChange(Math.min(9, Math.max(1, Number(event.target.value))))}
      className="ltr-value mt-1 h-5 w-full bg-transparent text-sm font-extrabold leading-5 outline-none"
    />
  </label>
);

const Counter = ({
  label,
  value,
  onChange,
  min = 0,
  max = 9,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex min-h-12 items-center justify-between gap-4">
    <div>
      <p className="text-sm font-bold">{label}</p>
      <p className="text-[11px] text-muted-foreground">نفر</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="grid size-9 place-items-center rounded-xl border border-border transition hover:border-secondary hover:text-secondary disabled:opacity-35"
        aria-label={`کاهش ${label}`}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-black">{value.toLocaleString("fa-IR")}</span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid size-9 place-items-center rounded-xl border border-border transition hover:border-secondary hover:text-secondary disabled:opacity-35"
        aria-label={`افزایش ${label}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  </div>
);

const PassengerSelect = ({
  counts,
  setCounts,
  hotel = false,
}: {
  counts: Counts;
  setCounts: (counts: Counts) => void;
  hotel?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const total = counts.adults + (hotel ? 0 : counts.children + counts.infants);
  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="travel-field w-full text-start"
        aria-expanded={open}
      >
        <FieldLabel icon={Users}>{hotel ? "اتاق و مهمان" : "مسافران"}</FieldLabel>
        <span className="mt-1 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-extrabold leading-5">
            {hotel
              ? `${Math.max(1, counts.children).toLocaleString("fa-IR")} اتاق، ${total.toLocaleString("fa-IR")} مهمان`
              : `${total.toLocaleString("fa-IR")} مسافر`}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </span>
      </button>
      {open ? (
        <div className="absolute end-0 top-full z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between border-b border-border pb-3">
            <span className="font-extrabold">{hotel ? "اتاق و مهمان" : "تعداد مسافران"}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="grid size-9 place-items-center rounded-xl hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
          {hotel ? (
            <Counter
              label="اتاق"
              value={Math.max(1, counts.children)}
              min={1}
              max={5}
              onChange={(value) => setCounts({ ...counts, children: value })}
            />
          ) : null}
          <Counter
            label="بزرگسال"
            value={counts.adults}
            min={1}
            onChange={(value) => setCounts({ ...counts, adults: value })}
          />
          {!hotel ? (
            <>
              <Counter
                label="کودک"
                value={counts.children}
                onChange={(value) => setCounts({ ...counts, children: value })}
              />
              <Counter
                label="نوزاد"
                value={counts.infants}
                onChange={(value) => setCounts({ ...counts, infants: value })}
              />
            </>
          ) : null}
          <button type="button" onClick={() => setOpen(false)} className="primary-cta mt-3 w-full">
            تأیید انتخاب
          </button>
        </div>
      ) : null}
    </div>
  );
};

const BookingSearch = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<ServiceTab>("flight");
  const [error, setError] = useState("");
  const [from, setFrom] = useState<TravelLocation | null>(travelLocations[0]);
  const [to, setTo] = useState<TravelLocation | null>(travelLocations.find((item) => item.code === "IST") ?? null);
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState<"round" | "oneway" | "multi">("round");
  const [counts, setCounts] = useState<Counts>({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState("اقتصادی");
  const [hotelCity, setHotelCity] = useState<TravelLocation | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [hotelCounts, setHotelCounts] = useState<Counts>({ adults: 2, children: 1, infants: 0 });
  const [tourDestination, setTourDestination] = useState<TravelLocation | null>(null);
  const [tourDate, setTourDate] = useState("");
  const [tourDuration, setTourDuration] = useState("فرقی نمی‌کند");
  const [ziyaratDestination, setZiyaratDestination] = useState<TravelLocation | null>(travelLocations.find((item) => item.code === "NJF") ?? null);
  const [ziyaratDate, setZiyaratDate] = useState("");
  const [ziyaratType, setZiyaratType] = useState("هوایی");
  const [simpleFrom, setSimpleFrom] = useState<TravelLocation | null>(travelLocations[0]);
  const [simpleTo, setSimpleTo] = useState<TravelLocation | null>(travelLocations[2]);
  const [simpleDate, setSimpleDate] = useState("");
  const [simplePassengers, setSimplePassengers] = useState(1);

  useEffect(() => {
    const raw = localStorage.getItem("kiashi-search");
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { from?: TravelLocation; to?: TravelLocation };
      if (saved.from) setFrom(saved.from);
      if (saved.to) setTo(saved.to);
    } catch {
      // Invalid prototype state is intentionally ignored.
    }
  }, []);

  const submit = (path: string, params: Record<string, string>) => {
    setError("");
    localStorage.setItem("kiashi-search", JSON.stringify({ from, to }));
    navigate(`${path}?${new URLSearchParams(params).toString()}`);
  };

  const onSubmit = () => {
    if (active === "flight") {
      if (!from || !to) return setError("مبدا و مقصد را انتخاب کنید.");
      if (from.id === to.id) return setError("مبدا و مقصد نمی‌توانند یکسان باشند.");
      if (!departure) return setError("تاریخ رفت را انتخاب کنید.");
      if (tripType === "round" && (!returnDate || returnDate < departure)) return setError("تاریخ برگشت باید بعد از رفت باشد.");
      return submit("/flights/search", {
        from: from.code,
        to: to.code,
        departure,
        ...(returnDate ? { return: returnDate } : {}),
        adults: String(counts.adults),
        children: String(counts.children),
        infants: String(counts.infants),
        cabin,
        trip: tripType === "round" ? "roundtrip" : tripType === "oneway" ? "oneway" : "multicity",
      });
    }
    if (active === "hotel") {
      if (!hotelCity || !checkIn || !checkOut) return setError("مقصد و تاریخ ورود و خروج را تکمیل کنید.");
      if (checkOut <= checkIn) return setError("تاریخ خروج باید بعد از ورود باشد.");
      return submit("/hotels/search", {
        destination: hotelCity.code,
        checkin: checkIn,
        checkout: checkOut,
        rooms: String(Math.max(1, hotelCounts.children)),
        adults: String(hotelCounts.adults),
        children: "0",
      });
    }
    if (active === "tour") {
      if (!tourDestination || !tourDate) return setError("مقصد و تاریخ تور را انتخاب کنید.");
      return submit("/tours", { destination: tourDestination.city, date: tourDate, duration: tourDuration });
    }
    if (active === "ziyarat") {
      if (!ziyaratDestination || !ziyaratDate) return setError("مقصد و تاریخ سفر زیارتی را انتخاب کنید.");
      return submit("/ziyarat", { destination: ziyaratDestination.city, date: ziyaratDate, type: ziyaratType });
    }
    if (!simpleFrom || !simpleTo || !simpleDate) return setError("مبدا، مقصد و تاریخ را تکمیل کنید.");
    if (simpleFrom.id === simpleTo.id) return setError("مبدا و مقصد نمی‌توانند یکسان باشند.");
    return submit(active === "train" ? "/trains/search" : "/buses/search", {
      from: simpleFrom.code,
      to: simpleTo.code,
      date: simpleDate,
      passengers: String(simplePassengers),
    });
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <section id="booking" aria-label="جست‌وجوی خدمات سفر" className="relative z-10 mx-auto -mt-24 w-full max-w-[1280px] px-4 sm:-mt-28 sm:px-6 lg:px-8">
      <div
        className="rounded-[1.5rem] border border-[#DF301C]/30 bg-card p-3 sm:p-5"
        style={{
          backgroundImage: "radial-gradient(circle at 88% 12%, rgba(223, 48, 28, 0.27), transparent 31%), radial-gradient(circle at 12% 88%, rgba(255, 68, 36, 0.2), transparent 35%)",
          boxShadow: "0 28px 76px -28px rgba(223, 48, 28, 0.78), 0 10px 38px -18px rgba(223, 48, 28, 0.58), var(--shadow-float)",
        }}
      >
        <div className="mb-2 flex justify-end">
          <Link to="/" aria-label="کیاشی، صفحه اصلی" className="inline-flex">
            <img src="/kiashi-logo.png" alt="کیاشی" className="h-14 w-auto max-w-[160px] object-contain" />
          </Link>
        </div>
        <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-border/80 pb-3" role="tablist" aria-label="انتخاب نوع خدمت">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => {
                  setActive(tab.id);
                  setError("");
                }}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition",
                  active === tab.id
                    ? "bg-[#DF301C] text-white shadow-lg shadow-[#DF301C]/20"
                    : "text-muted-foreground hover:bg-[#FB6C00]/10 hover:text-[#e55f00]",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pt-4">
          {active === "flight" ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {[["round", "رفت و برگشت"], ["oneway", "یک‌طرفه"], ["multi", "چندمسیره"]].map(([id, label]) => (
                  <label
                    key={id}
                    className={cn(
                      "flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-bold transition",
                      tripType === id
                        ? "border-[#FB6C00]/35 bg-[#FB6C00]/10 text-[#d85600]"
                        : "border-border text-muted-foreground hover:border-[#FB6C00]/45",
                    )}
                  >
                    <input type="radio" name="tripType" checked={tripType === id} onChange={() => setTripType(id as typeof tripType)} className="accent-[#FB6C00]" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="grid items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-6">
                <div className="relative sm:col-span-2 xl:col-span-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <LocationSelect label="مبدا" value={from} onChange={setFrom} />
                    <LocationSelect label="مقصد" value={to} onChange={setTo} />
                  </div>
                  <button
                    type="button"
                    onClick={swap}
                    className="absolute start-1/2 top-1/2 z-20 grid size-9 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-[#FB6C00] bg-[#FB6C00] text-white shadow-md shadow-[#FB6C00]/20 transition-colors hover:border-[#e55f00] hover:bg-[#e55f00] max-sm:hidden"
                    aria-label="جابجایی مبدا و مقصد"
                  >
                    <ArrowLeftRight className="size-4" />
                  </button>
                </div>
                <DateField label="تاریخ رفت" value={departure} onChange={setDeparture} />
                {tripType === "round" ? (
                  <DateField label="تاریخ برگشت" value={returnDate} min={departure} onChange={setReturnDate} />
                ) : (
                  <div className="hidden xl:block" aria-hidden="true" />
                )}
                <PassengerSelect counts={counts} setCounts={setCounts} />
                <SelectField label="کلاس پروازی" value={cabin} onChange={setCabin} options={["اقتصادی", "بیزنس", "فرست"]} />
              </div>
            </>
          ) : null}

          {active === "hotel" ? (
            <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <LocationSelect label="شهر یا هتل" value={hotelCity} onChange={setHotelCity} cityOnly />
              <DateField label="تاریخ ورود" value={checkIn} onChange={setCheckIn} />
              <DateField label="تاریخ خروج" value={checkOut} min={checkIn} onChange={setCheckOut} />
              <PassengerSelect counts={hotelCounts} setCounts={setHotelCounts} hotel />
            </div>
          ) : null}

          {active === "tour" ? (
            <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <LocationSelect label="مقصد تور" value={tourDestination} onChange={setTourDestination} cityOnly />
              <DateField label="تاریخ حرکت" value={tourDate} onChange={setTourDate} />
              <SelectField label="مدت سفر" value={tourDuration} onChange={setTourDuration} options={["فرقی نمی‌کند", "۳ تا ۵ روز", "۶ تا ۸ روز", "بیشتر از ۸ روز"]} />
            </div>
          ) : null}

          {active === "train" || active === "bus" ? (
            <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <LocationSelect label="مبدا" value={simpleFrom} onChange={setSimpleFrom} cityOnly />
              <LocationSelect label="مقصد" value={simpleTo} onChange={setSimpleTo} cityOnly />
              <DateField label="تاریخ حرکت" value={simpleDate} onChange={setSimpleDate} />
              <NumberField label="تعداد مسافران" value={simplePassengers} onChange={setSimplePassengers} />
            </div>
          ) : null}

          {active === "ziyarat" ? (
            <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <LocationSelect label="مقصد زیارتی" value={ziyaratDestination} onChange={setZiyaratDestination} cityOnly />
              <DateField label="تاریخ سفر" value={ziyaratDate} onChange={setZiyaratDate} />
              <SelectField label="نوع سفر" value={ziyaratType} onChange={setZiyaratType} options={["هوایی", "زمینی", "کاروانی"]} />
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive" role="alert">{error}</p>
          ) : null}
          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[11px] leading-6 text-muted-foreground sm:text-xs">
              قیمت و ظرفیت گزینه‌ها هنگام جست‌وجو بررسی می‌شود و مبلغ نهایی پیش از پرداخت نمایش داده خواهد شد.
            </p>
            <button type="button" onClick={onSubmit} className="primary-cta min-w-44">
              <Search className="size-4" aria-hidden="true" />
              جست‌وجوی {tabs.find((tab) => tab.id === active)?.label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSearch;
