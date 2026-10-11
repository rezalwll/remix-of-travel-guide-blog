"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => undefined;

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "فعال‌کردن حالت روشن" : "فعال‌کردن حالت تیره";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/35 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-white/80 focus-visible:ring-offset-primary",
        className,
      )}
      aria-label={label}
      title={label}
      disabled={!mounted}
      data-testid="theme-toggle"
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute size-[1.15rem] transition-[opacity,transform] duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute size-[1.15rem] transition-[opacity,transform] duration-300",
          isDark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
    </button>
  );
}
