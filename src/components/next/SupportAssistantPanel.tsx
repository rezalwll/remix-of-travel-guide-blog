"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  CircleHelp,
  CreditCard,
  FilePenLine,
  Headphones,
  LoaderCircle,
  LockKeyhole,
  MessageCircleMore,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  TicketCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/apiClient";
import { backend, type ApiSupportTicket, type ApiTracking } from "@/services/backend";
import { findPublicOrder } from "@/services/orderTracking";
import { serviceLabel } from "@/services/orderView";
import { viewForBookingStatus } from "@/types/order";
import { formatPrice } from "@/utils/flight";

type PanelView = "home" | "tracking" | "ticket" | "guide";
type GuideKey = "purchase" | "refund" | "payment" | "passenger";

type Guide = {
  title: string;
  description: string;
  steps: string[];
  href: string;
  cta: string;
  icon: LucideIcon;
};

const guides: Record<GuideKey, Guide> = {
  purchase: {
    title: "راهنمای خرید",
    description: "برای خرید مطمئن، این چهار مرحله را به‌ترتیب بررسی کن.",
    steps: ["جست‌وجو و مقایسهٔ گزینه‌ها", "بررسی قوانین نرخ و بار", "ثبت دقیق اطلاعات مسافران", "مرور مبلغ و پرداخت امن"],
    href: "/help/purchase-guide",
    cta: "مشاهده راهنمای کامل",
    icon: TicketCheck,
  },
  refund: {
    title: "کنسلی و استرداد",
    description: "مبلغ قابل بازگشت به قوانین همان خدمت و زمان ثبت درخواست وابسته است.",
    steps: ["ابتدا وضعیت سفارش را پیگیری کن", "قوانین کنسلی نرخ را بررسی کن", "درخواست را از حساب کاربری ثبت کن", "وضعیت بازگشت وجه را آنلاین دنبال کن"],
    href: "/help/refund-guide",
    cta: "راهنمای استرداد",
    icon: RotateCcw,
  },
  payment: {
    title: "مشکل پرداخت",
    description: "اگر مبلغ کسر شده ولی سفارش قطعی نیست، پرداخت را دوباره تکرار نکن.",
    steps: ["شماره سفارش یا مرجع پرداخت را آماده کن", "وضعیت سفارش را از پیگیری بررسی کن", "رسید بانکی را نگه دار", "در صورت مغایرت، درخواست پشتیبانی ثبت کن"],
    href: "/track-order",
    cta: "بررسی وضعیت سفارش",
    icon: CreditCard,
  },
  passenger: {
    title: "اصلاح اطلاعات مسافر",
    description: "امکان و هزینهٔ اصلاح نام یا مشخصات به نوع خدمت و قوانین تأمین‌کننده بستگی دارد.",
    steps: ["پس از صدور، خرید جدید انجام نده", "شماره سفارش و مشخصات صحیح را آماده کن", "درخواست پشتیبانی ثبت کن", "تا اعلام نتیجه از تغییر برنامه سفر خودداری کن"],
    href: "/account/support",
    cta: "ثبت درخواست اصلاح",
    icon: FilePenLine,
  },
};

const normalizeDigits = (value: string) => value
  .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const errorMessage = (error: unknown, fallback: string) => (
  error instanceof ApiError || error instanceof Error ? error.message : fallback
);

