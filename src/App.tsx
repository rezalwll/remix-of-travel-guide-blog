import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Placeholder from "./pages/Placeholder";
const FlightSearchResults = lazy(() => import("./pages/FlightSearchResults"));

const Destinations = lazy(() => import("./pages/Destinations"));
const ContinentPage = lazy(() => import("./pages/ContinentPage"));
const CountryPage = lazy(() => import("./pages/CountryPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const RouteDetailPage = lazy(() => import("./pages/RouteDetailPage"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:continent" element={<ContinentPage />} />
            <Route path="/destinations/:continent/:country" element={<CountryPage />} />
            <Route path="/article/:articleId" element={<ArticlePage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:routeId" element={<RouteDetailPage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:productId" element={<ProductDetailPage />} />
            {[
              "/flights", "/flights/:id", "/hotels", "/hotels/search", "/hotels/:id",
              "/tours", "/tours/:id", "/ziyarat", "/ziyarat/:id", "/trains", "/trains/search", "/buses", "/buses/search",
              "/visa", "/visa/:country", "/insurance", "/cip", "/destinations/:slug", "/blog", "/blog/:slug",
              "/auth/login", "/auth/register", "/auth/otp", "/auth/forgot-password", "/cart", "/checkout/passengers", "/checkout/review", "/checkout/payment", "/checkout/result",
              "/account", "/account/orders", "/account/orders/:id", "/account/passengers", "/account/wallet", "/account/refunds", "/account/favorites", "/account/notifications", "/account/support", "/account/profile", "/support", "/faq", "/terms",
            ].map((path) => <Route key={path} path={path} element={<Placeholder />} />)}
            <Route path="/flights/search" element={<FlightSearchResults />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
