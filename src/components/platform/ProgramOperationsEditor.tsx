"use client";

import Link from "next/link";
import { Copy, Users } from "lucide-react";
import { useState } from "react";
import { operationalStatusLabel } from "./status-presentation";

type Capacity = {
  totalCapacity: number;
  heldCapacity: number;
  booked: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  remaining: number;
};
export type EditableDeparture = {
  id: string;
  startDate: string;
  endDate: string;
  transportType: string;
  transportDetails?: string | null;
  totalCapacity: number;
  heldCapacity: number;
  saleStatus: string;
  salesStartAt?: string | null;
  salesEndAt?: string | null;
  notes?: string | null;
  capacity: Capacity;
};
export type EditablePackage = {
  id: string;
  departureId?: string | null;
  name: string;
  hotelName?: string | null;
  hotelStars?: number | null;
  roomType?: string | null;
  mealPlan?: string | null;
  transport?: string | null;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  singleSupplement: number;
  capacity?: number | null;
  status: string;
};
type Request = (url: string, method: string, body: unknown) => Promise<void>;
const dateValue = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";
const iso = (value: string) => (value ? `${value}T00:00:00.000Z` : null);
const input = "mt-1 min-h-10 w-full rounded-xl border px-3 font-normal";

function DepartureCard({
  scope,
  programId,
  row,
  request,
  busy,
}: {
  scope: string;
  programId: string;
  row: EditableDeparture;
  request: Request;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    ...row,
    startDate: dateValue(row.startDate),
    endDate: dateValue(row.endDate),
    salesStartAt: dateValue(row.salesStartAt),
    salesEndAt: dateValue(row.salesEndAt),
  });
  const invalid =
    form.heldCapacity > form.totalCapacity ||
    !form.startDate ||
    !form.endDate ||
    form.endDate < form.startDate;
  const save = (patch: Record<string, unknown> = {}) =>
    request(
      `/api/${scope}/programs/${programId}/departures/${row.id}`,
      "PATCH",
      {
        startDate: iso(form.startDate),
        endDate: iso(form.endDate),
        transportType: form.transportType,
        transportDetails: form.transportDetails || null,
        totalCapacity: Number(form.totalCapacity),
        heldCapacity: Number(form.heldCapacity),
        salesStartAt: iso(form.salesStartAt),
        salesEndAt: iso(form.salesEndAt),
        notes: form.notes || null,
        ...patch,
      },
    );
  return (
    <article className="rounded-2xl border p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-bold">
          شروع
          <input
            type="date"
            className={input}
            value={form.startDate}
            onChange={(event) =>
              setForm({ ...form, startDate: event.target.value })
            }
          />
        </label>
        <label className="text-xs font-bold">
          پایان
          <input
            type="date"
            className={input}
            value={form.endDate}
            onChange={(event) =>
              setForm({ ...form, endDate: event.target.value })
            }
          />
        </label>
        <label className="text-xs font-bold">
          نوع حمل‌ونقل
          <input
            className={input}
            value={form.transportType}
            onChange={(event) =>
              setForm({ ...form, transportType: event.target.value })
            }
          />
        </label>
        <label className="text-xs font-bold">
          جزئیات حمل‌ونقل
          <input
            className={input}
            value={form.transportDetails ?? ""}
            onChange={(event) =>
              setForm({ ...form, transportDetails: event.target.value })
            }
          />
        </label>
        <label className="text-xs font-bold">
          ظرفیت کل
          <input
            type="number"
            min={0}
            className={input}
            value={form.totalCapacity}
            onChange={(event) =>
              setForm({ ...form, totalCapacity: Number(event.target.value) })
            }
          />
        </label>
        <label className="text-xs font-bold">
          ظرفیت نگه‌داشته
          <input
            type="number"
            min={0}
            className={input}
            value={form.heldCapacity}
            onChange={(event) =>
              setForm({ ...form, heldCapacity: Number(event.target.value) })
            }
          />
        </label>
        <label className="text-xs font-bold">
          شروع فروش
          <input
            type="date"
            className={input}
            value={form.salesStartAt}
            onChange={(event) =>
              setForm({ ...form, salesStartAt: event.target.value })
            }
          />
        </label>
        <label className="text-xs font-bold">
          پایان فروش
          <input
            type="date"
            className={input}
            value={form.salesEndAt}
            onChange={(event) =>
              setForm({ ...form, salesEndAt: event.target.value })
            }
          />
        </label>
        <label className="text-xs font-bold sm:col-span-2 lg:col-span-4">
          یادداشت
          <input
            className={input}
            value={form.notes ?? ""}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
          />
        </label>
      </div>
      {invalid && (
        <p className="mt-2 text-xs text-red-700">
          تاریخ‌ها و ظرفیت نگه‌داشته را اصلاح کنید.
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {[
          ["کل", row.capacity.totalCapacity],
          ["نگه‌داشته", row.capacity.heldCapacity],
          ["رزرو", row.capacity.booked],
          ["تأیید", row.capacity.confirmed],
          ["انتظار", row.capacity.pending],
          ["لغو", row.capacity.cancelled],
          ["باقی", row.capacity.remaining],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl bg-slate-50 p-2 text-center"
          >
            <small className="block text-slate-500">{label}</small>
            <b>{Number(value).toLocaleString("fa-IR")}</b>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={busy || invalid}
          onClick={() => void save()}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          ذخیره حرکت
        </button>
        {row.saleStatus === "CLOSED" ? (
          <button
            disabled={busy}
            onClick={() => void save({ saleStatus: "OPEN" })}
            className="rounded-lg border px-3 py-2 text-xs font-bold"
          >
            بازکردن فروش
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => void save({ saleStatus: "CLOSED" })}
            className="rounded-lg border px-3 py-2 text-xs font-bold"
          >
            بستن فروش
          </button>
        )}
        <button
          disabled={busy || row.saleStatus === "CANCELLED"}
          onClick={() =>
            window.confirm(
              "این حرکت لغو شود؟ ثبت‌نام‌ها باید جداگانه پیگیری شوند.",
            ) && void save({ saleStatus: "CANCELLED" })
          }
          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40"
        >
          لغو حرکت
        </button>
        <button
          disabled={busy}
          onClick={() =>
            void request(
              `/api/${scope}/programs/${programId}/departures/${row.id}/duplicate`,
              "POST",
              {},
            )
          }
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"
        >
          <Copy className="size-3.5" />
          کپی
        </button>
        <Link
          href={`/${scope}/programs/${programId}/departures/${row.id}/participants`}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"
        >
          <Users className="size-3.5" />
          مسافران
        </Link>
        <a
          href={`/api/${scope}/programs/${programId}/departures/${row.id}/participants.csv`}
          className="rounded-lg border px-3 py-2 text-xs font-bold"
        >
          CSV
        </a>
        <span className="self-center text-xs font-bold text-slate-500">
          {operationalStatusLabel(row.saleStatus)}
        </span>
      </div>
    </article>
  );
}

function PackageCard({
  scope,
  programId,
  row,
  departures,
  request,
  busy,
}: {
  scope: string;
  programId: string;
  row: EditablePackage;
  departures: EditableDeparture[];
  request: Request;
  busy: boolean;
}) {
  const [form, setForm] = useState({ ...row, capacity: row.capacity ?? "" });
  const set = (key: string, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <article className="rounded-2xl border p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-bold">
          نام پکیج
          <input
            className={input}
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          حرکت
          <select
            className={`${input} bg-white`}
            value={form.departureId ?? ""}
            onChange={(event) => set("departureId", event.target.value || null)}
          >
            <option value="">همه حرکت‌ها</option>
            {departures.map((item) => (
              <option key={item.id} value={item.id}>
                {new Date(item.startDate).toLocaleDateString("fa-IR")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          هتل
          <input
            className={input}
            value={form.hotelName ?? ""}
            onChange={(event) => set("hotelName", event.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          ستاره هتل
          <input
            type="number"
            min={1}
            max={5}
            className={input}
            value={form.hotelStars ?? ""}
            onChange={(event) =>
              set(
                "hotelStars",
                event.target.value ? Number(event.target.value) : null,
              )
            }
          />
        </label>
        <label className="text-xs font-bold">
          نوع اتاق
          <input
            className={input}
            value={form.roomType ?? ""}
            onChange={(event) => set("roomType", event.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          وعده غذایی
          <input
            className={input}
            value={form.mealPlan ?? ""}
            onChange={(event) => set("mealPlan", event.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          حمل‌ونقل
          <input
            className={input}
            value={form.transport ?? ""}
            onChange={(event) => set("transport", event.target.value)}
          />
        </label>
        <label className="text-xs font-bold">
          ظرفیت پکیج
          <input
            type="number"
            min={0}
            className={input}
            value={form.capacity}
            onChange={(event) =>
              set(
                "capacity",
                event.target.value ? Number(event.target.value) : "",
              )
            }
          />
        </label>
        {[
          ["قیمت بزرگسال", "adultPrice"],
          ["قیمت کودک", "childPrice"],
          ["قیمت نوزاد", "infantPrice"],
          ["اضافه‌نرخ یک‌تخته", "singleSupplement"],
        ].map(([label, key]) => (
          <label key={key} className="text-xs font-bold">
            {label} (تومان)
            <input
              type="number"
              min={0}
              className={input}
              value={Number(form[key as keyof typeof form] ?? 0)}
              onChange={(event) => set(key, Number(event.target.value))}
            />
          </label>
        ))}
        <label className="text-xs font-bold">
          وضعیت
          <select
            className={`${input} bg-white`}
            value={form.status}
            onChange={(event) => set("status", event.target.value)}
          >
            <option value="ACTIVE">فعال</option>
            <option value="INACTIVE">غیرفعال</option>
          </select>
        </label>
      </div>
      <button
        disabled={busy}
        onClick={() =>
          void request(
            `/api/${scope}/programs/${programId}/packages/${row.id}`,
            "PATCH",
            {
              ...form,
              capacity: form.capacity === "" ? null : Number(form.capacity),
            },
          )
        }
        className="mt-4 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
      >
        ذخیره پکیج
      </button>
    </article>
  );
}

export default function ProgramOperationsEditor({
  scope,
  programId,
  departures,
  packages,
  request,
  busy,
}: {
  scope: "backoffice" | "merchant";
  programId: string;
  departures: EditableDeparture[];
  packages: EditablePackage[];
  request: Request;
  busy: boolean;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">ویرایش حرکت‌ها</h2>
        <div className="mt-4 space-y-4">
          {departures.map((row) => (
            <DepartureCard
              key={row.id}
              scope={scope}
              programId={programId}
              row={row}
              request={request}
              busy={busy}
            />
          ))}
          {!departures.length && (
            <p className="py-8 text-center text-sm text-slate-500">
              حرکتی ثبت نشده است.
            </p>
          )}
        </div>
      </section>
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">ویرایش پکیج‌ها</h2>
        <div className="mt-4 space-y-4">
          {packages.map((row) => (
            <PackageCard
              key={row.id}
              scope={scope}
              programId={programId}
              row={row}
              departures={departures}
              request={request}
              busy={busy}
            />
          ))}
          {!packages.length && (
            <p className="py-8 text-center text-sm text-slate-500">
              پکیجی ثبت نشده است.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
