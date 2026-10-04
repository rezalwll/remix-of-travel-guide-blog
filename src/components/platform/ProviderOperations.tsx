"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, DatabaseZap, RefreshCcw, Search } from "lucide-react";

export const providerServiceLabels = {
  flight: "پرواز",
  train: "قطار",
  bus: "اتوبوس",
  insurance: "بیمه",
  cip: "CIP",
  transfer: "ترانسفر",
} as const;

export type ProviderService = keyof typeof providerServiceLabels;

type Operation = {
  id: string;
  orderNumber: string;
  trackingCode: string;
  context: Record<string, unknown>;
  total: number;
  paymentStatus: string;
  bookingStatus: string;
  provider: string | null;
  externalReference: string | null;
  relevantDate: string | null;
  manualReview: boolean;
  reconciliationState: string;
  latestAttempt: { status: string; error?: string | null; updatedAt: string } | null;
  attemptCount: number;
  refund: { status: string; amount: number } | null;
};

const fa = (value: unknown) => value == null || value === "" ? "—" : typeof value === "number" ? value.toLocaleString("fa-IR") : String(value);
const date = (value: string | null) => value ? new Date(value).toLocaleString("fa-IR") : "—";
const contextText = (row: Operation) => [row.context.route, row.context.flightNumber, row.context.airport, row.context.plan, row.context.package, row.context.vehicleType].filter(Boolean).map(fa).join(" · ") || fa(row.context.title);

export default function ProviderOperations({ service }: { service: ProviderService }) {
  const [filters, setFilters] = useState({ provider: "", route: "", bookingStatus: "", paymentStatus: "", manualReview: "" });
  const [rows, setRows] = useState<Operation[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    const query = new URLSearchParams({ preset: "30d", ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) });
    try {
      const response = await fetch(`/api/backoffice/operations/${service}?${query}`, { credentials: "include", cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "دریافت عملیات ممکن نشد");
      setRows(body.operations ?? []);
      setTotal(body.pagination?.total ?? 0);
      setState("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطای نامشخص");
      setState("error");
    }
  }, [filters, service]);

  useEffect(() => { void load(); }, [load]);

  return <div className="space-y-5">
    <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary"><DatabaseZap className="size-4" />منبع موجودی: تأمین‌کننده</div>
          <h1 className="mt-2 text-2xl font-black">عملیات {providerServiceLabels[service]}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">پایش سفارش، تلاش رزرو، مرجع خارجی، استرداد و تطبیق؛ بدون ایجاد موجودی یا برنامه زمانی دستی.</p>
        </div>
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{total.toLocaleString("fa-IR")} عملیات در بازه</div>
      </div>
      <nav aria-label="نوع سرویس" className="mt-5 flex gap-2 overflow-x-auto border-t pt-4">
        {Object.entries(providerServiceLabels).map(([key, label]) => <Link key={key} href={`/backoffice/operations/${key}`} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold ${key === service ? "bg-primary text-white" : "bg-slate-50 text-slate-700"}`}>{label}</Link>)}
      </nav>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <input aria-label="تأمین‌کننده" value={filters.provider} onChange={(event) => setFilters({ ...filters, provider: event.target.value })} className="min-h-11 rounded-xl border px-3 text-sm" placeholder="تأمین‌کننده" />
        <input aria-label="مسیر" value={filters.route} onChange={(event) => setFilters({ ...filters, route: event.target.value })} className="min-h-11 rounded-xl border px-3 text-sm" placeholder="مسیر یا عنوان" />
        <input aria-label="وضعیت رزرو" value={filters.bookingStatus} onChange={(event) => setFilters({ ...filters, bookingStatus: event.target.value })} className="min-h-11 rounded-xl border px-3 text-sm" placeholder="وضعیت رزرو" />
        <input aria-label="وضعیت پرداخت" value={filters.paymentStatus} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value })} className="min-h-11 rounded-xl border px-3 text-sm" placeholder="وضعیت پرداخت" />
        <select aria-label="بازبینی دستی" value={filters.manualReview} onChange={(event) => setFilters({ ...filters, manualReview: event.target.value })} className="min-h-11 rounded-xl border bg-white px-3 text-sm"><option value="">همه موارد</option><option value="true">فقط بازبینی دستی</option></select>
        <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"><Search className="size-4" />اعمال فیلتر</button>
      </div>
    </section>

    {state === "error" && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</div>}
    <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600"><tr>{["سفارش", "جزئیات سرویس", "تأمین‌کننده", "آخرین تلاش", "رزرو / پرداخت", "مرجع خارجی", "استرداد", "تطبیق", "تاریخ خدمت"].map((title) => <th key={title} className="p-4">{title}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.id} className="border-t align-top hover:bg-red-50/30">
              <td className="p-4"><Link href={`/backoffice/orders/${row.id}`} className="font-black text-primary">{row.orderNumber}</Link><small className="mt-1 block text-slate-500">{row.trackingCode}</small></td>
              <td className="max-w-64 p-4 font-bold">{contextText(row)}<small className="mt-1 block font-normal text-slate-500">{fa(row.context.travelerCount)} مسافر</small></td>
              <td className="p-4">{fa(row.provider)}</td>
              <td className="p-4">{fa(row.latestAttempt?.status)}<small className="mt-1 block text-slate-500">{row.attemptCount.toLocaleString("fa-IR")} تلاش</small>{row.latestAttempt?.error && <small className="mt-1 block text-red-700">{row.latestAttempt.error}</small>}</td>
              <td className="p-4"><b>{row.bookingStatus}</b><small className="mt-1 block text-slate-500">{row.paymentStatus}</small>{row.manualReview && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-900"><AlertTriangle className="size-3" />بازبینی دستی</span>}</td>
              <td className="p-4 font-mono text-xs">{fa(row.externalReference)}</td>
              <td className="p-4">{row.refund ? <><b>{row.refund.status}</b><small className="block">{fa(row.refund.amount)} تومان</small></> : "—"}</td>
              <td className="p-4"><span className="inline-flex items-center gap-1"><RefreshCcw className="size-3" />{row.reconciliationState}</span></td>
              <td className="p-4">{date(row.relevantDate)}</td>
            </tr>)}
            {state === "ready" && rows.length === 0 && <tr><td colSpan={9} className="p-12 text-center text-slate-500">برای این بازه و فیلتر، عملیات ثبت‌شده‌ای وجود ندارد.</td></tr>}
            {state === "loading" && <tr><td colSpan={9} className="p-12 text-center text-slate-500">در حال دریافت عملیات…</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}

