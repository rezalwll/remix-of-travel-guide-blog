"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { operationalStatusLabel } from "./status-presentation";

type Scope = "backoffice" | "merchant";
type Payload = {
  program: { title: string };
  departure: { startDate: string; endDate: string };
  summary: {
    totalCapacity: number;
    heldCapacity: number;
    booked: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    remaining: number;
  };
  rows: Array<Record<string, unknown>>;
};

export default function ParticipantList({
  scope,
  programId,
  departureId,
}: {
  scope: Scope;
  programId: string;
  departureId: string;
}) {
  const endpoint = `/api/${scope}/programs/${programId}/departures/${departureId}/participants`;
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(endpoint, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error?.message ?? "فهرست دریافت نشد");
        return body as Payload;
      })
      .then(setPayload)
      .catch((reason) => setError(reason.message));
  }, [endpoint]);
  if (!payload)
    return (
      <div className="rounded-3xl border bg-white p-8 text-center">
        {error || "در حال دریافت مسافران…"}
      </div>
    );
  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${scope}/programs/${programId}`}
          className="text-xs font-bold text-primary"
        >
          بازگشت به برنامه
        </Link>
        <h1 className="mt-2 text-2xl font-black">
          مسافران {payload.program.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          حرکت{" "}
          {new Date(payload.departure.startDate).toLocaleDateString("fa-IR")}
        </p>
      </div>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {[
          ["ظرفیت کل", payload.summary.totalCapacity],
          ["نگه‌داشته", payload.summary.heldCapacity],
          ["رزروشده", payload.summary.booked],
          ["تأییدشده", payload.summary.confirmed],
          ["در انتظار", payload.summary.pending],
          ["لغوشده", payload.summary.cancelled],
          ["باقی‌مانده", payload.summary.remaining],
        ].map(([label, count]) => (
          <article
            key={String(label)}
            className="rounded-2xl border bg-white p-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <b className="mt-2 block text-xl">
              {Number(count).toLocaleString("fa-IR")}
            </b>
          </article>
        ))}
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-black">فهرست قابل پذیرش</h2>
          <a
            href={`${endpoint}.csv`}
            className="rounded-lg border px-3 py-2 text-xs font-bold"
          >
            دریافت CSV
          </a>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead>
              <tr>
                {[
                  "سفارش",
                  "مسافر",
                  "رده سنی",
                  "موبایل",
                  "پکیج",
                  "اتاق",
                  "پرداخت",
                  "رزرو",
                ].map((label) => (
                  <th key={label} className="border-b bg-slate-50 p-3 text-xs">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.rows.map((row, index) => (
                <tr key={index}>
                  {[
                    "orderNumber",
                    "traveler",
                    "ageCategory",
                    "mobile",
                    "package",
                    "roomType",
                    "paymentStatus",
                    "bookingStatus",
                  ].map((key) => (
                    <td key={key} className="border-b p-3">
                      {key.endsWith("Status")
                        ? operationalStatusLabel(row[key])
                        : String(row[key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
