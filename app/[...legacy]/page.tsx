import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyPage, { type LegacyPageName } from "@/components/next/LegacyPage";
import { createMetadata, privateMetadata } from "@/seo/metadata";
import { tours, ziyaratOffers } from "@/data/experiences";
import { products } from "@/data/products";
import { travelRoutes } from "@/data/routes";
import { visaCountries } from "@/services/visaService";

type Entry = { name: LegacyPageName; props?: Record<string, unknown>; guard?: "protected" | "guest"; title: string; description?: string; index?: boolean };

const staticRoutes: Record<string, Entry> = {
  shop: { name: "Shop", title: "فروشگاه سفر", index: false },
  "help/purchase-guide": { name: "PublicInfoPage", props: { kind: "purchase" }, title: "راهنمای خرید", index: true },
  "help/refund-guide": { name: "PublicInfoPage", props: { kind: "refund-guide" }, title: "راهنمای استرداد", index: true },
  "track-order": { name: "TrackOrder", title: "پیگیری سفارش", index: false },
  about: { name: "PublicInfoPage", props: { kind: "about" }, title: "درباره کیاشی", index: true },
  contact: { name: "PublicInfoPage", props: { kind: "contact" }, title: "تماس با کیاشی", index: true },
  terms: { name: "PublicInfoPage", props: { kind: "terms" }, title: "قوانین و مقررات", index: true },
  privacy: { name: "PublicInfoPage", props: { kind: "privacy" }, title: "حریم خصوصی", index: true },
  "refund-policy": { name: "PublicInfoPage", props: { kind: "refund" }, title: "سیاست استرداد", index: true },
  licenses: { name: "PublicInfoPage", props: { kind: "licenses" }, title: "مجوزها و اعتماد", index: true },
  "business-travel": { name: "PublicInfoPage", props: { kind: "business" }, title: "سفر سازمانی", index: true },
  club: { name: "PublicInfoPage", props: { kind: "club" }, title: "باشگاه مشتریان", index: true },
  "travel-preparation": { name: "PublicInfoPage", props: { kind: "travel-preparation" }, title: "آمادگی سفر", index: true },
  "flights/search": { name: "FlightSearchResults", title: "نتایج جست‌وجوی پرواز", index: false },
  "hotels/search": { name: "HotelSearchResults", title: "نتایج جست‌وجوی هتل", index: false },
  "checkout/hotel-guests": { name: "HotelGuests", title: "اطلاعات مهمانان", index: false },
  "checkout/tour-travelers": { name: "ExperienceTravelers", props: { type: "tour" }, title: "مسافران تور", index: false },
  "checkout/ziyarat-travelers": { name: "ExperienceTravelers", props: { type: "ziyarat" }, title: "مسافران سفر زیارتی", index: false },
  "trains/search": { name: "SecondaryServicePage", props: { type: "train" }, title: "نتایج قطار", index: false },
  "buses/search": { name: "SecondaryServicePage", props: { type: "bus" }, title: "نتایج اتوبوس", index: false },
  "checkout/secondary-passengers": { name: "SecondaryPassengers", title: "اطلاعات مسافران", index: false },
  "checkout/passengers": { name: "CheckoutPassengers", title: "اطلاعات مسافران", index: false },
  "checkout/review": { name: "CheckoutReview", title: "مرور سفارش", index: false },
  "checkout/payment": { name: "CheckoutPayment", title: "پرداخت سفارش", guard: "protected", index: false },
  "checkout/gateway": { name: "MockGateway", title: "درگاه پرداخت آزمایشی", guard: "protected", index: false },
  "checkout/result": { name: "CheckoutResult", title: "نتیجه پرداخت", guard: "protected", index: false },
  "auth/login": { name: "Login", title: "ورود", guard: "guest", index: false },
  "auth/register": { name: "Register", title: "ثبت‌نام", guard: "guest", index: false },
  "auth/otp": { name: "Otp", title: "تأیید شماره موبایل", guard: "guest", index: false },
  "auth/forgot-password": { name: "ForgotPassword", title: "بازیابی حساب", guard: "guest", index: false },
  account: { name: "AccountPage", title: "حساب کاربری", guard: "protected", index: false },
  "account/orders": { name: "AccountPage", title: "سفارش‌های من", guard: "protected", index: false },
  "account/trips": { name: "AccountTrips", title: "سفرهای من", guard: "protected", index: false },
  "account/passengers": { name: "AccountPage", title: "مسافران ذخیره‌شده", guard: "protected", index: false },
  "account/wallet": { name: "AccountPage", title: "کیف پول", guard: "protected", index: false },
  "account/refunds": { name: "AccountPage", title: "استردادها", guard: "protected", index: false },
  "account/favorites": { name: "AccountPage", title: "علاقه‌مندی‌ها", guard: "protected", index: false },
  "account/notifications": { name: "AccountPage", title: "اعلان‌ها", guard: "protected", index: false },
  "account/support": { name: "AccountPage", title: "پشتیبانی حساب", guard: "protected", index: false },
  "account/profile": { name: "AccountPage", title: "پروفایل", guard: "protected", index: false },
  "account/visa": { name: "AccountPage", title: "درخواست‌های ویزا", guard: "protected", index: false },
  cart: { name: "CheckoutReview", title: "سبد و مرور سفارش", index: false },
};

export const dynamicParams = false;

export function generateStaticParams() {
  const paths = [
    ...Object.keys(staticRoutes),
    ...travelRoutes.map((item) => `routes/${item.id}`),
    ...products.map((item) => `shop/${item.id}`),
    ...tours.map((item) => `tours/${item.slug}`),
    ...ziyaratOffers.map((item) => `ziyarat/${item.slug}`),
    ...visaCountries.flatMap((item) => [`visa/${item.slug}`, `visa/${item.slug}/apply`]),
  ];

  return [...new Set(paths)].map((path) => ({ legacy: path.split("/") }));
}

function resolveRoute(path: string): Entry | undefined {
  if (staticRoutes[path]) return staticRoutes[path];
  if (/^routes\/[^/]+$/.test(path)) return { name: "RouteDetailPage", title: "برنامه مسیر سفر", index: true };
  if (/^shop\/[^/]+$/.test(path)) return { name: "ProductDetailPage", title: "محصول سفر", index: false };
  if (/^tours\/[^/]+$/.test(path)) return { name: "TourDetail", title: "جزئیات تور", index: false };
  if (/^ziyarat\/[^/]+$/.test(path)) return { name: "ZiyaratDetail", title: "جزئیات سفر زیارتی", index: false };
  if (/^visa\/[^/]+\/apply$/.test(path)) return { name: "VisaApply", title: "درخواست ویزا", guard: "protected", index: false };
  if (/^visa\/[^/]+$/.test(path)) return { name: "VisaCountry", title: "راهنمای ویزای کشور", description: "این صفحه تا تکمیل محتوای منبع‌دار و مقررات رسمی از ایندکس خارج است.", index: false };
  return undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ legacy: string[] }> }): Promise<Metadata> {
  const { legacy } = await params;
  const path = legacy.join("/");
  const entry = resolveRoute(path);
  if (!entry) notFound();
  if (entry.index) return createMetadata({ title: entry.title, description: entry.description || `${entry.title} در کیاشی؛ اطلاعات کاربردی برای برنامه‌ریزی بهتر سفر.`, path: `/${path}`, index: true });
  return privateMetadata(entry.title, entry.description);
}

export default async function LegacyRoute({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const entry = resolveRoute(legacy.join("/"));
  if (!entry) notFound();
  return <LegacyPage name={entry.name} props={entry.props} guard={entry.guard} />;
}
