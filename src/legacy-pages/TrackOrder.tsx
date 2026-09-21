import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { findPublicOrder } from "@/services/orderTracking";
import { serviceLabel } from "@/services/orderView";
import type { ApiTracking } from "@/services/backend";
import { formatPrice } from "@/utils/flight";
import { viewForBookingStatus } from "@/types/order";

export default function TrackOrder() {
  const [number, setNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<ApiTracking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const search = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      setResult(await findPublicOrder(number, mobile));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "سفارش با این مشخصات پیدا نشد.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <main className="bg-muted/40 py-8 sm:py-12">
        <div className="container-page max-w-3xl">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-9">
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Search className="size-6" />
              </span>
              <div>
                <p className="text-xs font-bold text-primary">خدمات مشتریان</p>
                <h1 className="mt-1 text-2xl font-extrabold">پیگیری خرید</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  شماره سفارش، کد پیگیری رزرو یا مرجع پرداخت را به همراه موبایل
                  خریدار وارد کنید.
                </p>
              </div>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold">
                شناسه سفارش
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  dir="ltr"
                  placeholder="KIA-2026-000001"
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>
              <label className="text-sm font-bold">
                موبایل خریدار
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  dir="ltr"
                  placeholder="09120000000"
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => void search()}
              disabled={!number || !mobile || loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              <Search className="size-4" />{" "}
              {loading ? "در حال بررسی..." : "جست‌وجوی سفارش"}
            </button>
            {error && (
              <div
                role="alert"
                className="mt-5 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="size-4" />
                {error}
              </div>
            )}
            {result && (
              <div className="mt-7 rounded-2xl border border-secondary/30 bg-secondary/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      سفارش {result.orderNumber}
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold">
                      {serviceLabel(result.serviceType)}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      مبلغ {formatPrice(result.total)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary">
                    <CheckCircle2 className="size-4" />{" "}
                    {result.paymentStatus === "paid"
                      ? "پرداخت موفق"
                      : result.paymentStatus}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">وضعیت رزرو</p>
                    <p className="mt-1 text-sm font-bold">
                      {viewForBookingStatus(result.bookingStatus).label}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">کد پیگیری</p>
                    <p className="mt-1 text-sm font-bold" dir="ltr">
                      {result.trackingCode}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">موبایل</p>
                    <p className="mt-1 text-sm font-bold" dir="ltr">
                      {result.buyerMobile}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <Link
                    to="/help"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs font-bold"
                  >
                    <Headphones className="size-4" /> نیاز به کمک دارید؟
                  </Link>
                </div>
              </div>
            )}
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-6 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary" />
              پاسخ پیگیری از سرور فقط اطلاعات ماسک‌شده و خلاصه وضعیت را
              برمی‌گرداند.
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
