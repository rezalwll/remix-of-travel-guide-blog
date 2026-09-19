import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  CalendarDays,
  Car,
  CircleHelp,
  Compass,
  Headphones,
  Hotel as HotelIcon,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Umbrella,
  UsersRound,
  Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  featuredHotels,
  featuredTours,
  offers,
  popularDestinations,
  popularRoutes,
  travelArticles,
  ziyaratOptions,
} from "@/data/homepage";
import type { Hotel, Tour } from "@/types/travel";
import { formatPrice } from "@/utils/flight";

const SectionHeading = ({
  eyebrow,
  title,
  description,
  href,
  action = "مشاهده همه",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) => (
  <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
    <div>
      {eyebrow && <p className="section-eyebrow"><Sparkles className="size-3.5" />{eyebrow}</p>}
      <h2 className="text-[1.65rem] font-black leading-tight sm:text-3xl lg:text-[2rem]">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>}
    </div>
    {href && (
      <Link to={href} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-extrabold text-secondary transition hover:bg-secondary/5 hover:text-primary sm:px-3 sm:text-sm">
        {action}<ArrowLeft className="size-4" />
      </Link>
    )}
  </div>
);

export const RecentSearches = () => (
  <section className="container-page pb-4 pt-7 sm:pt-9" aria-label="جست‌وجوهای اخیر">
    <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-xs font-extrabold text-muted-foreground">ادامهٔ جست‌وجو</span>
      <Link to="/flights/search?from=IKA&to=IST&departure=2026-10-14&adults=2&trip=oneway" className="soft-chip shrink-0 transition hover:border-secondary/50 hover:text-secondary">
        <Plane className="size-3.5 text-secondary" /> تهران <span>←</span> استانبول <span className="font-medium text-muted-foreground">۲ مسافر</span>
      </Link>
      <Link to="/hotels/search?destination=KIH&checkin=2026-10-14&checkout=2026-10-17&adults=2&rooms=1" className="soft-chip shrink-0 transition hover:border-secondary/50 hover:text-secondary">
        <HotelIcon className="size-3.5 text-secondary" /> هتل‌های کیش <span className="font-medium text-muted-foreground">۳ شب</span>
      </Link>
      <Link to="/track-order" className="soft-chip shrink-0 border-primary/[0.15] bg-primary/5 text-primary transition hover:bg-primary/10">
        پیگیری سفارش <ArrowLeft className="size-3.5" />
      </Link>
    </div>
  </section>
);

