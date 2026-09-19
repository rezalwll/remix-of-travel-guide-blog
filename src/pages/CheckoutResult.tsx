import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleX,
  Copy,
  Headphones,
  Home,
  Printer,
  RefreshCcw,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getOrder } from "@/services/payment";
import {
  orderTitle,
  paymentReference,
  serviceLabel,
} from "@/services/orderView";
import type { ApiOrder } from "@/services/backend";
import { formatPrice } from "@/utils/flight";
import { viewForBookingStatus } from "@/types/order";

export default function CheckoutResult() {
  const [query] = useSearchParams();
  const state = query.get("state") || "success";
  const orderId = query.get("order") || "";
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(state === "success" && !!orderId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state !== "success" || !orderId) return;
    let active = true;
    getOrder(orderId)
      .then((value) => {
        if (active) setOrder(value);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "سفارش پیدا نشد.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId, state]);

  if (loading)
    return (
      <Layout>
        <main className="container-page grid min-h-[65vh] place-items-center">
          در حال دریافت سفارش از سرور...
        </main>
      </Layout>
    );
  const paymentRecorded = state === "success" && !!order;
  const status = order ? viewForBookingStatus(order.bookingStatus) : null;
  const success = paymentRecorded && order.bookingStatus === "confirmed";
  const copy = () => {
    if (order)
      void navigator.clipboard?.writeText(
        `${order.orderNumber} · ${paymentReference(order)} · ${formatPrice(order.total)}`,
      );
  };

  return (
    <Layout>
      <main className="bg-muted/40 py-8">
        <div className="container-page max-w-3xl">
          <section className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
            {success ? (
              <CheckCircle2 className="mx-auto size-16 text-secondary" />
            ) : (
              <CircleX className="mx-auto size-16 text-destructive" />
            )}
            <h1 className="mt-5 text-2xl font-extrabold">
              {paymentRecorded
                ? status?.label
                : state === "cancelled"
                  ? "پرداخت لغو شد"
                  : "پرداخت انجام نشد"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || status?.message || "وضعیت این صفحه از API خوانده می‌شود؛ صدور رسمی بلیت یا واچر هنوز فعال نیست."}
            </p>
            {paymentRecorded && order && (
              <>
                <div className="mt-7 grid gap-3 text-start sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">شماره سفارش</p>
                    <p className="mt-1 font-extrabold">{order.orderNumber}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">کد پیگیری</p>
                    <p className="mt-1 font-extrabold" dir="ltr">
                      {paymentReference(order)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">مبلغ نهایی</p>
                    <p className="mt-1 font-extrabold text-primary">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-secondary/25 bg-secondary/5 p-4 text-start">
                  <p className="text-xs font-bold text-secondary">
                    {serviceLabel(order.serviceType)}
                  </p>
                  <p className="mt-2 font-extrabold">{orderTitle(order)}</p>
                  <p className="mt-2 text-sm leading-7">
                    سفارش در PostgreSQL ثبت شده و از حساب کاربری و پیگیری خرید
                    قابل مشاهده است.
                  </p>
                </div>
              </>
            )}
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {paymentRecorded && order ? (
                <>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold"
                  >
                    <Printer className="size-4" /> چاپ / ذخیره
                  </button>
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold"
                  >
                    <Copy className="size-4" /> کپی خلاصه
                  </button>
                  <Link
                    to={`/orders/${order.id}`}
                    className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"
                  >
                    مشاهده سفارش
                  </Link>
                </>
              ) : (
                <Link
                  to="/checkout/payment"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"
                >
                  <RefreshCcw className="size-4" /> انتخاب روش دیگر
                </Link>
              )}
              <Link
                to="/help"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold"
              >
                <Headphones className="size-4" /> پشتیبانی
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold"
              >
                <Home className="size-4" /> خانه
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
