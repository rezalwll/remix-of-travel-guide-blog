"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { GuestRoute, ProtectedRoute } from "@/components/auth/ProtectedRoute";

const pages = {
  Destinations: dynamic(() => import("@/legacy-pages/Destinations")),
  ContinentPage: dynamic(() => import("@/legacy-pages/ContinentPage")),
  Routes: dynamic(() => import("@/legacy-pages/Routes")),
  RouteDetailPage: dynamic(() => import("@/legacy-pages/RouteDetailPage")),
  Shop: dynamic(() => import("@/legacy-pages/Shop")),
  ProductDetailPage: dynamic(() => import("@/legacy-pages/ProductDetailPage")),
  ServiceOverview: dynamic(() => import("@/legacy-pages/ServiceOverview")),
  HelpCenter: dynamic(() => import("@/legacy-pages/HelpCenter")),
  TrackOrder: dynamic(() => import("@/legacy-pages/TrackOrder")),
  PublicInfoPage: dynamic(() => import("@/legacy-pages/PublicInfoPage")),
  FlightSearchResults: dynamic(() => import("@/legacy-pages/FlightSearchResults")),
  HotelSearchResults: dynamic(() => import("@/legacy-pages/HotelSearchResults")),
  HotelDetail: dynamic(() => import("@/legacy-pages/HotelDetail")),
  HotelGuests: dynamic(() => import("@/legacy-pages/HotelGuests")),
  ToursPage: dynamic(() => import("@/legacy-pages/ToursPage")),
  TourDetail: dynamic(() => import("@/legacy-pages/TourDetail")),
  ZiyaratPage: dynamic(() => import("@/legacy-pages/ZiyaratPage")),
  ZiyaratDetail: dynamic(() => import("@/legacy-pages/ZiyaratDetail")),
  ExperienceTravelers: dynamic(() => import("@/legacy-pages/ExperienceTravelers")),
  SecondaryServicePage: dynamic(() => import("@/legacy-pages/SecondaryServicePage")),
  SecondaryPassengers: dynamic(() => import("@/legacy-pages/SecondaryPassengers")),
  VisaCenter: dynamic(() => import("@/legacy-pages/VisaCenter")),
  VisaCountry: dynamic(() => import("@/legacy-pages/VisaCountry")),
  VisaApply: dynamic(() => import("@/legacy-pages/VisaApply")),
  CheckoutPassengers: dynamic(() => import("@/legacy-pages/CheckoutPassengers")),
  CheckoutReview: dynamic(() => import("@/legacy-pages/CheckoutReview")),
  CheckoutPayment: dynamic(() => import("@/legacy-pages/CheckoutPayment")),
  MockGateway: dynamic(() => import("@/legacy-pages/MockGateway")),
  CheckoutResult: dynamic(() => import("@/legacy-pages/CheckoutResult")),
  OrderDetail: dynamic(() => import("@/legacy-pages/OrderDetail")),
  Login: dynamic(() => import("@/legacy-pages/AuthPages").then((module) => module.Login)),
  Register: dynamic(() => import("@/legacy-pages/AuthPages").then((module) => module.Register)),
  Otp: dynamic(() => import("@/legacy-pages/AuthPages").then((module) => module.Otp)),
  ForgotPassword: dynamic(() => import("@/legacy-pages/AuthPages").then((module) => module.ForgotPassword)),
  AccountPage: dynamic(() => import("@/legacy-pages/AccountPage")),
  AccountTrips: dynamic(() => import("@/legacy-pages/AccountTrips")),
} as const;

export type LegacyPageName = keyof typeof pages;

function LegacyPageContent({ name, props = {}, guard }: { name: LegacyPageName; props?: Record<string, unknown>; guard?: "protected" | "guest" }) {
  const Component = pages[name] as React.ComponentType<Record<string, unknown>>;
  const content = <Component {...props} />;
  if (guard === "protected") return <ProtectedRoute>{content}</ProtectedRoute>;
  if (guard === "guest") return <GuestRoute>{content}</GuestRoute>;
  return content;
}

export default function LegacyPage(props: { name: LegacyPageName; props?: Record<string, unknown>; guard?: "protected" | "guest" }) {
  return <Suspense fallback={<main className="container-page py-10" role="status"><span className="sr-only">در حال بارگذاری صفحه</span><div className="h-64 animate-pulse rounded-2xl bg-muted" /></main>}><LegacyPageContent {...props} /></Suspense>;
}
