"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Save } from "lucide-react";
import ProgramContentEditor from "./ProgramContentEditor";
import ProgramOperationsEditor, {
  type EditableDeparture,
  type EditablePackage,
} from "./ProgramOperationsEditor";
import { operationalStatusLabel } from "./status-presentation";

type Scope = "backoffice" | "merchant";
type Program = {
  id: string;
  title: string;
  slug: string;
  type: string;
  shortDescription?: string | null;
  description: string;
  origin: string;
  durationDays: number;
  durationNights: number;
  cancellationPolicy: string;
  visaNote?: string | null;
  guideNote?: string | null;
  futureSalePolicy?: boolean;
  publicationStatus: string;
  destinations: Array<{
    city: string;
    country: string;
    label: string;
    sortOrder?: number;
  }>;
  itinerary: Array<{
    dayNumber: number;
    title: string;
    description: string;
    accommodation?: string;
    meals?: string;
    transportNote?: string;
    activityNote?: string;
    sortOrder?: number;
  }>;
  contentItems: Array<{
    kind:
      | "INCLUDED_SERVICE"
      | "EXCLUDED_SERVICE"
      | "REQUIRED_DOCUMENT"
      | "TRAVELER_NOTE"
      | "PILGRIMAGE_NOTE"
      | "ACCOMMODATION_SPLIT";
    title: string;
    detail?: string | null;
    sortOrder?: number;
  }>;
  media: Array<{
    url: string;
    altText: string;
    isCover?: boolean;
    sortOrder?: number;
  }>;
  departures: EditableDeparture[];
  packages: EditablePackage[];
};

const today = () =>
  new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

