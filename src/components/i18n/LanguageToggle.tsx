"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function LanguageToggle({ className }: { className?: string }) {
  const { locale, isLoading, setLocale } = useLanguage();
  const nextLocale = locale === "fa" ? "en" : "fa";
  const label = locale === "fa" ? "Switch to English" : "تغییر زبان به فارسی";

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className={cn(
        "inline-flex h-10 min-w-14 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/35 bg-white/10 px-2 text-xs font-black text-white transition-colors hover:bg-white/20 focus-visible:ring-white/80 focus-visible:ring-offset-primary disabled:opacity-60",
        className,
      )}
      aria-label={label}
      title={label}
      disabled={isLoading}
      data-testid="language-toggle"
      data-no-translate
    >
      <Languages className="size-4" aria-hidden="true" />
      <span>{isLoading ? "…" : nextLocale === "en" ? "EN" : "فا"}</span>
    </button>
  );
}
