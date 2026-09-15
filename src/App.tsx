import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import { AuthProvider } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute } from "./components/auth/ProtectedRoute";
const FlightSearchResults = lazy(() => import("./pages/FlightSearchResults"));
const HotelSearchResults = lazy(() => import("./pages/HotelSearchResults"));
const HotelDetail = lazy(() => import("./pages/HotelDetail"));
const HotelGuests = lazy(() => import("./pages/HotelGuests"));
const ToursPage = lazy(() => import("./pages/ToursPage"));
const TourDetail = lazy(() => import("./pages/TourDetail"));
const ZiyaratPage = lazy(() => import("./pages/ZiyaratPage"));
const ZiyaratDetail = lazy(() => import("./pages/ZiyaratDetail"));
const ExperienceTravelers = lazy(() => import("./pages/ExperienceTravelers"));
const SecondaryServicePage = lazy(() => import("./pages/SecondaryServicePage"));
const SecondaryPassengers = lazy(() => import("./pages/SecondaryPassengers"));
const VisaCenter = lazy(() => import("./pages/VisaCenter"));
const VisaCountry = lazy(() => import("./pages/VisaCountry"));
const VisaApply = lazy(() => import("./pages/VisaApply"));
const CheckoutPassengers = lazy(() => import("./pages/CheckoutPassengers"));
const CheckoutReview = lazy(() => import("./pages/CheckoutReview"));
const CheckoutPayment = lazy(() => import("./pages/CheckoutPayment"));
const MockGateway = lazy(() => import("./pages/MockGateway"));
const CheckoutResult = lazy(() => import("./pages/CheckoutResult"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
import { Login, Register, Otp, ForgotPassword } from "./pages/AuthPages";
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const PublicInfoPage = lazy(() => import("./pages/PublicInfoPage"));
const ServiceLanding = lazy(() => import("./pages/ServiceLanding"));
const ServiceOverview = lazy(() => import("./pages/ServiceOverview"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const AccountTrips = lazy(() => import("./pages/AccountTrips"));

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
        <AuthProvider>
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
            <Route path="/flights" element={<ServiceOverview kind="flights" />} />
            <Route path="/flights/:id" element={<ServiceOverview kind="flights" />} />
            <Route path="/hotels" element={<ServiceOverview kind="hotels" />} />
            <Route path="/support" element={<HelpCenter />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<HelpCenter />} />
            <Route path="/help/purchase-guide" element={<PublicInfoPage kind="purchase" />} />
            <Route path="/help/refund-guide" element={<PublicInfoPage kind="refund-guide" />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/order-tracking" element={<TrackOrder />} />
            <Route path="/about" element={<PublicInfoPage kind="about" />} />
            <Route path="/contact" element={<PublicInfoPage kind="contact" />} />
            <Route path="/terms" element={<PublicInfoPage kind="terms" />} />
            <Route path="/privacy" element={<PublicInfoPage kind="privacy" />} />
            <Route path="/refund-policy" element={<PublicInfoPage kind="refund" />} />
            <Route path="/licenses" element={<PublicInfoPage kind="licenses" />} />
            <Route path="/business-travel" element={<PublicInfoPage kind="business" />} />
            <Route path="/club" element={<PublicInfoPage kind="club" />} />
            <Route path="/travel-preparation" element={<PublicInfoPage kind="travel-preparation" />} />
            <Route path="/travel-checklist" element={<PublicInfoPage kind="travel-preparation" />} />
            <Route path="/fast-track" element={<ServiceLanding kind="fast-track" />} />
            <Route path="/esim" element={<ServiceLanding kind="esim" />} />
            <Route path="/city-tours" element={<ServiceLanding kind="city-tours" />} />
            <Route path="/experiences" element={<ServiceLanding kind="city-tours" />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogIndex />} />
            <Route path="/flights/search" element={<FlightSearchResults />} />
            <Route path="/hotels/search" element={<HotelSearchResults />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/checkout/hotel-guests" element={<HotelGuests />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/ziyarat" element={<ZiyaratPage />} />
            <Route path="/ziyarat/:id" element={<ZiyaratDetail />} />
            <Route path="/checkout/tour-travelers" element={<ExperienceTravelers type="tour" />} />
            <Route path="/checkout/ziyarat-travelers" element={<ExperienceTravelers type="ziyarat" />} />
            <Route path="/trains/search" element={<SecondaryServicePage type="train" />} />
            <Route path="/buses/search" element={<SecondaryServicePage type="bus" />} />
            <Route path="/trains" element={<SecondaryServicePage type="train" />} />
            <Route path="/buses" element={<SecondaryServicePage type="bus" />} />
            <Route path="/insurance" element={<SecondaryServicePage type="insurance" />} />
            <Route path="/cip" element={<SecondaryServicePage type="cip" />} />
            <Route path="/transfer" element={<SecondaryServicePage type="transfer" />} />
            <Route path="/transfers" element={<SecondaryServicePage type="transfer" />} />
            <Route path="/checkout/secondary-passengers" element={<SecondaryPassengers />} />
            <Route path="/visa" element={<VisaCenter />} />
            <Route path="/visa/:country" element={<VisaCountry />} />
            <Route path="/visa/:country/apply" element={<VisaApply />} />
            <Route path="/checkout/passengers" element={<CheckoutPassengers />} />
            <Route path="/checkout/review" element={<CheckoutReview />} />
            <Route path="/checkout/payment" element={<CheckoutPayment />} />
            <Route path="/checkout/gateway" element={<MockGateway />} />
            <Route path="/checkout/result" element={<CheckoutResult />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/auth/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/auth/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/auth/otp" element={<GuestRoute><Otp /></GuestRoute>} />
            <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/orders" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/trips" element={<ProtectedRoute><AccountTrips /></ProtectedRoute>} />
            <Route path="/account/orders/:id" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/passengers" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/wallet" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/refunds" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/favorites" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/notifications" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/support" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/profile" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/visa" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/cart" element={<CheckoutReview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
