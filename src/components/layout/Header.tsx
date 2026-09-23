"use client";

import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "@/lib/router";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Headphones,
  Menu,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const primaryLinks = [
  { label: "پرواز", to: "/flights" },
  { label: "هتل", to: "/hotels" },
  { label: "تور", to: "/tours" },
  { label: "قطار", to: "/trains" },
  { label: "اتوبوس", to: "/buses" },
  { label: "زیارت", to: "/ziyarat" },
];

const moreLinks = [
  ["ویزا", "/visa"],
  ["بیمه سفر", "/insurance"],
  ["CIP فرودگاه", "/cip"],
  ["ترانسفر", "/transfer"],
  ["Fast Track", "/fast-track"],
  ["eSIM", "/esim"],
  ["تجربه‌های سفر", "/experiences"],
  ["مجله سفر", "/blog"],
  ["مرکز راهنما", "/help"],
] as const;

const Header = () => {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-bold transition-colors",
      isActive
        ? "bg-primary/[0.08] text-primary after:absolute after:inset-x-3 after:-bottom-[17px] after:h-0.5 after:rounded-full after:bg-primary"
        : "text-foreground/[0.68] hover:bg-muted hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/95 shadow-[0_1px_0_hsl(213_25%_14%/0.02)] backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="کیاشی، صفحه اصلی"
        >
          <img src="/kiashi-logo.png" alt="کیاشی" className="h-10 w-auto max-w-[112px] object-contain object-right" />
          <span className="hidden sm:block">
            <span className="block text-[9px] font-semibold text-muted-foreground">همهٔ سفر، یک‌جا</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="خدمات اصلی">
          {primaryLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-bold text-foreground/[0.68] transition hover:bg-muted hover:text-foreground"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              بیشتر
              <ChevronDown className={cn("size-4 transition", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div
                className="absolute start-0 top-full mt-3 grid min-w-64 grid-cols-2 gap-1 rounded-2xl border border-border/80 bg-card p-2.5 shadow-2xl"
                role="menu"
              >
                <div className="col-span-2 mb-1 flex items-center gap-2 rounded-xl bg-secondary/[0.08] px-3 py-2 text-xs font-bold text-secondary">
                  <Sparkles className="size-4" /> خدمات مکمل سفر
                </div>
                {moreLinks.map(([label, to]) => (
                  <Link
                    key={to}
                    to={to}
                    role="menuitem"
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-muted hover:text-primary"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/support"
            className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground/[0.65] transition hover:bg-muted hover:text-secondary xl:inline-flex"
          >
            <Headphones className="size-4" /> پشتیبانی
          </Link>
          <Link
            to="/track-order"
            className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground/[0.65] transition hover:bg-muted hover:text-secondary md:inline-flex"
          >
            <Search className="size-4" /> پیگیری
          </Link>
          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/account" className="secondary-cta min-h-10 px-3">
                <UserRound className="size-4" /> {user.firstName || "حساب من"}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl px-2 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                خروج
              </button>
            </div>
          ) : (
            <Link to="/auth/login" className="secondary-cta hidden min-h-10 px-3 md:inline-flex">
              <UserRound className="size-4" /> ورود / ثبت‌نام
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-xl border border-border bg-card transition hover:bg-muted lg:hidden"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-card lg:hidden">
          <nav className="container-page max-h-[calc(100vh-72px)] overflow-y-auto py-4" aria-label="منوی موبایل">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {primaryLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl border px-3 py-3 text-center text-sm font-bold",
                      isActive ? "border-primary/20 bg-primary/[0.08] text-primary" : "border-border bg-muted/[0.35]",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <p className="mb-2 mt-5 text-xs font-bold text-muted-foreground">خدمات بیشتر</p>
            <div className="grid grid-cols-2 gap-1">
              {moreLinks.map(([label, to]) => (
                <Link key={to} to={to} className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                  {label}
                </Link>
              ))}
              <Link to="/track-order" className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-muted">پیگیری خرید</Link>
              <Link to={user ? "/account" : "/auth/login"} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">
                {user ? "حساب کاربری" : "ورود / ثبت‌نام"}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
