"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { operationalStatusLabel } from "./status-presentation";

type Scope = "backoffice" | "merchant";
type Registration = {
  orderNumber: string;
  trackingCode: string;
  total: number;
  currency: string;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  buyer: { name?: string; mobile?: string; email?: string };
  travelers: Array<Record<string, unknown>>;
  travelProgram?: { title?: string; type?: string };
  travelProgramDeparture?: { startDate?: string; endDate?: string };
  travelProgramPackage?: { name?: string; hotelName?: string; roomType?: string };
  payments: Array<{ status: string; reference?: string; amount: number }>;
  bookingAttempts: Array<{ status: string; provider: string; createdAt: string }>;
  registrationNotes: Array<{ note: string; createdAt: string; actorUser?: { firstName: string; lastName: string } }>;
};

function value(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (record[key]) return String(record[key]);
  return "—";
}

export default function RegistrationDetail({ scope, id }: { scope: Scope; id: string }) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${scope}/registrations/${id}`, { credentials: "include", cache: "no-store", signal: controller.signal })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? "ثبت‌نام دریافت نشد"); return body.registration as Registration; })
      .then(setRegistration)
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason.message); });
    return () => controller.abort();
  }, [id, scope]);
  if (!registration) return <div className="rounded-3xl border bg-white p-8 text-center">{error || "در حال دریافت ثبت‌نام…"}</div>;
  return <div className="space-y-5">
    <div><Link href={`/${scope}/registrations`} className="text-xs font-bold text-primary">بازگشت به ثبت‌نام‌ها</Link><h1 className="mt-2 text-2xl font-black">ثبت‌نام {registration.orderNumber}</h1><p className="mt-1 text-sm text-slate-500">کد پیگیری {registration.trackingCode}</p></div>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["برنامه",registration.travelProgram?.title],["پرداخت",operationalStatusLabel(registration.paymentStatus)],["رزرو",operationalStatusLabel(registration.bookingStatus)],["مبلغ",`${registration.total.toLocaleString("fa-IR")} تومان`]].map(([label,content])=><article key={label} className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-black">{content||"—"}</p></article>)}</section>
    <section className="rounded-3xl border bg-white p-5"><h2 className="font-black">خریدار و برنامه سفر</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">خریدار</dt><dd className="mt-1 font-bold">{registration.buyer.name||"—"}</dd></div><div><dt className="text-slate-500">راه ارتباطی</dt><dd className="mt-1 font-bold">{registration.buyer.mobile||registration.buyer.email||"—"}</dd></div><div><dt className="text-slate-500">حرکت</dt><dd className="mt-1 font-bold">{registration.travelProgramDeparture?.startDate?new Date(registration.travelProgramDeparture.startDate).toLocaleDateString("fa-IR"):"—"}</dd></div><div><dt className="text-slate-500">پکیج / اقامت</dt><dd className="mt-1 font-bold">{[registration.travelProgramPackage?.name,registration.travelProgramPackage?.hotelName,registration.travelProgramPackage?.roomType].filter(Boolean).join(" · ")||"—"}</dd></div></dl></section>
    <section className="rounded-3xl border bg-white p-5"><h2 className="font-black">مسافران ({registration.travelers.length.toLocaleString("fa-IR")})</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{registration.travelers.map((traveler,index)=><article key={index} className="rounded-2xl bg-slate-50 p-4 text-sm"><b>{value(traveler,"firstName","firstNameFa")} {value(traveler,"lastName","lastNameFa")}</b><p className="mt-2 text-xs text-slate-500">رده سنی: {operationalStatusLabel(value(traveler,"ageCategory","type"))} · کد ملی/گذرنامه: {value(traveler,"nationalId","passportNumber")}</p></article>)}</div></section>
    <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border bg-white p-5"><h2 className="font-black">سوابق رزرو و پرداخت</h2><div className="mt-3 space-y-2 text-sm">{registration.payments.map((item,index)=><p key={index} className="rounded-xl bg-slate-50 p-3">{operationalStatusLabel(item.status)} · {item.amount.toLocaleString("fa-IR")} تومان · {item.reference||"بدون مرجع"}</p>)}{registration.bookingAttempts.map((item,index)=><p key={`booking-${index}`} className="rounded-xl bg-slate-50 p-3">{item.provider} · {operationalStatusLabel(item.status)}</p>)}</div></div><div className="rounded-3xl border bg-white p-5"><h2 className="font-black">یادداشت‌های عملیاتی</h2><div className="mt-3 space-y-2 text-sm">{registration.registrationNotes.map((item,index)=><p key={index} className="rounded-xl bg-slate-50 p-3">{item.note}<span className="mt-1 block text-xs text-slate-500">{item.actorUser?`${item.actorUser.firstName} ${item.actorUser.lastName}`:"سیستم"}</span></p>)}{!registration.registrationNotes.length&&<p className="text-slate-500">یادداشتی ثبت نشده است.</p>}</div></div></section>
  </div>;
}