export const OffersSection = () => (
  <section className="container-page section-space pt-12">
    <SectionHeading eyebrow="انتخاب سردبیر سفر" title="این هفته کجا برویم؟" description="پیشنهادهایی برای چند روز فاصله گرفتن از روزمرگی؛ از ساحل آرام تا شهرهای پرانرژی." href="/tours" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_0.85fr_0.85fr]">
      {offers.map((offer, index) => (
        <Link key={offer.id} to={offer.href} className={`group relative overflow-hidden rounded-[1.5rem] ${index === 0 ? "min-h-[330px] md:col-span-2 lg:col-span-1" : "min-h-[260px] lg:min-h-[330px]"}`}>
          <img src={offer.image} alt={offer.title} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-6">
            <span className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${offer.accent}`}><Sparkles className="size-3" /> پیشنهاد منتخب</span>
            <div>
              <h3 className="text-xl font-black sm:text-2xl">{offer.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/[0.78]">{offer.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold">دیدن پیشنهاد <ArrowLeft className="size-4 transition group-hover:-translate-x-1" /></span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export const RoutesSection = () => (
  <section className="border-y border-border/60 bg-muted/[0.45]">
    <div className="container-page section-space">
      <SectionHeading eyebrow="قیمت‌های شروع برای برنامه‌ریزی" title="مسیرهای محبوب مسافران" description="قیمت‌ها نمونه‌اند و برای نمایش تجربهٔ جست‌وجو استفاده می‌شوند؛ مبلغ نهایی در نتایج بررسی می‌شود." href="/flights" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popularRoutes.map((route, index) => (
          <Link key={route.id} to={`/flights/search?from=${route.from}&to=${route.to}`} className="group premium-panel flex min-h-28 items-center justify-between gap-4 p-4 transition hover:-translate-y-1 hover:border-secondary/[0.35] sm:p-5">
            <div className="flex items-center gap-3">
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${index % 3 === 0 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}><Plane className="size-5 -rotate-45" /></span>
              <div><p className="text-base font-black">{route.from} <span className="mx-1 text-secondary">←</span> {route.to}</p><p className="mt-1 text-xs text-muted-foreground">{route.hint}</p></div>
            </div>
            <div className="shrink-0 text-end"><p className="text-xs font-extrabold text-primary">{route.price}</p><ArrowLeft className="mt-2 ms-auto size-4 text-muted-foreground transition group-hover:-translate-x-1 group-hover:text-secondary" /></div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const TourCard = ({ tour }: { tour: Tour }) => {
  const departure = tour.dates[0];
  return (
    <Link to={`/tours/${tour.id}`} className="image-card group flex h-full flex-col">
      <div className="relative aspect-[1.45] overflow-hidden">
        <img src={tour.imageUrl} alt={tour.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <span className="absolute start-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-extrabold shadow-sm">{tour.durationDays} روز</span>
        {departure && departure.remainingCapacity <= 8 && <span className="absolute end-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">{departure.remainingCapacity} ظرفیت باقی‌مانده</span>}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold text-secondary">{tour.destination}</p>
        <h3 className="mt-1.5 text-lg font-black">{tour.title}</h3>
        {departure && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> حرکت {departure.startDate}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">{tour.services.slice(0, 3).map((service) => <span key={service.title} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{service.title}</span>)}</div>
        <div className="mt-auto flex items-end justify-between border-t border-border/80 pt-4"><div><span className="text-[10px] text-muted-foreground">شروع قیمت برای هر نفر</span><p className="mt-0.5 text-lg font-black text-primary">{formatPrice(departure?.price ?? 0)}</p></div><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"><ArrowLeft className="size-4" /></span></div>
      </div>
    </Link>
  );
};

export const ToursSection = () => (
  <section className="container-page section-space">
    <SectionHeading eyebrow="برنامه‌ریزی‌شده و آماده" title="تورهای منتخب" description="پکیج‌های متنوع برای سفرهای شهری، ساحلی و زیارتی با جزئیات قابل مقایسه." href="/tours" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
  </section>
);

const HotelCard = ({ hotel }: { hotel: Hotel }) => {
  const amount = hotel.rooms[0]?.rates[0]?.amount ?? 2_400_000;
  return (
    <Link to={`/hotels/${hotel.id}`} className="image-card group flex h-full flex-col">
      <div className="relative aspect-[1.5] overflow-hidden">
        <img src={hotel.imageUrl} alt={hotel.name} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-black text-warning shadow-sm"><Star className="size-3 fill-current" />{hotel.rating.toLocaleString("fa-IR")}</span>
        <span className="absolute bottom-3 end-3 rounded-full bg-black/[0.55] px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">پیشنهاد کی‌آشی</span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-black sm:text-lg">{hotel.name}</h3><p className="mt-1 text-xs text-muted-foreground">{hotel.city}، {hotel.country}</p></div><span className="shrink-0 text-[10px] text-muted-foreground">{hotel.reviewCount.toLocaleString("fa-IR")} نظر</span></div>
        <div className="mt-3 flex flex-wrap gap-1.5">{hotel.amenities.slice(0, 3).map((amenity) => <span key={amenity.id} className="inline-flex items-center gap-1 rounded-full bg-secondary/[0.08] px-2.5 py-1 text-[10px] font-semibold text-secondary"><Wifi className="size-3" />{amenity.name}</span>)}</div>
        <div className="mt-auto flex items-end justify-between border-t border-border/80 pt-4"><div><span className="text-[10px] text-muted-foreground">هر شب از</span><p className="mt-0.5 text-lg font-black text-primary">{formatPrice(amount)}</p></div><span className="text-[10px] font-semibold text-success">امکان بررسی نرخ‌های مختلف</span></div>
      </div>
    </Link>
  );
};

export const HotelsSection = () => (
  <section className="border-y border-border/60 bg-muted/[0.45]"><div className="container-page section-space"><SectionHeading eyebrow="اقامت متناسب با سبک سفر" title="هتل‌های پیشنهادی" description="از اقامت شهری تا استراحت کنار ساحل؛ نرخ‌ها و امکانات را یک‌جا ببین." href="/hotels" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}</div></div></section>
);

export const DestinationsSection = () => (
  <section className="container-page section-space">
    <SectionHeading eyebrow="مقصدت را با حال‌وهوایش انتخاب کن" title="محبوب‌ترین مقصدها" description="راهنما، اقامت و تجربه‌های هر مقصد را پیش از تصمیم ببین." href="/destinations" />
    <div className="grid auto-rows-[210px] grid-cols-2 gap-3 sm:auto-rows-[240px] lg:grid-cols-4 lg:grid-rows-2">
      {popularDestinations.map((destination, index) => (
        <Link key={destination.id} to={`/destinations/${destination.slug}`} className={`group relative overflow-hidden rounded-[1.35rem] ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
          <img src={destination.imageUrl} alt={destination.name} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-4 text-white sm:p-5"><p className="text-[10px] font-bold text-white/70">{destination.country}</p><div className="flex items-end justify-between gap-2"><div><h3 className={`${index === 0 ? "text-2xl sm:text-3xl" : "text-lg"} mt-1 font-black`}>{destination.name}</h3><p className="mt-1 max-w-xs text-xs leading-5 text-white/70">{destination.description}</p></div><ArrowUpLeft className="size-5 shrink-0 transition group-hover:-translate-y-1 group-hover:-translate-x-1" /></div></div>
        </Link>
      ))}
    </div>
  </section>
);

