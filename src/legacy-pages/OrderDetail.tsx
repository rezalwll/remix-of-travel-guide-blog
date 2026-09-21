import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { getOrder } from "@/services/payment";
import {
  orderTitle,
  paymentMethodLabel,
  paymentReference,
  serviceLabel,
  travelerName,
} from "@/services/orderView";
import type { ApiOrder } from "@/services/backend";
import { formatPrice } from "@/utils/flight";
import { viewForBookingStatus } from "@/types/order";

export default function OrderDetail() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getOrder(id)
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
  }, [id]);
  if (loading)
    return (
      <Layout>
        <main className="container-page grid min-h-[60vh] place-items-center">
          در حال دریافت سفارش...
        </main>
      </Layout>
    );
  if (!order)
    return (
      <Layout>
        <main className="container-page flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-extrabold">
              {error || "سفارش پیدا نشد"}
            </h1>
            <Link
              to="/account/orders"
              className="mt-4 inline-block text-primary"
            >
              بازگشت به سفارش‌ها
            </Link>
          </div>
        </main>
      </Layout>
    );
  const status = viewForBookingStatus(order.bookingStatus);
  return (
    <Layout>
      <main className="bg-muted/40 py-8">
        <div className="container-page max-w-4xl">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  جزئیات سفارش · {serviceLabel(order.serviceType)}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold">
                  {order.orderNumber}
                </h1>
              </div>
              <span className="h-fit rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary">
                {status.label}
              </span>
            </div>
            <p role="status" className="mt-4 rounded-lg bg-muted/60 p-3 text-sm leading-7">{status.message}</p>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="font-extrabold">خلاصه رزرو</h2>
                <div className="mt-3 rounded-lg bg-muted/60 p-4">
                  <p className="font-bold">{orderTitle(order)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    کد پیگیری رزرو: {order.trackingCode}
                  </p>
                </div>
              </div>
              <div>
                <h2 className="font-extrabold">پرداخت</h2>
                <p className="mt-3 text-sm">روش: {paymentMethodLabel(order)}</p>
                <p className="mt-2 text-sm">
                  مرجع: <strong>{paymentReference(order)}</strong>
                </p>
                <p className="mt-2 text-lg font-extrabold text-primary">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
            <div className="mt-7 border-t border-border pt-5">
              <h2 className="font-extrabold">مسافران</h2>
              {order.travelers.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {order.travelers.map((item, index) => (
                    <p
                      key={index}
                      className="rounded-lg bg-muted/60 p-3 text-sm"
                    >
                      {travelerName(item)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  اطلاعات مسافر در snapshot این سفارش ثبت نشده است.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
