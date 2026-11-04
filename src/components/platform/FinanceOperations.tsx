"use client";

import { useCallback, useEffect, useState } from "react";

type Settlement = {
  id: string;
  organization?: { id: string; name: string };
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  commissionAmount: number;
  refundAmount: number;
  adjustmentAmount: number;
  payableAmount: number;
  status: string;
  notes?: string | null;
};
const money = (value: number | undefined) =>
  (value ?? 0).toLocaleString("fa-IR") + " تومان";
const labels: Record<string, string> = {
  grossSales: "فروش ناخالص",
  refunds: "استرداد",
  commission: "کمیسیون کیاشی",
  merchantPayable: "قابل پرداخت پذیرنده",
  adjustments: "تعدیلات",
  pendingAmount: "مبلغ در انتظار",
  completedAmount: "تسویه‌شده",
  grossAmount: "فروش ناخالص",
  commissionAmount: "کمیسیون",
  refundAmount: "استرداد",
  adjustmentAmount: "تعدیلات",
  payableAmount: "قابل پرداخت",
};
const next: Record<string, string> = {
  DRAFT: "READY",
  READY: "APPROVED",
  APPROVED: "PROCESSING",
  PROCESSING: "PAID",
};

export default function FinanceOperations({
  scope,
}: {
  scope: "backoffice" | "merchant";
}) {
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [rows, setRows] = useState<Settlement[]>([]);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<{
    row: Settlement;
    reference: string;
    notes: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const summaryUrl =
      scope === "backoffice"
        ? "/api/backoffice/finance/summary?preset=30d"
        : "/api/merchant/finance/summary?preset=30d";
    const settlementUrl =
      scope === "backoffice"
        ? "/api/backoffice/settlements"
        : "/api/merchant/settlements";
    const [summaryResponse, settlementResponse] = await Promise.all([
      fetch(summaryUrl, { credentials: "include", cache: "no-store" }),
      fetch(settlementUrl, { credentials: "include", cache: "no-store" }),
    ]);
    const [summaryBody, settlementBody] = await Promise.all([
      summaryResponse.json(),
      settlementResponse.json(),
    ]);
    if (!summaryResponse.ok || !settlementResponse.ok)
      return setError(
        summaryBody.error?.message ??
          settlementBody.error?.message ??
          "دریافت اطلاعات مالی ممکن نشد",
      );
    if (scope === "backoffice") setTotals(summaryBody.finance?.totals ?? {});
    else {
      const settlement = summaryBody.finance?.settlements ?? {};
      const ledger = Object.fromEntries(
        (summaryBody.finance?.ledger ?? []).map(
          (entry: { type: string; amount: number }) => [
            entry.type,
            entry.amount,
          ],
        ),
      );
      setTotals({
        grossAmount: settlement.grossAmount ?? 0,
        commissionAmount: settlement.commissionAmount ?? ledger.COMMISSION ?? 0,
        refundAmount: settlement.refundAmount ?? 0,
        adjustmentAmount: settlement.adjustmentAmount ?? ledger.ADJUSTMENT ?? 0,
        payableAmount: settlement.payableAmount ?? ledger.MERCHANT_PAYABLE ?? 0,
      });
    }
    setRows(settlementBody.settlements ?? []);
  }, [scope]);
  useEffect(() => {
    void load();
  }, [load]);

  const transition = async (
    row: Settlement,
    status: string,
    extra: {
      externalReference?: string;
      notes?: string;
      confirmed?: boolean;
    } = {},
  ) => {
    if (!row.organization) return;
    setSaving(true);
    setError("");
    const response = await fetch(
      `/api/backoffice/merchants/${row.organization.id}/settlements/${row.id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: extra.notes ?? `تغییر وضعیت عملیاتی به ${status}`,
          externalReference: extra.externalReference,
          confirmed: extra.confirmed,
        }),
      },
    );
    const body = await response.json();
    setSaving(false);
    if (!response.ok)
      return setError(body.error?.message ?? "تغییر وضعیت تسویه ممکن نشد");
    setPayment(null);
    void load();
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black">
          {scope === "backoffice" ? "مالی و تسویه پذیرندگان" : "خلاصه مالی"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          نمای قابل‌فهم ۳۰ روز اخیر؛ این صفحه انتقال بانکی واقعی انجام نمی‌دهد و
          ledger خام نمایش پیش‌فرض نیست.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(totals)
            .filter(
              ([key]) =>
                !["pendingSettlements", "completedSettlements"].includes(key),
            )
            .map(([key, value]) => (
              <article
                key={key}
                className="rounded-2xl border border-red-100 bg-red-50/40 p-4"
              >
                <small className="font-bold text-slate-500">
                  {labels[key] ?? key}
                </small>
                <b className="mt-2 block text-xl">{money(value)}</b>
              </article>
            ))}
        </div>
      </section>
      <section className="overflow-hidden rounded-3xl border bg-white">
        <div className="p-5">
          <h2 className="font-black">تاریخچه تسویه</h2>
          <p className="mt-1 text-xs text-slate-500">
            برای پذیرنده فقط خواندنی است؛ تغییر وضعیت فقط در بک‌آفیس مالی مجاز
            است و پرداخت بانکی اجرا نمی‌شود.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-right text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                {[
                  scope === "backoffice" ? "پذیرنده" : "دوره",
                  "شروع",
                  "پایان",
                  "ناخالص",
                  "کمیسیون",
                  "استرداد",
                  "قابل پرداخت",
                  "وضعیت",
                ].map((title) => (
                  <th key={title} className="p-4">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4 font-bold">
                    {scope === "backoffice"
                      ? row.organization?.name
                      : "دوره تسویه"}
                  </td>
                  <td className="p-4">
                    {new Date(row.periodStart).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-4">
                    {new Date(row.periodEnd).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-4">{money(row.grossAmount)}</td>
                  <td className="p-4">{money(row.commissionAmount)}</td>
                  <td className="p-4">{money(row.refundAmount)}</td>
                  <td className="p-4 font-bold">{money(row.payableAmount)}</td>
                  <td className="p-4">
                    {row.status}
                    {scope === "backoffice" &&
                      next[row.status] &&
                      (next[row.status] === "PAID" ? (
                        <button
                          onClick={() =>
                            setPayment({ row, reference: "", notes: "" })
                          }
                          className="mt-2 block rounded-lg border border-red-300 px-2 py-1 text-[11px] font-bold text-primary"
                        >
                          ثبت پرداخت با تأیید
                        </button>
                      ) : (
                        <button
                          disabled={saving}
                          onClick={() => void transition(row, next[row.status])}
                          className="mt-2 block rounded-lg border border-red-200 px-2 py-1 text-[11px] font-bold text-primary disabled:opacity-40"
                        >
                          انتقال به {next[row.status]}
                        </button>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {payment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"
        >
          <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 id="payment-title" className="text-xl font-black">
              تأیید ثبت پرداخت تسویه
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              این اقدام فقط پرداخت انجام‌شده خارج از سامانه را ثبت می‌کند و
              انتقال بانکی انجام نمی‌دهد. مبلغ:{" "}
              <b>{money(payment.row.payableAmount)}</b>
            </p>
            <label className="mt-5 block text-sm font-bold">
              مرجع/شناسه پرداخت
              <input
                autoFocus
                dir="ltr"
                value={payment.reference}
                onChange={(event) =>
                  setPayment({ ...payment, reference: event.target.value })
                }
                className="mt-2 min-h-11 w-full rounded-xl border px-3"
                placeholder="مثلاً IR-TRX-..."
              />
            </label>
            <label className="mt-3 block text-sm font-bold">
              توضیحات (اختیاری)
              <textarea
                value={payment.notes}
                onChange={(event) =>
                  setPayment({ ...payment, notes: event.target.value })
                }
                className="mt-2 min-h-24 w-full rounded-xl border p-3"
              />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                disabled={saving}
                onClick={() => setPayment(null)}
                className="min-h-11 flex-1 rounded-xl border px-4 font-bold"
              >
                انصراف
              </button>
              <button
                disabled={saving || payment.reference.trim().length < 3}
                onClick={() =>
                  void transition(payment.row, "PAID", {
                    externalReference: payment.reference.trim(),
                    notes: payment.notes.trim() || undefined,
                    confirmed: true,
                  })
                }
                className="min-h-11 flex-1 rounded-xl bg-primary px-4 font-bold text-white disabled:opacity-40"
              >
                تأیید نهایی پرداخت
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