export const ZiyaratSection = () => (
  <section className="relative overflow-hidden bg-[hsl(177_31%_18%)] text-white">
    <div className="absolute -start-20 -top-28 size-80 rounded-full border-[50px] border-white/[0.03]" />
    <div className="container-page section-space relative">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-eyebrow text-accent"><Compass className="size-3.5" />سفر با آرامش و احترام</p><h2 className="text-3xl font-black">سفرهای زیارتی</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/[0.65]">برنامه‌های نمونه برای زیارت مشهد، نجف و کربلا؛ با جزئیات مسیر، اقامت و زمان حرکت.</p></div><Link to="/ziyarat" className="inline-flex items-center gap-1 text-sm font-extrabold text-accent">همهٔ برنامه‌ها <ArrowLeft className="size-4" /></Link></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ziyaratOptions.map((option) => <Link key={option.id} to="/ziyarat" className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/10"><div className="mb-6 flex items-center justify-between"><Compass className="size-5 text-accent" /><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/70">{option.type}</span></div><h3 className="text-lg font-black">{option.title}</h3><p className="mt-2 text-xs text-white/60">{option.duration} · {option.date}</p><p className="mt-5 text-sm font-extrabold text-accent">{option.price}</p></Link>)}</div>
    </div>
  </section>
);

const services = [
  { title: "ویزا", text: "راهنمایی و پیگیری درخواست", icon: MapPinned, to: "/visa" },
  { title: "بیمه سفر", text: "پوشش متناسب با مقصد", icon: Umbrella, to: "/insurance" },
  { title: "CIP فرودگاهی", text: "عبور آرام‌تر از فرودگاه", icon: Plane, to: "/cip" },
  { title: "ترانسفر", text: "رفت‌وآمد در مقصد", icon: Car, to: "/transfers" },
  { title: "تجربه شهری", text: "مقصد را متفاوت ببین", icon: Compass, to: "/experiences" },
  { title: "پشتیبانی سفر", text: "قبل و بعد از خرید", icon: Headphones, to: "/support" },
];

