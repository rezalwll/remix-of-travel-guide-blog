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
  capabilities?: string[];
};

const merchantCapabilityBySection: ReadonlyArray<[RegExp, string]> = [
  [/\/(hotels|inventory|hotel-bookings|guests)(?:\/|$)/, "MANAGE_HOTELS"],
  [/\/programs(?:\/|$)/, "MANAGE_PROGRAMS"],
  [/\/registrations(?:\/|$)/, "VIEW_PROGRAM_REGISTRATIONS"],
  [/\/orders(?:\/|$)/, "VIEW_PROVIDER_ORDERS"],
  [/\/team(?:\/|$)/, "MANAGE_TEAM"],
  [/\/(finance|settlements)(?:\/|$)/, "VIEW_FINANCE"],
];

const navigation = {
  backoffice: [
    ["/backoffice", "نمای کلی", "backoffice.dashboard.view", "نمای کلی"],
    ["/backoffice/orders", "سفارش‌ها", "backoffice.orders.read", "عملیات"],
    ["/backoffice/registrations", "ثبت‌نام‌ها", "backoffice.registrations.read", "عملیات"],
    ["/backoffice/refunds", "استرداد", "backoffice.refunds.read", "عملیات"],
    ["/backoffice/operations/flight", "عملیات سرویس‌ها", "backoffice.orders.read", "عملیات"],
    ["/backoffice/programs", "تور و زیارت", "backoffice.programs.read", "محصولات"],
    ["/backoffice/hotels", "هتل‌ها", "backoffice.hotels.read", "محصولات"],
    ["/backoffice/hotel-bookings", "رزرو هتل", "backoffice.orders.read", "محصولات"],
    ["/backoffice/visa", "پرونده‌های ویزا", "backoffice.visa.read", "محصولات"],
    ["/backoffice/customers", "مشتریان", "backoffice.customers.read", "ارتباط"],
    ["/backoffice/support", "پشتیبانی", "backoffice.support.read", "ارتباط"],
    ["/backoffice/merchants", "پذیرندگان", "backoffice.merchants.read", "پذیرندگان"],
    ["/backoffice/finance", "مالی و تسویه", "backoffice.finance.view", "پذیرندگان"],
    ["/backoffice/providers", "تأمین‌کنندگان", "backoffice.providers.read", "سیستم"],
    ["/backoffice/reports", "گزارش‌ها", "backoffice.reports.view", "سیستم"],
    ["/backoffice/audit", "ممیزی", "backoffice.audit.read", "سیستم"],
  ],
  merchant: [
    ["/merchant", "نمای کلی", "merchant.dashboard.view", "نمای کلی"],
    ["/merchant/orders", "سفارش‌ها", "merchant.orders.read", "عملیات"],
    ["/merchant/hotels", "هتل‌ها", "merchant.hotels.read", "هتل"],
    ["/merchant/inventory", "قیمت و موجودی", "merchant.inventory.read", "هتل"],
    ["/merchant/hotel-bookings", "رزروها", "merchant.bookings.read", "هتل"],
    ["/merchant/guests", "مهمان‌ها", "merchant.guests.read", "هتل"],
    ["/merchant/programs", "تور و زیارت", "merchant.programs.read", "تور و زیارت"],
    ["/merchant/registrations", "ثبت‌نام‌ها", "merchant.registrations.read", "تور و زیارت"],
    ["/merchant/finance", "مالی", "merchant.finance.view", "مالی"],
    ["/merchant/settlements", "تسویه‌ها", "merchant.settlements.read", "مالی"],
    ["/merchant/team", "تیم", "merchant.team.read", "سازمان"],
    ["/merchant/profile", "پروفایل", "merchant.dashboard.view", "سازمان"],
    ["/merchant/support", "پشتیبانی", "merchant.dashboard.view", "سازمان"],
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

  const links = useMemo(() => navigation[scope].filter((entry) => {
    if (!access?.permissions.includes(entry[2])) return false;
    if (scope !== "merchant") return true;
    const required = merchantCapabilityBySection.find(([pattern]) => pattern.test(entry[0]))?.[1];
    return !required || Boolean(access.capabilities?.includes(required));
  }), [access, scope]);
  const groups=useMemo(()=>Array.from(new Set(links.map(entry=>entry[3]))),[links]);

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
          <nav aria-label="ناوبری پنل" className="mt-6 flex gap-5 overflow-x-auto border-t border-red-50 pt-4">
            {groups.map(group=><div key={group} className="shrink-0"><p className="mb-2 px-1 text-[10px] font-black text-slate-400">{group}</p><div className="flex gap-2">{links.filter(entry=>entry[3]===group).map(([href,label])=>{const active=pathname===href;return <Link key={href} href={href} aria-current={active?"page":undefined} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active?"bg-primary text-white":"bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-primary"}`}>{label}</Link>})}</div></div>)}
          </nav>
        </header>
        <section className="mt-6">{children}</section>
      </div>
    </main>
  );
}
