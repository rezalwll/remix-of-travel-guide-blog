export const seoAuditManifest = {
  indexable: [
    { path: "/", h1: "سفر را انتخاب کن", jsonLd: false },
    { path: "/destinations/iran/kish", h1: "راهنمای سفر به کیش", jsonLd: false },
    { path: "/flights/tehran-to-mashhad", h1: "بلیط هواپیما تهران به مشهد", jsonLd: true },
    { path: "/hotels/kish", h1: "هتل‌های کیش", jsonLd: false },
    { path: "/blog/best-time-to-visit-istanbul", h1: "بهترین زمان سفر به استانبول", jsonLd: true },
    { path: "/flights", h1: "جست‌وجوی پرواز", jsonLd: false },
    { path: "/hotels", h1: "جست‌وجوی هتل", jsonLd: false },
    { path: "/support", h1: "سوالات متداول", jsonLd: false },
  ],
  noindex: ["/auth/login", "/checkout/review", "/track-order", "/flights/search?from=THR&to=MHD", "/account"],
  redirects: [
    ["/help", "/support"], ["/faq", "/support"], ["/order-tracking", "/track-order"],
    ["/transfers", "/transfer"], ["/experiences", "/city-tours"], ["/travel-checklist", "/travel-preparation"],
    ["/article/feat1", "/blog/feat1"], ["/flights/flight-0-0", "/flights/search?from=IKA&to=IST&adults=1&trip=oneway"],
  ],
  intentional404: ["/this-route-must-not-exist"],
  nativePublic: ["/flights", "/hotels", "/tours", "/ziyarat", "/visa", "/support", "/routes", "/insurance", "/cip", "/transfer", "/fast-track", "/esim", "/city-tours"],
  legacyBridge: ["/auth/login", "/auth/otp", "/account", "/checkout/review", "/checkout/payment", "/track-order", "/flights/search", "/hotels/search"],
} as const;
