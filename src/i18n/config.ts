export const supportedLocales = ["fa", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "fa";
export const localeStorageKey = "kiashi-locale";

export const isLocale = (value: string | null): value is Locale =>
  value === "fa" || value === "en";

export const localeDirection = (locale: Locale) => locale === "fa" ? "rtl" : "ltr";
