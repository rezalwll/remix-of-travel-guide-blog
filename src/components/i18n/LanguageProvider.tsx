"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { defaultLocale, isLocale, localeDirection, localeStorageKey, type Locale } from "@/i18n/config";
import { englishOverrides } from "@/i18n/overrides";

type Dictionary = Record<string, string>;

const ignoredParents = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const translatedAttributes = ["aria-label", "placeholder", "title", "alt"] as const;
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const overrideEntries = Object.entries(englishOverrides).sort((a, b) => b[0].length - a[0].length);
const languageListeners = new Set<() => void>();
let activeLocale: Locale | null = null;

const getClientLocale = () => {
  if (activeLocale) return activeLocale;
  if (typeof document === "undefined") return defaultLocale;
  activeLocale = isLocale(document.documentElement.lang) ? document.documentElement.lang : defaultLocale;
  return activeLocale;
};

const subscribeToLocale = (listener: () => void) => {
  languageListeners.add(listener);
  return () => languageListeners.delete(listener);
};

const publishLocale = (locale: Locale) => {
  activeLocale = locale;
  languageListeners.forEach((listener) => listener());
};

const withOriginalWhitespace = (source: string, translated: string) => {
  const start = source.match(/^\s*/)?.[0] ?? "";
  const end = source.match(/\s*$/)?.[0] ?? "";
  return `${start}${translated}${end}`;
};

const withLatinDigits = (value: string) => value
  .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const translateValue = (value: string, dictionary: Dictionary, fragmentEntries: [string, string][]) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return value;
  const direct = englishOverrides[normalized] ?? dictionary[normalized];
  if (direct) return withOriginalWhitespace(value, withLatinDigits(direct));

  let translated = normalized;
  let changed = false;
  for (const [source, target] of fragmentEntries) {
    if (!translated.includes(source)) continue;
    translated = translated.replaceAll(source, target);
    changed = true;
  }
  for (const [source, target] of overrideEntries) {
    if (!translated.includes(source)) continue;
    translated = translated.replaceAll(source, target);
    changed = true;
  }
  return withOriginalWhitespace(value, withLatinDigits(changed ? translated : normalized));
};

const translateElement = (element: Element, locale: Locale, dictionary: Dictionary, fragmentEntries: [string, string][]) => {
  if (element.closest("[data-no-translate]")) return;
  const saved = originalAttributes.get(element) ?? new Map<string, string>();
  for (const attribute of translatedAttributes) {
    const current = element.getAttribute(attribute);
    if (current === null) continue;
    const previous = saved.get(attribute);
    const expected = previous ? translateValue(previous, dictionary, fragmentEntries) : null;
    if (/[\u0600-\u06ff]/.test(current) && (!previous || current !== previous && current !== expected)) {
      saved.set(attribute, current);
    }
    const source = saved.get(attribute);
    if (!source) continue;
    element.setAttribute(attribute, locale === "en" ? translateValue(source, dictionary, fragmentEntries) : source);
  }
  if (saved.size) originalAttributes.set(element, saved);
};

const translateTree = (root: Node, locale: Locale, dictionary: Dictionary, fragmentEntries: [string, string][]) => {
  if (root instanceof Element) {
    if (ignoredParents.has(root.tagName) || root.closest("[data-no-translate]")) return;
    translateElement(root, locale, dictionary, fragmentEntries);
    root.querySelectorAll("[aria-label], [placeholder], [title], [alt]").forEach((element) =>
      translateElement(element, locale, dictionary, fragmentEntries));
  }

  const translateText = (text: Text) => {
    const parent = text.parentElement;
    if (!parent || ignoredParents.has(parent.tagName) || parent.closest("[data-no-translate]")) return;
    const current = text.nodeValue ?? "";
    const previous = originalText.get(text);
    const expected = previous ? translateValue(previous, dictionary, fragmentEntries) : null;
    if (/[\u0600-\u06ff]/.test(current) && (!previous || current !== previous && current !== expected)) {
      originalText.set(text, current);
    }
    const source = originalText.get(text);
    if (!source) return;
    const next = locale === "en" ? translateValue(source, dictionary, fragmentEntries) : source;
    if (text.nodeValue !== next) text.nodeValue = next;
  };

  if (root.nodeType === Node.TEXT_NODE) translateText(root as Text);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateText(node as Text);
    node = walker.nextNode();
  }
};

const applyDocumentLocale = (locale: Locale) => {
  const root = document.documentElement;
  root.lang = locale;
  root.dir = localeDirection(locale);
  root.classList.toggle("lang-en", locale === "en");
  root.classList.toggle("lang-fa", locale === "fa");
};

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useSyncExternalStore(subscribeToLocale, getClientLocale, () => defaultLocale);
  const [isLoading, setIsLoading] = useState(false);
  const dictionaryRef = useRef<Dictionary>({});
  const fragmentEntriesRef = useRef<[string, string][]>([]);
  const localeRef = useRef<Locale>(defaultLocale);

  const renderLocale = useCallback((nextLocale: Locale) => {
    applyDocumentLocale(nextLocale);
    translateTree(document.head, nextLocale, dictionaryRef.current, fragmentEntriesRef.current);
    translateTree(document.body, nextLocale, dictionaryRef.current, fragmentEntriesRef.current);
    document.documentElement.classList.add("locale-ready");
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(localeStorageKey, nextLocale);
    applyDocumentLocale(nextLocale);
    publishLocale(nextLocale);
  }, []);

  useEffect(() => {
    localeRef.current = locale;
    let cancelled = false;
    const load = async () => {
      if (locale === "en" && !Object.keys(dictionaryRef.current).length) {
        setIsLoading(true);
        const [generated, fragments] = await Promise.all([
          import("@/i18n/en.generated.json"),
          import("@/i18n/en.fragments.json"),
        ]);
        if (cancelled) return;
        dictionaryRef.current = generated.default as Dictionary;
        fragmentEntriesRef.current = Object.entries(fragments.default as Dictionary)
          .filter(([source]) => source.trim().length >= 4 && !englishOverrides[source] && !englishOverrides[source.trim()])
          .sort((a, b) => b[0].length - a[0].length);
      }
      renderLocale(locale);
      if (!cancelled) setIsLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [locale, renderLocale]);

  useEffect(() => {
    if (locale === "en" && !Object.keys(dictionaryRef.current).length) return;
    translateTree(document.body, locale, dictionaryRef.current, fragmentEntriesRef.current);
  }, [locale, pathname]);

  useEffect(() => {
    const observerOptions: MutationObserverInit = {
      attributes: true,
      attributeFilter: [...translatedAttributes],
      characterData: true,
      childList: true,
      subtree: true,
    };
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateTree(mutation.target, localeRef.current, dictionaryRef.current, fragmentEntriesRef.current);
        if (mutation.type === "attributes") translateElement(mutation.target as Element, localeRef.current, dictionaryRef.current, fragmentEntriesRef.current);
        mutation.addedNodes.forEach((node) => translateTree(node, localeRef.current, dictionaryRef.current, fragmentEntriesRef.current));
      }
      observer.observe(document.documentElement, observerOptions);
    });
    observer.observe(document.documentElement, observerOptions);
    return () => observer.disconnect();
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, isLoading, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