export default function ProgramEditor({
  scope,
  id,
}: {
  scope: Scope;
  id: string;
}) {
  const base = `/api/${scope}/programs/${id}`;
  const [program, setProgram] = useState<Program | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [departure, setDeparture] = useState({
    startDate: today(),
    endDate: today(),
    transportType: "هواپیما",
    totalCapacity: 30,
  });
  const [pack, setPack] = useState({
    name: "پکیج استاندارد",
    hotelName: "هتل منتخب",
    roomType: "دو تخته",
    adultPrice: 20_000_000,
    childPrice: 15_000_000,
    departureId: "",
  });
  const load = useCallback(async () => {
    const response = await fetch(base, {
      credentials: "include",
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error?.message ?? "برنامه دریافت نشد");
    setProgram(body.program);
  }, [base]);
  useEffect(() => {
    void load().catch((reason) => setError(reason.message));
  }, [load]);
  const request = async (url: string, method: string, body: unknown) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error?.message ?? "عملیات انجام نشد");
      await load();
      setNotice("تغییرات با موفقیت ذخیره شد.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "خطای نامشخص");
    } finally {
      setBusy(false);
    }
  };
  if (!program)
    return (
      <div className="rounded-3xl border bg-white p-8 text-center">
        {error || "در حال دریافت برنامه…"}
      </div>
    );
  const blockers = [
    !program.title.trim() && "عنوان",
    !program.description.trim() && "شرح",
    !program.origin.trim() && "مبدأ",
    !program.destinations.length && "مقصد",
    !program.itinerary.length && "برنامه روزانه",
    !program.packages.some((item) => item.status === "ACTIVE") && "پکیج فعال",
    !program.cancellationPolicy.trim() && "قوانین لغو",
    !program.media.some((item) => item.isCover) && "تصویر کاور",
    !program.futureSalePolicy && !program.departures.length && "حرکت قابل فروش",
  ].filter(Boolean) as string[];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/${scope}/programs`}
            className="text-xs font-bold text-primary"
          >
            بازگشت به برنامه‌ها
          </Link>
          <h1 className="mt-2 text-2xl font-black">{program.title}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {operationalStatusLabel(program.publicationStatus)} · {program.slug}
          </p>
        </div>
      </div>
      {(error || notice) && (
        <p
          role="status"
          className={`rounded-2xl border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {error || notice}
        </p>
      )}
      <section
        className={`rounded-2xl border p-4 text-sm ${blockers.length ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
      >
        <b>
          {blockers.length
            ? `${blockers.length.toLocaleString("fa-IR")} مانع انتشار`
            : "اطلاعات لازم برای انتشار کامل است"}
        </b>
        {blockers.length > 0 && (
          <p className="mt-1 text-xs">موارد ناقص: {blockers.join("، ")}</p>
        )}
      </section>
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-black">اطلاعات و قوانین برنامه</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold">
            عنوان
            <input
              className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"
              value={program.title}
              onChange={(e) =>
                setProgram({ ...program, title: e.target.value })
              }
            />
          </label>
          <label className="text-xs font-bold">
            مبدأ
            <input
              className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"
              value={program.origin}
              onChange={(e) =>
                setProgram({ ...program, origin: e.target.value })
              }
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            خلاصه
            <textarea
              className="mt-1 min-h-24 w-full rounded-xl border p-3 font-normal"
              value={program.shortDescription ?? ""}
              onChange={(e) =>
                setProgram({ ...program, shortDescription: e.target.value })
              }
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            شرح
            <textarea
              className="mt-1 min-h-32 w-full rounded-xl border p-3 font-normal"
              value={program.description}
              onChange={(e) =>
                setProgram({ ...program, description: e.target.value })
              }
            />
          </label>
          <label className="text-xs font-bold">
            روز
            <input
              type="number"
              className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"
              value={program.durationDays}
              onChange={(e) =>
                setProgram({ ...program, durationDays: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-xs font-bold">
            شب
            <input
              type="number"
              className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"
              value={program.durationNights}
              onChange={(e) =>
                setProgram({
                  ...program,
                  durationNights: Number(e.target.value),
                })
              }
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            قوانین لغو
            <textarea
              className="mt-1 min-h-24 w-full rounded-xl border p-3 font-normal"
              value={program.cancellationPolicy}
              onChange={(e) =>
                setProgram({ ...program, cancellationPolicy: e.target.value })
              }
            />
          </label>
        </div>
        <button
          disabled={busy}
          onClick={() =>
            request(base, "PATCH", {
              title: program.title,
              shortDescription: program.shortDescription,
              description: program.description,
              origin: program.origin,
              durationDays: program.durationDays,
              durationNights: program.durationNights,
              cancellationPolicy: program.cancellationPolicy,
            })
          }
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50"
        >
          <Save className="size-4" />
          ذخیره اطلاعات
        </button>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-black">
            <CalendarPlus className="size-5 text-primary" />
            حرکت جدید
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              className="min-h-11 rounded-xl border px-3"
              value={departure.startDate}
              onChange={(e) =>
                setDeparture({ ...departure, startDate: e.target.value })
              }
            />
            <input
              type="date"
              className="min-h-11 rounded-xl border px-3"
              value={departure.endDate}
              onChange={(e) =>
                setDeparture({ ...departure, endDate: e.target.value })
              }
            />
            <input
              className="min-h-11 rounded-xl border px-3"
              value={departure.transportType}
              onChange={(e) =>
                setDeparture({ ...departure, transportType: e.target.value })
              }
            />
            <input
              type="number"
              className="min-h-11 rounded-xl border px-3"
              value={departure.totalCapacity}
              onChange={(e) =>
                setDeparture({
                  ...departure,
                  totalCapacity: Number(e.target.value),
                })
              }
            />
          </div>
          <button
            disabled={busy}
            onClick={() =>
              request(`${base}/departures`, "POST", {
                ...departure,
                startDate: `${departure.startDate}T00:00:00.000Z`,
                endDate: `${departure.endDate}T00:00:00.000Z`,
                saleStatus: "OPEN",
              })
            }
            className="mt-3 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white"
          >
            افزودن حرکت
          </button>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="font-black">پکیج قیمت</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="min-h-11 rounded-xl border px-3"
              value={pack.name}
              onChange={(e) => setPack({ ...pack, name: e.target.value })}
            />
            <select
              className="min-h-11 rounded-xl border px-3"
              value={pack.departureId}
              onChange={(e) =>
                setPack({ ...pack, departureId: e.target.value })
              }
            >
              <option value="">همه حرکت‌ها</option>
              {program.departures.map((d) => (
                <option key={d.id} value={d.id}>
                  {new Date(d.startDate).toLocaleDateString("fa-IR")}
                </option>
              ))}
            </select>
            <input
              className="min-h-11 rounded-xl border px-3"
              value={pack.hotelName}
              onChange={(e) => setPack({ ...pack, hotelName: e.target.value })}
            />
            <input
              className="min-h-11 rounded-xl border px-3"
              value={pack.roomType}
              onChange={(e) => setPack({ ...pack, roomType: e.target.value })}
            />
            <input
              type="number"
              className="min-h-11 rounded-xl border px-3"
              value={pack.adultPrice}
              onChange={(e) =>
                setPack({ ...pack, adultPrice: Number(e.target.value) })
              }
            />
            <input
              type="number"
              className="min-h-11 rounded-xl border px-3"
              value={pack.childPrice}
              onChange={(e) =>
                setPack({ ...pack, childPrice: Number(e.target.value) })
              }
            />
          </div>
          <button
            disabled={busy}
            onClick={() =>
              request(`${base}/packages`, "POST", {
                ...pack,
                departureId: pack.departureId || null,
                infantPrice: 0,
                singleSupplement: 0,
                status: "ACTIVE",
              })
            }
            className="mt-3 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white"
          >
            افزودن پکیج
          </button>
        </div>
      </section>
      <ProgramOperationsEditor
        scope={scope}
        programId={program.id}
        departures={program.departures}
        packages={program.packages}
        request={request}
        busy={busy}
      />
      <ProgramContentEditor
        program={program}
        setProgram={(value) => setProgram({ ...program, ...value })}
        save={(body) => void request(base, "PATCH", body)}
        busy={busy}
      />
    </div>
  );
}
