import {
  ArrowLeft,
  BadgeCheck,
  Compass,
  Headphones,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import BookingSearch from "@/components/home/BookingSearch";
import {
  ArticlesSection,
  DestinationsSection,
  HotelsSection,
  OffersSection,
  RecentSearches,
  RoutesSection,
  ServicesSection,
  SupportSection,
  ToursSection,
  TrustSection,
  ZiyaratSection,
} from "@/components/home/HomeSections";
import heroImage from "@/assets/hero-kish-premium.png";

const trustItems = [
  { icon: ShieldCheck, title: "پرداخت امن", text: "فرآیند شفاف و قابل پیگیری" },
  { icon: BadgeCheck, title: "قیمت روشن", text: "جزئیات هزینه پیش از پرداخت" },
  { icon: Headphones, title: "پشتیبانی سفر", text: "قبل و بعد از خرید کنار شما" },
  { icon: WalletCards, title: "مدیریت یکپارچه", text: "سفارش‌ها و کیف پول در یک حساب" },
];

const Index = () => (
  <Layout>
    <main>
      <section className="relative min-h-[600px] overflow-hidden pb-32 pt-14 sm:min-h-[660px] sm:pb-40 sm:pt-20 lg:min-h-[690px]">
        <img
          src={heroImage}
          alt="نمای ساحلی کیش برای معرفی خدمات سفر کی‌آشی"
          className="absolute inset-0 size-full object-cover object-[38%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(213_33%_10%/0.2),hsl(213_33%_10%/0.42)_42%,hsl(213_33%_9%/0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[hsl(213_30%_12%/0.7)] to-transparent" />

        <div className="container-page relative flex min-h-[430px] items-center sm:min-h-[470px]">
          <div className="max-w-[670px] text-white">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/[0.15] px-3.5 py-2 text-xs font-bold backdrop-blur-md">
              <Compass className="size-4 text-accent" />
              از جست‌وجو تا پیگیری، یک تجربهٔ ساده
            </span>
            <h1 className="text-[2.55rem] font-black leading-[1.28] sm:text-6xl lg:text-[4.45rem]">
              سفر را انتخاب کن،
              <br />
              <span className="text-accent">نگرانی‌اش با ما</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm font-medium leading-8 text-white/[0.78] sm:text-lg">
              پرواز، هتل، تور و خدمات مقصد را با اطلاعات روشن مقایسه کن؛ سپس همهٔ جزئیات سفر را از یک‌جا مدیریت کن.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link to="/#booking" className="primary-cta bg-white text-foreground shadow-black/[0.15] hover:bg-white/90">
                <Search className="size-4" /> شروع جست‌وجو
              </Link>
              <Link to="/destinations" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/[0.08] px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/[0.15]">
                کشف مقصدها <ArrowLeft className="size-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/70">
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-accent" /> پروازهای داخلی و خارجی</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-secondary" /> اقامت و تجربهٔ مقصد</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" /> پیگیری آنلاین سفارش</span>
            </div>
          </div>
        </div>
      </section>

      <BookingSearch />
      <RecentSearches />

      <section className="container-page pb-5 pt-2 sm:pb-8">
        <h2 className="sr-only">مزیت‌های رزرو با کی‌آشی</h2>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/70 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 bg-card px-4 py-4 sm:px-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <OffersSection />
      <RoutesSection />
      <ToursSection />
      <HotelsSection />
      <DestinationsSection />
      <ZiyaratSection />
      <ServicesSection />
      <TrustSection />
      <ArticlesSection />
      <SupportSection />
    </main>
  </Layout>
);

export default Index;
