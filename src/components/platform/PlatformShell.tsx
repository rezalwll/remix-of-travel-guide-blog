"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Building2, LockKeyhole, ShieldCheck } from "lucide-react";

type Scope = "backoffice" | "merchant";
type AccessPayload = {
  user: { firstName: string; lastName: string };
  organization: { name: string; id: string; businessType?: string | null };
  roles: string[];
  permissions: string[];
};

const navigation = {
  backoffice: [
    ["/backoffice", "نمای کلی", "backoffice.dashboard.view"],
    ["/backoffice/orders", "سفارش‌ها", "backoffice.orders.read"],
    ["/backoffice/operations/flight", "عملیات سرویس‌ها", "backoffice.orders.read"],
    ["/backoffice/hotels", "هتل‌ها", "backoffice.hotels.read"],
    ["/backoffice/customers", "مشتریان", "backoffice.customers.read"],
    ["/backoffice/refunds", "استرداد", "backoffice.refunds.read"],
    ["/backoffice/support", "پشتیبانی", "backoffice.support.read"],
    ["/backoffice/programs", "تور و زیارت", "backoffice.programs.read"],
    ["/backoffice/registrations", "ثبت‌نام‌ها", "backoffice.registrations.read"],
    ["/backoffice/merchants", "پذیرندگان", "backoffice.merchants.read"],
    ["/backoffice/reports", "گزارش‌ها", "backoffice.reports.view"],
    ["/backoffice/audit", "ممیزی", "backoffice.audit.read"],
  ],
  merchant: [
    ["/merchant", "نمای کلی", "merchant.dashboard.view"],
    ["/merchant/orders", "سفارش‌ها", "merchant.orders.read"],
    ["/merchant/hotels", "هتل‌ها", "merchant.hotels.read"],
    ["/merchant/inventory", "قیمت و موجودی", "merchant.inventory.read"],
    ["/merchant/hotel-bookings", "رزروها", "merchant.bookings.read"],
    ["/merchant/guests", "مهمان‌ها", "merchant.guests.read"],
    ["/merchant/programs", "تور و زیارت", "merchant.programs.read"],
    ["/merchant/registrations", "ثبت‌نام‌ها", "merchant.registrations.read"],
    ["/merchant/finance", "مالی", "merchant.finance.view"],
    ["/merchant/settlements", "تسویه‌ها", "merchant.settlements.read"],
    ["/merchant/team", "تیم", "merchant.team.read"],
    ["/merchant/profile", "پروفایل", "merchant.dashboard.view"],
    ["/merchant/support", "پشتیبانی", "merchant.dashboard.view"],
  ],
} as const;

export default function PlatformShell({ scope, children }: { scope: Scope; children: React.ReactNode }) {
  const pathname = usePathname();
  const [access, setAccess] = useState<AccessPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${scope}/me`, { credentials: "include", cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return null;
        }
        if (response.status === 403 || response.status === 404) { setState("forbidden"); return null; }
        if (!response.ok) throw new Error("platform access request failed");
        return response.json() as Promise<AccessPayload>;
      })
      .then((payload) => { if (payload) { setAccess(payload); setState("ready"); } })
      .catch((error) => { if (error instanceof Error && error.name !== "AbortError") setState("error"); });
    return () => controller.abort();
  }, [scope]);

  const links = useMemo(() => navigation[scope].filter((entry) => {if(!access?.permissions.includes(entry[2]))return false;if(scope!=="merchant")return true;const hotel=access.organization.businessType==="HOTEL";if(entry[0].includes("program")||entry[0].includes("registration"))return !hotel;if(entry[0].includes("hotel")||entry[0].includes("inventory")||entry[0].includes("guests"))return hotel;return true;}), [access, scope]);

  if (state === "loading") return <div className="mx-auto grid min-h-[55vh] max-w-6xl place-items-center px-4"><div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />در حال بررسی دسترسی…</div></div>;
  if (state === "forbidden") return <div className="mx-auto grid min-h-[55vh] max-w-3xl place-items-center px-4"><div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"><LockKeyhole className="mx-auto size-10 text-primary" /><h1 className="mt-4 text-xl font-black">دسترسی پنل برای این حساب فعال نیست</h1><p className="mt-2 text-sm leading-7 text-muted-foreground">عضویت فعال و مجوز مناسب باید توسط مدیر سامانه ثبت شود.</p><Link className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white" href="/">بازگشت به سایت</Link></div></div>;
  if (state === "error" || !access) return <div className="mx-auto grid min-h-[55vh] max-w-3xl place-items-center px-4"><div className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="text-lg font-black">ارتباط با سرویس پنل برقرار نشد</h1><p className="mt-2 text-sm text-amber-900">پس از اطمینان از اجرای API دوباره صفحه را بارگذاری کنید.</p></div></div>;

  return (
    <main className="min-h-[70vh] bg-[#fffafa] py-8" data-platform-scope={scope}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="rounded-3xl border border-red-100 bg-white p-5 shadow-[0_16px_50px_rgba(223,48,28,0.08)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary"><ShieldCheck className="size-4" />{scope === "backoffice" ? "پنل داخلی کیاشی" : "پنل پذیرنده"}</div>
              <h1 className="mt-2 text-2xl font-black text-slate-900">{access.organization.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{access.user.firstName} {access.user.lastName} · {access.roles.join("، ")}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold text-red-800"><Building2 className="size-4" />داده‌ها محدود به سازمان مجاز هستند</div>
          </div>
          <nav aria-label="ناوبری پنل" className="mt-6 flex gap-2 overflow-x-auto border-t border-red-50 pt-4">
            {links.map(([href, label]) => {
              const active = pathname === href;
              return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-primary text-white" : "bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-primary"}`}>{label}</Link>;
            })}
          </nav>
        </header>
        <section className="mt-6">{children}</section>
      </div>
    </main>
  );
}
