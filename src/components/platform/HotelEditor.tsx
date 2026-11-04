"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
type Scope = "backoffice" | "merchant";
type RateDetail = {
  id: string;
  title: string;
  baseRate: number;
  status: string;
};
type RoomDetail = {
  id: string;
  name: string;
  capacity: number;
  bedType: string;
  status: string;
  ratePlans: RateDetail[];
};
type ManagedProperty = {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  publicationStatus: string;
  amenities?: string[];
  images?: string[];
  policies?: Record<string, string>;
  roomTypes: RoomDetail[];
};

export function HotelEditor({ scope, id }: { scope: Scope; id: string }) {
  const base = `/api/${scope}/hotels/${id}`;
  const [property, setProperty] = useState<ManagedProperty | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [room, setRoom] = useState({
    name: "اتاق استاندارد",
    description: "",
    capacity: 2,
    bedType: "یک تخت دو نفره",
    sizeSqm: 28,
  });
  const [rate, setRate] = useState({
    roomId: "",
    title: "همراه صبحانه",
    mealPlan: "صبحانه",
    refundable: true,
    cancellationPolicy: "لغو تا ۴۸ ساعت پیش از ورود بدون جریمه",
    baseRate: 5_000_000,
    taxesIncluded: true,
  });
  const [inventory, setInventory] = useState({
    rateId: "",
    from: new Date().toISOString().slice(0, 10),
    to: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    availableRooms: 8,
    priceOverride: "",
    closed: false,
    minimumStay: 1,
  });
  const load = useCallback(
    () =>
      fetch(base, { credentials: "include", cache: "no-store" })
        .then(async (r) => {
          const b = await r.json();
          if (!r.ok) throw new Error(b.error?.message);
          setProperty(b.property as ManagedProperty);
        })
        .catch((e) => setError(e.message)),
    [base],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const send = async (url: string, method: string, body: unknown) => {
    setError("");
    setNotice("");
    const r = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const b = await r.json().catch(() => ({}));
    if (!r.ok) return setError(b.error?.message ?? "عملیات ناموفق بود");
    setNotice("تغییرات ذخیره شد.");
    void load();
  };
  if (!property)
    return (
      <div className="rounded-3xl border bg-white p-8 text-center">
        {error || "در حال دریافت…"}
      </div>
    );
  const rates = property.roomTypes.flatMap((r) =>
    r.ratePlans.map((p) => ({ ...p, roomName: r.name })),
  );
  const statuses =
    scope === "merchant"
      ? ["DRAFT", "SUBMITTED", "PAUSED", "ARCHIVED"]
      : [
          "DRAFT",
          "SUBMITTED",
          "NEEDS_CHANGES",
          "REJECTED",
          "PUBLISHED",
          "PAUSED",
          "ARCHIVED",
        ];
  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${scope}/hotels`}
          className="text-xs font-bold text-primary"
        >
          بازگشت به هتل‌ها
        </Link>
        <h1 className="mt-2 text-2xl font-black">{property.name}</h1>
      </div>
      {(error || notice) && (
        <p
          className={`rounded-2xl p-4 text-sm ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}
        >
          {error || notice}
        </p>
      )}
      <section className="rounded-3xl border bg-white p-5">
        <h2 className="font-black">پروفایل، نشانی و انتشار</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="min-h-11 rounded-xl border px-3"
            value={property.name}
            onChange={(e) => setProperty({ ...property, name: e.target.value })}
          />
          <input
            className="min-h-11 rounded-xl border px-3"
            value={property.city}
            onChange={(e) => setProperty({ ...property, city: e.target.value })}
          />
          <input
            className="min-h-11 rounded-xl border px-3 sm:col-span-2"
            value={property.address}
            onChange={(e) =>
              setProperty({ ...property, address: e.target.value })
            }
          />
          <textarea
            className="min-h-28 rounded-xl border p-3 sm:col-span-2"
            value={property.description}
            onChange={(e) =>
              setProperty({ ...property, description: e.target.value })
            }
          />
          <input
            className="min-h-11 rounded-xl border px-3"
            placeholder="امکانات، با ویرگول"
            value={(property.amenities ?? []).join("، ")}
            onChange={(e) =>
              setProperty({
                ...property,
                amenities: e.target.value
                  .split(/[،,]/)
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
          <input
            className="min-h-11 rounded-xl border px-3"
            placeholder="نشانی تصاویر، با ویرگول"
            value={(property.images ?? []).join(", ")}
            onChange={(e) =>
              setProperty({
                ...property,
                images: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
          <input
            type="time"
            className="min-h-11 rounded-xl border px-3"
            value={property.checkInTime}
            onChange={(e) =>
              setProperty({ ...property, checkInTime: e.target.value })
            }
          />
          <input
            type="time"
            className="min-h-11 rounded-xl border px-3"
            value={property.checkOutTime}
            onChange={(e) =>
              setProperty({ ...property, checkOutTime: e.target.value })
            }
          />
          <select
            className="min-h-11 rounded-xl border px-3"
            value={property.publicationStatus}
            onChange={(e) =>
              setProperty({ ...property, publicationStatus: e.target.value })
            }
          >
            {statuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() =>
            send(base, "PATCH", {
              name: property.name,
              city: property.city,
              address: property.address,
              description: property.description,
              amenities: property.amenities,
              images: property.images,
              checkInTime: property.checkInTime,
              checkOutTime: property.checkOutTime,
              publicationStatus: property.publicationStatus,
            })
          }
          className="mt-4 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white"
        >
          ذخیره هتل
        </button>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5">
          <h2 className="font-black">افزودن نوع اتاق</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(room).map(([k, v]) => (
              <input
                key={k}
                type={typeof v === "number" ? "number" : "text"}
                className="min-h-11 rounded-xl border px-3"
                value={v}
                onChange={(e) =>
                  setRoom({
                    ...room,
                    [k]:
                      typeof v === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  })
                }
              />
            ))}
          </div>
          <button
            onClick={() => send(`${base}/rooms`, "POST", room)}
            className="mt-3 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white"
          >
            ثبت اتاق
          </button>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <h2 className="font-black">افزودن نرخ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              className="min-h-11 rounded-xl border px-3"
              value={rate.roomId}
              onChange={(e) => setRate({ ...rate, roomId: e.target.value })}
            >
              <option value="">انتخاب اتاق</option>
              {property.roomTypes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              className="min-h-11 rounded-xl border px-3"
              value={rate.title}
              onChange={(e) => setRate({ ...rate, title: e.target.value })}
            />
            <input
              className="min-h-11 rounded-xl border px-3"
              value={rate.mealPlan}
              onChange={(e) => setRate({ ...rate, mealPlan: e.target.value })}
            />
            <input
              type="number"
              className="min-h-11 rounded-xl border px-3"
              value={rate.baseRate}
              onChange={(e) =>
                setRate({ ...rate, baseRate: Number(e.target.value) })
              }
            />
            <textarea
              className="min-h-20 rounded-xl border p-3 sm:col-span-2"
              value={rate.cancellationPolicy}
              onChange={(e) =>
                setRate({ ...rate, cancellationPolicy: e.target.value })
              }
            />
          </div>
          <button
            disabled={!rate.roomId}
            onClick={() => {
              const { roomId, ...body } = rate;
              void send(`${base}/rooms/${roomId}/rates`, "POST", body);
            }}
            className="mt-3 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white disabled:opacity-40"
          >
            ثبت نرخ
          </button>
        </div>
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <h2 className="font-black">تقویم ساده قیمت و موجودی</h2>
        <p className="mt-1 text-xs text-slate-500">
          فقط هتل DIRECT/DEMO؛ بازه و روزهای انتخابی به‌صورت bulk ذخیره می‌شوند.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className="min-h-11 rounded-xl border px-3"
            value={inventory.rateId}
            onChange={(e) =>
              setInventory({ ...inventory, rateId: e.target.value })
            }
          >
            <option value="">انتخاب نرخ</option>
            {rates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomName} · {r.title}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="min-h-11 rounded-xl border px-3"
            value={inventory.from}
            onChange={(e) =>
              setInventory({ ...inventory, from: e.target.value })
            }
          />
          <input
            type="date"
            className="min-h-11 rounded-xl border px-3"
            value={inventory.to}
            onChange={(e) => setInventory({ ...inventory, to: e.target.value })}
          />
          <input
            type="number"
            className="min-h-11 rounded-xl border px-3"
            value={inventory.availableRooms}
            onChange={(e) =>
              setInventory({
                ...inventory,
                availableRooms: Number(e.target.value),
              })
            }
          />
          <input
            type="number"
            className="min-h-11 rounded-xl border px-3"
            placeholder="قیمت جایگزین (اختیاری)"
            value={inventory.priceOverride}
            onChange={(e) =>
              setInventory({ ...inventory, priceOverride: e.target.value })
            }
          />
          <input
            type="number"
            className="min-h-11 rounded-xl border px-3"
            value={inventory.minimumStay}
            onChange={(e) =>
              setInventory({
                ...inventory,
                minimumStay: Number(e.target.value),
              })
            }
          />
          <label className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm">
            <input
              type="checkbox"
              checked={inventory.closed}
              onChange={(e) =>
                setInventory({ ...inventory, closed: e.target.checked })
              }
            />
            بستن فروش
          </label>
        </div>
        <button
          disabled={!inventory.rateId}
          onClick={() =>
            send(`${base}/rates/${inventory.rateId}/inventory`, "PUT", {
              ...inventory,
              priceOverride: inventory.priceOverride
                ? Number(inventory.priceOverride)
                : null,
              from: `${inventory.from}T00:00:00.000Z`,
              to: `${inventory.to}T00:00:00.000Z`,
            })
          }
          className="mt-4 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white disabled:opacity-40"
        >
          اعمال روی بازه
        </button>
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <h2 className="font-black">اتاق‌ها و نرخ‌ها</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {property.roomTypes.map((r) => (
            <article key={r.id} className="rounded-2xl border p-4">
              <h3 className="font-black">{r.name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                ظرفیت {r.capacity} · {r.bedType} · {r.status}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() =>
                    send(`${base}/rooms/${r.id}/duplicate`, "POST", {})
                  }
                  className="rounded-lg border px-2 py-1 text-[11px] font-bold"
                >
                  کپی
                </button>
                <button
                  onClick={() =>
                    send(`${base}/rooms/${r.id}`, "PATCH", {
                      status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                    })
                  }
                  className="rounded-lg border px-2 py-1 text-[11px] font-bold"
                >
                  {r.status === "ACTIVE" ? "غیرفعال‌سازی" : "فعال‌سازی"}
                </button>
              </div>
              {r.ratePlans.map((p) => (
                <div
                  key={p.id}
                  className="mt-3 rounded-xl bg-slate-50 p-3 text-xs"
                >
                  <b>{p.title}</b>
                  <p className="mt-1">
                    {p.baseRate.toLocaleString("fa-IR")} تومان · {p.status}
                  </p>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
