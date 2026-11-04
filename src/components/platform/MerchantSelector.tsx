"use client";

import { useEffect, useState } from "react";

type Merchant = {
  id: string;
  name: string;
  merchantProfile?: {
    businessType?: string | null;
    merchantCode?: string | null;
  } | null;
};

export default function MerchantSelector({
  businessType,
  value,
  onChange,
  label = "پذیرنده",
}: {
  businessType: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [items, setItems] = useState<Merchant[]>([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ businessType, perPage: "20" });
    if (debounced) params.set("q", debounced);
    fetch(`/api/backoffice/merchants?${params}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error?.message ?? "پذیرنده‌ها دریافت نشدند");
        setItems(body.merchants ?? []);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [businessType, debounced]);
  const selected = items.some((item) => item.id === value);
  return (
    <div>
      <label className="text-xs font-bold">
        جست‌وجوی {label}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-1 min-h-10 w-full rounded-xl border px-3 font-normal"
          placeholder="نام یا کد پذیرنده"
        />
      </label>
      <label className="mt-2 block text-xs font-bold">
        {label}
        <select
          className="mt-1 min-h-11 w-full rounded-xl border bg-white px-3 font-normal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">
            {loading ? "در حال جست‌وجو…" : "انتخاب کنید"}
          </option>
          {value && !selected && (
            <option value={value}>پذیرنده انتخاب‌شده</option>
          )}
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.merchantProfile?.merchantCode
                ? ` · ${item.merchantProfile.merchantCode}`
                : ""}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <span className="mt-1 block text-[11px] text-red-700">{error}</span>
      )}
      <p className="mt-1 text-[10px] text-slate-500">
        حداکثر ۲۰ نتیجه از جست‌وجوی سرور نمایش داده می‌شود.
      </p>
    </div>
  );
}
