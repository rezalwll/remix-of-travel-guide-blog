"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Database, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { operationalStatusLabel } from "./status-presentation";

type Column = { key: string; label: string };
type Props = {
  endpoint: string;
  title: string;
  description: string;
  dataKey?: string;
  columns?: Column[];
  mode?: "list" | "summary" | "profile";
  detailBasePath?: string;
};

const labels: Record<string, string> = {
  orders: "کل سفارش‌ها",
  completedOrders: "سفارش تکمیل‌شده",
  grossAmount: "ارزش ناخالص رزرو",
  paymentSucceeded: "پرداخت موفق",
  paymentFailed: "پرداخت ناموفق",
  bookingSucceeded: "رزرو موفق",
  bookingFailed: "رزرو ناموفق",
  refunds: "تعداد استرداد",
  refundAmount: "مبلغ استرداد",
  manualReview: "بررسی دستی",
  commissionAmount: "کمیسیون",
  merchantPayable: "سهم پذیرنده",
  payableAmount: "قابل پرداخت",
  adjustmentAmount: "تعدیلات",
};

function nested(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, value);
}

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return value.toLocaleString("fa-IR");
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  if (Array.isArray(value)) return value.map((item) => display(item)).join("، ");
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return display(object.name ?? object.title ?? object.code ?? object.status ?? JSON.stringify(object));
  }
  return operationalStatusLabel(value);
}

export default function PlatformResourceView({ endpoint, title, description, dataKey, columns = [], mode = "list", detailBasePath }: Props) {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const [page, setPage] = useState(1);

  const requestEndpoint = (() => {
    const separator = endpoint.includes("?") ? "&" : "?";
    return `${endpoint}${separator}page=${page}&perPage=20`;
  })();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    fetch(requestEndpoint, { credentials: "include", cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) { window.location.replace(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`); return null; }
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((body as { error?: { message?: string } }).error?.message ?? "دریافت اطلاعات ناموفق بود");
        return body as Record<string, unknown>;
      })
      .then((body) => { if (body) setPayload(body); })
      .catch((requestError) => { if (requestError instanceof Error && requestError.name !== "AbortError") setError(requestError.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [requestEndpoint, nonce]);

  const content = dataKey ? nested(payload, dataKey) : payload;
  const rows = Array.isArray(content) ? content : [];
  const totals = (nested(payload, "report.totals") ?? nested(payload, "finance.settlements") ?? {}) as Record<string, unknown>;
  const pagination = nested(payload, "pagination") as { page?: number; perPage?: number; total?: number; totalPages?: number } | undefined;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil((pagination?.total ?? rows.length) / (pagination?.perPage ?? 20)));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div><h2 className="text-xl font-black text-slate-900">{title}</h2><p className="mt-1 text-sm leading-7 text-slate-500">{description}</p></div>
        <button type="button" onClick={() => setNonce((value) => value + 1)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:border-red-200 hover:text-primary"><RefreshCcw className="size-4" />به‌روزرسانی</button>
      </div>

      {loading && <div className="mt-8 flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500"><span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />در حال دریافت داده…</div>}
      {!loading && error && <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">نمایش اطلاعات ممکن نشد</p><p className="mt-1">{error}</p></div></div>}

      {!loading && !error && mode === "summary" && <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(totals).map(([key, value]) => <article key={key} className="rounded-2xl border border-red-100 bg-red-50/50 p-4"><p className="text-xs font-bold text-slate-500">{labels[key] ?? key}</p><p className="mt-2 text-xl font-black text-slate-900">{display(value)}</p></article>)}</div>}

      {!loading && !error && mode === "profile" && content && typeof content === "object" && <dl className="mt-6 grid gap-3 sm:grid-cols-2">{Object.entries(content as Record<string, unknown>).filter(([, value]) => typeof value !== "object" || value === null).map(([key, value]) => <div key={key} className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">{labels[key] ?? key}</dt><dd className="mt-2 text-sm font-bold text-slate-900">{display(value)}</dd></div>)}</dl>}

      {!loading && !error && mode === "list" && rows.length === 0 && <div className="mt-8 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500"><Database className="mb-3 size-8 text-slate-300" />رکوردی در این بازه وجود ندارد.</div>}
      {!loading && !error && mode === "list" && rows.length > 0 && <><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[720px] border-separate border-spacing-0 text-right text-sm"><thead><tr>{columns.map((column) => <th key={column.key} className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black text-slate-600 first:rounded-tr-xl last:rounded-tl-xl">{column.label}</th>)}{detailBasePath&&<th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black text-slate-600">عملیات</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(nested(row, "id") ?? index)} className="hover:bg-red-50/30">{columns.map((column) => <td key={column.key} className="border-b border-slate-100 px-4 py-3 text-slate-700">{display(nested(row, column.key))}</td>)}{detailBasePath&&<td className="border-b border-slate-100 px-4 py-3"><Link href={`${detailBasePath}/${String(nested(row,"id"))}`} className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-primary">مشاهده جزئیات</Link></td>}</tr>)}</tbody></table></div>{totalPages>1&&<nav aria-label="صفحه‌بندی" className="mt-5 flex items-center justify-between gap-3 border-t pt-4"><button type="button" disabled={page<=1} onClick={()=>setPage(value=>Math.max(1,value-1))} className="rounded-lg border px-4 py-2 text-xs font-bold disabled:opacity-40">صفحه قبل</button><span className="text-xs text-slate-500">صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")} · {(pagination?.total??rows.length).toLocaleString("fa-IR")} رکورد</span><button type="button" disabled={page>=totalPages} onClick={()=>setPage(value=>Math.min(totalPages,value+1))} className="rounded-lg border px-4 py-2 text-xs font-bold disabled:opacity-40">صفحه بعد</button></nav>}</>}
    </div>
  );
}
