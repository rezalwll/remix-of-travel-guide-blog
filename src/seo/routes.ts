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
  publicPage("/flights", "جست‌وجوی پرواز", "جست‌وجوی پروازهای داخلی و خارجی و راهنمای مقایسه مسیر، بار مجاز، زمان حرکت و قوانین تغییر یا استرداد بلیط.", 0.8),
  publicPage("/hotels", "جست‌وجوی هتل", "جست‌وجوی اقامت و راهنمای مقایسه محله، دسترسی، امکانات هتل و شرایط لغو پیش از ثبت رزرو نهایی.", 0.8),
  publicPage("/routes", "مسیرهای پیشنهادی سفر", "برنامه‌های پیشنهادی و راهنمای مسیر برای سفرهای چندروزه با جزئیات زمان‌بندی، جابه‌جایی، فصل مناسب و دیدنی‌ها.", 0.7),
  publicPage("/tours", "تورهای سفر", "راهنمای مقایسه برنامه‌های تور، خدمات مشمول و غیرمشمول، زمان حرکت و شرایط قرارداد پیش از انتخاب نهایی.", 0.7),
  publicPage("/ziyarat", "سفرهای زیارتی", "راهنمای برنامه‌ریزی سفرهای زیارتی، بررسی نوع جابه‌جایی، محل اقامت، مدارک موردنیاز و خدمات کاروان.", 0.7),
  publicPage("/visa", "راهنمای ویزا", "اطلاعات عمومی فرایند ویزا، مدارک و مراحل درخواست همراه با تأکید بر بررسی آخرین مقررات در منابع رسمی مقصد.", 0.7),
  publicPage("/trains", "بلیط قطار", "راهنمای جست‌وجو و انتخاب بلیط قطار با توجه به مسیر، زمان حرکت، نوع واگن، امکانات و قوانین استرداد.", 0.6),
  publicPage("/buses", "بلیط اتوبوس", "راهنمای جست‌وجو و انتخاب بلیط اتوبوس با بررسی پایانه، ساعت حرکت، نوع ناوگان و شرایط تغییر یا استرداد.", 0.6),
  publicPage("/insurance", "بیمه سفر", "راهنمای انتخاب پوشش بیمه متناسب با مقصد، مدت سفر، سن مسافران، سقف تعهدات و شرایط استفاده از خدمات.", 0.6),
  publicPage("/cip", "خدمات CIP فرودگاه", "راهنمای خدمات تشریفات فرودگاهی، اطلاعات موردنیاز مسافر و مراحل ثبت و پیگیری درخواست خدمات CIP.", 0.6),
  publicPage("/transfer", "ترانسفر فرودگاهی", "راهنمای رزرو ترانسفر فرودگاهی با اطلاعات شماره پرواز، زمان رسیدن، تعداد مسافران، بار و نشانی مقصد.", 0.6),
  publicPage("/airports", "راهنمای فرودگاه‌ها", "راهنمای دسترسی، ترمینال و آمادگی پیش از حرکت در فرودگاه‌های منتخب.", 0.6),
  publicPage("/support", "مرکز راهنمای کیاشی", "پاسخ پرسش‌های متداول درباره خرید، پرداخت، پیگیری سفارش و استرداد همراه با راه‌های ارتباط با پشتیبانی کیاشی.", 0.6),
  legacyPublicPage("/help/purchase-guide", "راهنمای خرید", "مراحل جست‌وجو، بررسی و خرید خدمات سفر."),
  legacyPublicPage("/help/refund-guide", "راهنمای استرداد", "مراحل ثبت و پیگیری درخواست استرداد."),
  legacyPublicPage("/about", "درباره کیاشی", "آشنایی با کیاشی، رویکرد خدمات سفر و اصول انتشار اطلاعات.", 0.4),
  legacyPublicPage("/contact", "تماس با کیاشی", "راه‌های ارتباط با پشتیبانی و واحدهای پاسخ‌گویی کیاشی.", 0.4),
  legacyPublicPage("/terms", "شرایط استفاده", "قواعد استفاده از خدمات و مسئولیت‌های کاربر در کیاشی.", 0.4),
  legacyPublicPage("/privacy", "حریم خصوصی", "نحوه گردآوری، استفاده و نگهداری داده‌های کاربران کیاشی.", 0.4),
  legacyPublicPage("/refund-policy", "سیاست استرداد", "راهنمای عمومی ثبت و پیگیری درخواست تغییر یا استرداد خدمات سفر.", 0.4),
  legacyPublicPage("/licenses", "مجوزها و اطلاعات حقوقی", "اطلاعات حقوقی، مجوزها و مراجع مرتبط با فعالیت کیاشی.", 0.4),
  legacyPublicPage("/business-travel", "خدمات سفر سازمانی", "معرفی فرایند درخواست و پیگیری خدمات سفر برای سازمان‌ها.", 0.4),
  legacyPublicPage("/club", "باشگاه مشتریان کیاشی", "اطلاعات عمومی عضویت و مزایای باشگاه مشتریان کیاشی.", 0.4),
  legacyPublicPage("/travel-preparation", "آمادگی پیش از سفر", "چک‌لیست عمومی مدارک، زمان‌بندی و آماده‌سازی پیش از حرکت.", 0.4),
];

export const indexableStaticRoutes = routePolicies.filter((route) => route.indexable && route.sitemap);
export const routePolicy = (path: string) => routePolicies.find((route) => route.path === path);

export const noindexPrefixes = ["/account", "/auth", "/checkout", "/orders", "/track-order", "/api", "/backoffice", "/merchant"] as const;
export const noindexExact = ["/flights/search", "/hotels/search", "/trains/search", "/buses/search"] as const;

export function assertRoutePolicyIntegrity() {
  const paths = routePolicies.map((route) => route.path);
  if (new Set(paths).size !== paths.length) throw new Error("Duplicate path in SEO route registry");
  if (routePolicies.some((route) => route.sitemap && !route.indexable)) throw new Error("Sitemap route must be indexable");
}

assertRoutePolicyIntegrity();
