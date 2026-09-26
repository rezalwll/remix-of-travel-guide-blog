export type RenderingMode = "native-static" | "native-isr" | "legacy-bridge" | "transactional";

export type RoutePolicy = {
  path: string;
  canonical: string;
  title: string;
  description: string;
  indexable: boolean;
  sitemap: boolean;
  rendering: RenderingMode;
  contentSource: "native-content" | "typed-seo-content" | "legacy-editorial";
  native: boolean;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
};

const publicPage = (path: string, title: string, description: string, priority = 0.6): RoutePolicy => ({
  path, canonical: path, title, description, priority, indexable: true, sitemap: true, rendering: "native-static", contentSource: "native-content", native: true, changeFrequency: "monthly",
});
const legacyPublicPage = (path: string, title: string, description: string, priority = 0.4): RoutePolicy => ({
  ...publicPage(path, title, description, priority), rendering: "legacy-bridge", contentSource: "legacy-editorial", native: false,
});

export const routePolicies: RoutePolicy[] = [
  { ...publicPage("/", "پرواز، هتل و راهنمای سفر", "جست‌وجوی سفر و راهنمای مقصدهای منتخب کیاشی.", 1), rendering: "native-isr", contentSource: "typed-seo-content", changeFrequency: "daily" },
  { ...publicPage("/destinations", "راهنمای مقصدهای سفر", "راهنمای فارسی مقصدهای منتخب برای برنامه‌ریزی آگاهانه.", 0.8), rendering: "native-isr", contentSource: "typed-seo-content" },
  { ...publicPage("/blog", "مجله و راهنمای سفر", "مقاله‌ها و راهنماهای فارسی سفر.", 0.7), rendering: "native-isr", contentSource: "typed-seo-content" },
  publicPage("/flights", "جست‌وجوی پرواز", "جست‌وجوی پرواز و راهنمای انتخاب مسیر، بار و قوانین استرداد.", 0.8),
  publicPage("/hotels", "جست‌وجوی هتل", "جست‌وجوی اقامت و راهنمای انتخاب محله و هتل.", 0.8),
  publicPage("/routes", "مسیرهای پیشنهادی سفر", "برنامه‌های نمونه و راهنمای مسیر برای سفرهای چندروزه.", 0.7),
  publicPage("/tours", "تورهای سفر", "راهنمای مقایسه برنامه‌های تور و خدمات اعلام‌شده.", 0.7),
  publicPage("/ziyarat", "سفرهای زیارتی", "راهنمای برنامه‌ریزی سفرهای زیارتی و مدارک لازم.", 0.7),
  publicPage("/visa", "راهنمای ویزا", "اطلاعات عمومی فرایند ویزا و پیوند به منابع رسمی.", 0.7),
  publicPage("/trains", "بلیط قطار", "راهنمای جست‌وجو و انتخاب بلیط قطار.", 0.6),
  publicPage("/buses", "بلیط اتوبوس", "راهنمای جست‌وجو و انتخاب بلیط اتوبوس.", 0.6),
  publicPage("/insurance", "بیمه سفر", "راهنمای انتخاب پوشش بیمه متناسب با سفر.", 0.6),
  publicPage("/cip", "خدمات CIP فرودگاه", "راهنمای خدمات تشریفات فرودگاهی و فرایند درخواست.", 0.6),
  publicPage("/transfer", "ترانسفر فرودگاهی", "راهنمای رزرو ترانسفر و اطلاعات موردنیاز پرواز.", 0.6),
  publicPage("/support", "مرکز راهنمای کیاشی", "پاسخ پرسش‌های متداول و راه‌های پشتیبانی.", 0.6),
  legacyPublicPage("/help/purchase-guide", "راهنمای خرید", "مراحل جست‌وجو، بررسی و خرید خدمات سفر."),
  legacyPublicPage("/help/refund-guide", "راهنمای استرداد", "مراحل ثبت و پیگیری درخواست استرداد."),
  ...["about", "contact", "terms", "privacy", "refund-policy", "licenses", "business-travel", "club", "travel-preparation"].map((path) =>
    legacyPublicPage(`/${path}`, path, `اطلاعات عمومی و راهنمای ${path} در کیاشی.`, 0.4)),
];

export const indexableStaticRoutes = routePolicies.filter((route) => route.indexable && route.sitemap);
export const routePolicy = (path: string) => routePolicies.find((route) => route.path === path);

export const noindexPrefixes = ["/account", "/auth", "/checkout", "/orders", "/track-order", "/api"] as const;
export const noindexExact = ["/flights/search", "/hotels/search", "/trains/search", "/buses/search"] as const;

export function assertRoutePolicyIntegrity() {
  const paths = routePolicies.map((route) => route.path);
  if (new Set(paths).size !== paths.length) throw new Error("Duplicate path in SEO route registry");
  if (routePolicies.some((route) => route.sitemap && !route.indexable)) throw new Error("Sitemap route must be indexable");
}

assertRoutePolicyIntegrity();
