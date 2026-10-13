"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/i18n/config";

export type LanguageContextValue = {
  locale: Locale;
  isLoading: boolean;
  setLocale: (locale: Locale) => void;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