export default function SupportAssistantPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<PanelView>("home");
  const [guideKey, setGuideKey] = useState<GuideKey>("purchase");
  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [trackingIdentifier, setTrackingIdentifier] = useState("");
  const [trackingMobile, setTrackingMobile] = useState("");
  const [trackingResult, setTrackingResult] = useState<ApiTracking | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({ topic: "سفارش و رزرو", subject: "", order: "", body: "" });
  const [ticketError, setTicketError] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<ApiSupportTicket | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ));
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      if (!panelRef.current.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (activeElement === first || activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || activeElement === panelRef.current)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [isOpen, onClose]);

  const openGuide = (key: GuideKey) => {
    setGuideKey(key);
    setView("guide");
  };

  const askAssistant = (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
    setLastQuestion(value);
    setQuestion("");
    if (/پیگیر|سفارش|رزرو|کد/.test(value)) setView("tracking");
    else if (/استرداد|کنسل|لغو|بازگشت/.test(value)) openGuide("refund");
    else if (/پرداخت|کسر|بانک|تراکنش/.test(value)) openGuide("payment");
    else if (/مسافر|نام|مشخصات|اصلاح/.test(value)) openGuide("passenger");
    else if (/خرید|جستجو|جست‌وجو/.test(value)) openGuide("purchase");
    else {
      setTicketForm((current) => ({
        ...current,
        subject: value.slice(0, 90),
        body: value,
      }));
      setView("ticket");
    }
  };

  const trackOrder = async (event: FormEvent) => {
    event.preventDefault();
    const identifier = trackingIdentifier.trim();
    const mobile = normalizeDigits(trackingMobile).replace(/[^+\d]/g, "");
    setTrackingError("");
    setTrackingResult(null);
    if (identifier.length < 3 || !/^09\d{9}$/.test(mobile)) {
      setTrackingError("شناسه سفارش و شماره موبایل ۱۱ رقمی خریدار را درست وارد کن.");
      return;
    }
    setTrackingLoading(true);
    try {
      setTrackingResult(await findPublicOrder(identifier, mobile));
    } catch (error) {
      setTrackingError(errorMessage(error, "سفارشی با این مشخصات پیدا نشد."));
    } finally {
      setTrackingLoading(false);
    }
  };

  const createTicket = async (event: FormEvent) => {
    event.preventDefault();
    setTicketError("");
    setCreatedTicket(null);
    if (ticketForm.subject.trim().length < 3 || ticketForm.body.trim().length < 3) {
      setTicketError("موضوع و شرح درخواست را کامل‌تر بنویس.");
      return;
    }
    setTicketLoading(true);
    const orderLine = ticketForm.order.trim() ? `\nشناسه سفارش: ${ticketForm.order.trim()}` : "";
    try {
      const response = await backend.createSupport(
        `[${ticketForm.topic}] ${ticketForm.subject.trim()}`,
        `${ticketForm.body.trim()}${orderLine}`,
      );
      setCreatedTicket(response.ticket);
    } catch (error) {
      setTicketError(errorMessage(error, "ثبت درخواست انجام نشد؛ دوباره تلاش کن."));
    } finally {
      setTicketLoading(false);
    }
  };

  const guide = guides[guideKey];
  const GuideIcon = guide.icon;
  const heading = view === "home"
    ? "پشتیبان کیاشی"
    : view === "tracking"
      ? "پیگیری سفارش"
      : view === "ticket"
        ? "ثبت درخواست"
        : guide.title;

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="بستن پنجره پشتیبانی"
        className="support-assistant-backdrop fixed inset-0 z-[128] bg-slate-950/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-assistant-title"
        tabIndex={-1}
        className="support-assistant-panel fixed inset-x-0 bottom-0 z-[130] flex h-[min(92dvh,52rem)] flex-col overflow-hidden rounded-t-[2rem] border border-white/70 bg-white shadow-[0_28px_90px_rgb(53_17_13/0.32)] outline-none sm:bottom-5 sm:left-5 sm:right-auto sm:h-[min(46rem,calc(100dvh-2.5rem))] sm:w-[25rem] sm:rounded-[2rem]"
      >
        <header className="relative overflow-hidden bg-gradient-to-l from-[#ef2918] via-[#f33120] to-[#c9150a] px-4 pb-4 pt-3 text-white">
          <span className="pointer-events-none absolute -left-12 -top-16 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            {view !== "home" ? (
              <button
                type="button"
                onClick={() => setView("home")}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
                aria-label="بازگشت به صفحه اصلی پشتیبانی"
              >
                <ArrowRight className="size-5" />
              </button>
            ) : (
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10">
                <Image src="/images/mascot/kiashi-support-airplane-v3.webp" alt="" width={80} height={53} className="h-auto w-[4.25rem]" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 id="support-assistant-title" className="truncate text-base font-black">{heading}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-white/80">
                <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgb(110_231_183/0.18)]" />
                راهنمای هوشمند و ثبت درخواست آنلاین
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
              aria-label="بستن دستیار پشتیبانی"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="support-assistant-scroll flex-1 overflow-y-auto bg-[#fffaf9] px-4 py-4">
          {lastQuestion && view !== "home" ? (
            <div className="mb-4 flex justify-start">
              <p className="max-w-[86%] rounded-2xl rounded-bl-md bg-primary px-4 py-2.5 text-xs leading-6 text-white">{lastQuestion}</p>
            </div>
          ) : null}

          {view === "home" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><MessageCircleMore className="size-4" /></span>
                <div className="rounded-2xl rounded-tr-md border border-primary/10 bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm font-black text-foreground">سلام 👋 چطور می‌تونم کمکت کنم؟</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">موضوعت را انتخاب کن یا پایین صفحه برایم بنویس.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5" aria-label="خدمات سریع پشتیبانی">
                <ActionButton icon={Search} title="پیگیری سفارش" description="وضعیت لحظه‌ای خرید" onClick={() => setView("tracking")} featured />
                <ActionButton icon={RotateCcw} title="کنسلی و استرداد" description="قوانین و مراحل" onClick={() => openGuide("refund")} />
                <ActionButton icon={CreditCard} title="مشکل پرداخت" description="کسر وجه و تراکنش" onClick={() => openGuide("payment")} />
                <ActionButton icon={FilePenLine} title="اصلاح اطلاعات" description="نام و مشخصات مسافر" onClick={() => openGuide("passenger")} />
                <ActionButton icon={TicketCheck} title="راهنمای خرید" description="از جست‌وجو تا پرداخت" onClick={() => openGuide("purchase")} />
                <ActionButton icon={Headphones} title="ثبت درخواست" description="ارتباط با پشتیبان" onClick={() => setView("ticket")} featured />
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-amber-200/80 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                رمز کارت، CVV2 و کد تأیید بانکی را برای هیچ‌کس ارسال نکن.
              </div>
            </div>
          ) : null}

          {view === "tracking" ? (
            <div className="space-y-4">
              <AssistantMessage>شماره سفارش یا کد پیگیری را همراه موبایل خریدار وارد کن.</AssistantMessage>
              <form onSubmit={trackOrder} className="rounded-2xl border bg-white p-4 shadow-sm">
                <label className="block text-xs font-bold text-foreground">
                  شناسه سفارش
                  <input
                    value={trackingIdentifier}
                    onChange={(event) => setTrackingIdentifier(event.target.value)}
                    dir="ltr"
                    autoComplete="off"
                    placeholder="KIA-2026-000001"
                    className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                <label className="mt-3 block text-xs font-bold text-foreground">
                  موبایل خریدار
                  <input
                    value={trackingMobile}
                    onChange={(event) => setTrackingMobile(event.target.value)}
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="09120000000"
                    className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white shadow-md shadow-primary/20 transition-colors hover:bg-[#d91d0c] disabled:cursor-wait disabled:opacity-60"
                >
                  {trackingLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
                  {trackingLoading ? "در حال بررسی..." : "بررسی وضعیت سفارش"}
                </button>
              </form>

              {trackingError ? <InlineAlert>{trackingError}</InlineAlert> : null}
              {trackingResult ? (
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm" role="status">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">سفارش {trackingResult.orderNumber}</p>
                      <h3 className="mt-1 font-black">{serviceLabel(trackingResult.serviceType)}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="size-3.5" /> پیدا شد
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <StatusItem label="وضعیت رزرو" value={viewForBookingStatus(trackingResult.bookingStatus).label} />
                    <StatusItem label="وضعیت پرداخت" value={trackingResult.paymentStatus === "paid" ? "پرداخت موفق" : trackingResult.paymentStatus} />
                    <StatusItem label="کد پیگیری" value={trackingResult.trackingCode} ltr />
                    <StatusItem label="مبلغ" value={formatPrice(trackingResult.total)} />
                  </dl>
                </div>
              ) : null}
              <Link href="/track-order" onClick={onClose} className="inline-flex w-full items-center justify-center gap-1 text-xs font-bold text-primary hover:underline">
                بازکردن صفحه کامل پیگیری <ChevronLeft className="size-4" />
              </Link>
            </div>
          ) : null}

          {view === "guide" ? (
            <div className="space-y-4">
              <AssistantMessage>{guide.description}</AssistantMessage>
              <article className="rounded-2xl border bg-white p-4 shadow-sm">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><GuideIcon className="size-5" /></span>
                <ol className="mt-4 space-y-3">
                  {guide.steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-xs leading-6 text-foreground">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">{(index + 1).toLocaleString("fa-IR")}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Link href={guide.href} onClick={onClose} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-4 text-xs font-extrabold text-primary transition-colors hover:bg-primary/10">
                  {guide.cta} <ChevronLeft className="size-4" />
                </Link>
              </article>
              <button type="button" onClick={() => setView("ticket")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-white">
                <Headphones className="size-4" /> هنوز کمک می‌خواهم
              </button>
            </div>
          ) : null}

          {view === "ticket" ? (
            <div className="space-y-4">
              {authLoading ? (
                <div className="grid min-h-40 place-items-center rounded-2xl border bg-white"><LoaderCircle className="size-6 animate-spin text-primary" /></div>
              ) : !user ? (
                <div className="rounded-2xl border bg-white p-5 text-center shadow-sm">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole className="size-5" /></span>
                  <h3 className="mt-4 font-black">برای ثبت و پیگیری درخواست وارد شو</h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">با ورود به حساب، پاسخ پشتیبانی و تاریخچهٔ گفتگو همیشه در دسترس می‌ماند.</p>
                  <Link href="/auth/login?returnTo=%2Faccount%2Fsupport" onClick={onClose} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold text-white">ورود با شماره موبایل</Link>
                  <Link href="/contact" onClick={onClose} className="mt-2 inline-flex min-h-10 items-center justify-center text-xs font-bold text-primary hover:underline">مشاهده راه‌های ارتباطی</Link>
                </div>
              ) : createdTicket ? (
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm" role="status">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-6" /></span>
                  <h3 className="mt-4 font-black">درخواستت با موفقیت ثبت شد</h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">پاسخ و تغییر وضعیت درخواست را از حساب کاربری دنبال کن.</p>
                  <Link href="/account/support" onClick={onClose} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl bg-primary px-4 text-sm font-extrabold text-white">مشاهده درخواست‌ها <ChevronLeft className="size-4" /></Link>
                  <button type="button" onClick={() => { setCreatedTicket(null); setTicketForm({ topic: "سفارش و رزرو", subject: "", order: "", body: "" }); }} className="mt-3 text-xs font-bold text-primary hover:underline">ثبت درخواست دیگر</button>
                </div>
              ) : (
                <>
                  <AssistantMessage>سلام {user.firstName || "دوست عزیز"}، جزئیات درخواستت را بنویس تا برای تیم پشتیبانی ثبت کنم.</AssistantMessage>
                  <form onSubmit={createTicket} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
                    <label className="block text-xs font-bold">موضوع درخواست
                      <select value={ticketForm.topic} onChange={(event) => setTicketForm({ ...ticketForm, topic: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                        <option>سفارش و رزرو</option><option>پرداخت</option><option>کنسلی و استرداد</option><option>اصلاح اطلاعات</option><option>سایر موارد</option>
                      </select>
                    </label>
                    <label className="block text-xs font-bold">عنوان کوتاه
                      <input value={ticketForm.subject} onChange={(event) => setTicketForm({ ...ticketForm, subject: event.target.value })} maxLength={90} placeholder="مثلاً بررسی پرداخت سفارش" className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                    </label>
                    <label className="block text-xs font-bold">شناسه سفارش <span className="font-normal text-muted-foreground">(اختیاری)</span>
                      <input value={ticketForm.order} onChange={(event) => setTicketForm({ ...ticketForm, order: event.target.value })} dir="ltr" maxLength={80} placeholder="KIA-2026-000001" className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                    </label>
                    <label className="block text-xs font-bold">شرح درخواست
                      <textarea value={ticketForm.body} onChange={(event) => setTicketForm({ ...ticketForm, body: event.target.value })} maxLength={1600} placeholder="چه اتفاقی افتاده و چه کمکی نیاز داری؟" className="mt-2 min-h-28 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-primary" />
                    </label>
                    {ticketError ? <InlineAlert>{ticketError}</InlineAlert> : null}
                    <button type="submit" disabled={ticketLoading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60">
                      {ticketLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                      {ticketLoading ? "در حال ثبت..." : "ثبت درخواست پشتیبانی"}
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : null}
        </div>

        {view === "home" ? (
          <form onSubmit={askAssistant} className="border-t bg-white p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
            <label className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 p-1.5 ps-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <span className="sr-only">موضوع پشتیبانی</span>
              <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={220} placeholder="موضوعت را اینجا بنویس..." className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <button type="submit" disabled={!question.trim()} aria-label="ارسال موضوع" className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-white transition disabled:opacity-35"><Send className="size-4" /></button>
            </label>
          </form>
        ) : null}
      </section>
    </>
  );
}

function ActionButton({ icon: Icon, title, description, onClick, featured = false }: { icon: LucideIcon; title: string; description: string; onClick: () => void; featured?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`group min-h-28 rounded-2xl border p-3 text-start transition-colors focus-visible:ring-2 focus-visible:ring-primary ${featured ? "border-primary/20 bg-primary/[0.045] hover:bg-primary/[0.08]" : "border-border bg-white hover:border-primary/20 hover:bg-primary/[0.025]"}`}>
      <span className={`grid size-9 place-items-center rounded-xl ${featured ? "bg-primary text-white" : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"}`}><Icon className="size-4" /></span>
      <strong className="mt-3 block text-xs font-black text-foreground">{title}</strong>
      <span className="mt-1 block text-[10px] leading-5 text-muted-foreground">{description}</span>
    </button>
  );
}

function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><CircleHelp className="size-4" /></span>
      <p className="rounded-2xl rounded-tr-md border border-primary/10 bg-white px-4 py-3 text-xs leading-6 text-foreground shadow-sm">{children}</p>
    </div>
  );
}

function InlineAlert({ children }: { children: ReactNode }) {
  return <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-6 text-red-800"><AlertCircle className="mt-1 size-4 shrink-0" />{children}</div>;
}

function StatusItem({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] text-muted-foreground">{label}</dt><dd dir={ltr ? "ltr" : undefined} className="mt-1 truncate font-bold text-foreground">{value}</dd></div>;
}