export const ServicesSection = () => (
  <section className="container-page section-space">
    <SectionHeading eyebrow="جزئیات کوچک، سفر راحت‌تر" title="خدمات مکمل سفر" description="هرآنچه پیش و پس از رزرو اصلی نیاز داری، از ویزا تا ترانسفر مقصد." />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{services.map(({ title, text, icon: Icon, to }) => <Link key={title} to={to} className="group rounded-2xl border border-border/80 bg-card p-4 transition duration-300 hover:-translate-y-1 hover:border-secondary/[0.35] hover:shadow-lg sm:p-5"><span className="grid size-11 place-items-center rounded-2xl bg-secondary/10 text-secondary transition group-hover:bg-secondary group-hover:text-white"><Icon className="size-5" /></span><h3 className="mt-4 text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></Link>)}</div>
  </section>
);

const trustFeatures = [
  { icon: ShieldCheck, title: "رزرو ساده و شفاف", text: "هزینه‌ها و شرایط مهم را پیش از پرداخت واضح می‌بینی." },
  { icon: UsersRound, title: "پشتیبانی در مسیر", text: "برای پرسش‌های قبل و بعد از خرید، مسیر ارتباط مشخص است." },
  { icon: BadgeCheck, title: "مقایسهٔ قابل فهم", text: "گزینه‌ها را با قیمت، قوانین و امکانات کنار هم ببین." },
  { icon: CircleHelp, title: "راهنمای تصمیم‌گیری", text: "محتوای کاربردی کمک می‌کند آگاهانه‌تر انتخاب کنی." },
];

export const TrustSection = () => (
  <section className="border-y border-primary/10 bg-primary/[0.035]"><div className="container-page section-space"><div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-center"><div><p className="section-eyebrow"><ShieldCheck className="size-3.5" />قول ما به مسافر</p><h2 className="text-3xl font-black leading-tight">تصمیم روشن، سفر آسوده‌تر</h2><p className="mt-4 max-w-md text-sm leading-8 text-muted-foreground">کی‌آشی اطلاعات مهم رزرو و مسیر پیگیری را در یک تجربهٔ منسجم کنار هم می‌آورد تا چیزی میان صفحه‌ها گم نشود.</p><Link to="/about" className="secondary-cta mt-6">بیشتر دربارهٔ کی‌آشی <ArrowLeft className="size-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2">{trustFeatures.map(({ icon: Icon, title, text }, index) => <div key={title} className="premium-panel p-5"><Icon className={`size-6 ${index % 2 ? "text-primary" : "text-secondary"}`} /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></div></section>
);

export const ArticlesSection = () => (
  <section className="container-page section-space">
    <SectionHeading eyebrow="پیش از حرکت بخوان" title="مجلهٔ سفر کی‌آشی" description="راهنماهای کوتاه و کاربردی برای انتخاب مقصد، رزرو بهتر و سفر راحت‌تر." href="/blog" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{travelArticles.map((article) => <Link key={article.id} to={`/blog/${article.slug}`} className="image-card group"><div className="aspect-[1.35] overflow-hidden"><img src={article.image} alt={article.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" /></div><div className="p-4 sm:p-5"><p className="text-xs font-extrabold text-primary">{article.category}</p><h3 className="mt-2 line-clamp-2 font-black leading-7">{article.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">{article.excerpt}</p><div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground"><span>{article.readingTime} مطالعه</span><ArrowLeft className="size-4 transition group-hover:-translate-x-1 group-hover:text-primary" /></div></div></Link>)}</div>
  </section>
);

export const SupportSection = () => (
  <section className="container-page pb-16 sm:pb-24">
    <div className="relative overflow-hidden rounded-[1.6rem] bg-secondary p-7 text-white shadow-xl shadow-secondary/[0.15] sm:p-10">
      <div className="absolute -end-10 -top-20 size-56 rounded-full border-[30px] border-white/10" />
      <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-white/70">همراهت هستیم</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">برای برنامه‌ریزی یا پیگیری سؤال داری؟</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">راهنماهای سریع را بخوان یا از حساب کاربری یک گفت‌وگوی پشتیبانی بساز.</p></div><div className="flex shrink-0 flex-wrap gap-2"><Link to="/support" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-secondary transition hover:bg-white/90"><Headphones className="size-4" /> پشتیبانی</Link><Link to="/faq" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-extrabold transition hover:bg-white/10"><CircleHelp className="size-4" /> مرکز راهنما</Link></div></div>
    </div>
  </section>
);
