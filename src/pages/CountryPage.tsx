import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Compass,
  Hotel,
  MapPin,
  Plane,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getContinentBySlug, getCountryBySlug } from "@/data/destinations";
import {
  categoryFa,
  continentFa,
  countryFa,
  countryIntroFa,
  monthNamesFa,
} from "@/data/destinationLocale";
import NotFound from "./NotFound";

const CountryPage = () => {
  const { continent: continentSlug, country: countrySlug } = useParams<{
    continent: string;
    country: string;
  }>();
  const continent = getContinentBySlug(continentSlug || "");
  const country = getCountryBySlug(continentSlug || "", countrySlug || "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  if (!country || !continent) return <NotFound />;

  const articles = activeCategory
    ? country.articles.filter((article) => article.category === activeCategory)
    : country.articles;

  return (
    <Layout>
      <main className="pb-20">
        <section className="relative min-h-[470px] overflow-hidden text-white">
          <img src={country.heroImage} alt={countryFa(country.name)} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/45 to-black/15" />
          <div className="container-page relative flex min-h-[470px] flex-col justify-between py-8">
            <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-white/65">
              <Link to="/" className="hover:text-white">خانه</Link><ChevronLeft className="size-3.5" />
              <Link to="/destinations" className="hover:text-white">مقصدها</Link><ChevronLeft className="size-3.5" />
              <Link to={`/destinations/${continent.slug}`} className="hover:text-white">{continentFa(continent.name)}</Link><ChevronLeft className="size-3.5" />
              <span className="text-white">{countryFa(country.name)}</span>
            </nav>
            <div className="max-w-2xl pb-10">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
                <Compass className="size-4 text-accent" /> راهنمای برنامه‌ریزی مقصد
              </span>
              <h1 className="text-5xl font-black sm:text-7xl">{countryFa(country.name)}</h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/80 sm:text-base">{countryIntroFa(country.name)}</p>
            </div>
          </div>
        </section>

        <section className="container-page -mt-9 relative z-10">
          <div className="premium-panel grid gap-px overflow-hidden bg-border p-0 sm:grid-cols-3">
            <div className="flex items-center gap-3 bg-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-5" /></span><div><p className="text-sm font-extrabold">{country.bestMonths.length.toLocaleString("fa-IR")} ماه پیشنهادی</p><p className="text-xs text-muted-foreground">برای انتخاب زمان سفر</p></div></div>
            <div className="flex items-center gap-3 bg-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary"><MapPin className="size-5" /></span><div><p className="text-sm font-extrabold">{(country.regions?.length ?? 0).toLocaleString("fa-IR")} منطقهٔ منتخب</p><p className="text-xs text-muted-foreground">برای ساخت مسیر سفر</p></div></div>
            <div className="flex items-center gap-3 bg-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-accent/20 text-foreground"><Compass className="size-5" /></span><div><p className="text-sm font-extrabold">{country.articles.length.toLocaleString("fa-IR")} ایدهٔ سفر</p><p className="text-xs text-muted-foreground">محتوای الهام‌بخش مقصد</p></div></div>
          </div>
        </section>

        <section className="container-page grid gap-8 py-16 lg:grid-cols-[1fr_21rem]">
          <div>
            <span className="section-eyebrow">شناخت مقصد</span>
            <h2 className="page-heading">پیش از رزرو چه چیزهایی بدانیم؟</h2>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-muted-foreground">{countryIntroFa(country.name)} قیمت‌ها و موجودی سرویس‌ها در بخش جست‌وجو به‌صورت نمایشی ارائه می‌شود و پیش از پرداخت دوباره بررسی خواهد شد.</p>
            {country.regions?.length ? (
              <div className="mt-7">
                <h3 className="text-sm font-extrabold">منطقه‌های پیشنهادی</h3>
                <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
                  {country.regions.map((region) => <span key={region} className="soft-chip">{region}</span>)}
                </div>
              </div>
            ) : null}
          </div>
          <aside className="premium-panel bg-earth-dark p-5 text-white">
            <p className="text-xs font-bold text-accent">آمادهٔ برنامه‌ریزی هستی؟</p>
            <h2 className="mt-2 text-xl font-black">سفر به {countryFa(country.name)}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">پرواز و هتل را جداگانه مقایسه کن یا تورهای آماده را ببین.</p>
            <div className="mt-5 grid gap-2">
              <Link to="/flights" className="primary-cta w-full"><Plane className="size-4" /> جست‌وجوی پرواز</Link>
              <Link to="/hotels" className="secondary-cta w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"><Hotel className="size-4" /> جست‌وجوی هتل</Link>
            </div>
          </aside>
        </section>

        {country.categories?.length ? (
          <section className="border-y border-border bg-muted/45 py-12">
            <div className="container-page">
              <h2 className="text-xl font-black">ایده‌ها بر اساس علاقه</h2>
              <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="دسته‌بندی راهنماها">
                <button type="button" onClick={() => setActiveCategory(null)} className={`soft-chip shrink-0 ${activeCategory === null ? "border-secondary bg-secondary text-white" : ""}`}>همه</button>
                {country.categories.map((category) => (
                  <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`soft-chip shrink-0 ${activeCategory === category ? "border-secondary bg-secondary text-white" : ""}`}>
                    {categoryFa(category)}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="container-page py-16">
          <div className="mb-8">
            <span className="section-eyebrow">مجلهٔ مقصد</span>
            <h2 className="page-heading">برای سفر ایده بگیر</h2>
          </div>
          {articles.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <Link key={article.id} to={`/article/${article.id}`} className="image-card group">
                  <div className="aspect-[16/10] overflow-hidden"><img src={article.image} alt={`راهنمای ${countryFa(country.name)}`} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-secondary">{categoryFa(article.category)}</span>
                    <h3 className="mt-2 text-lg font-black leading-7">{`${(index + 1).toLocaleString("fa-IR")}. راهنمای ${categoryFa(article.category)} در ${countryFa(country.name)}`}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">نکته‌های کاربردی برای دیدنی‌ها، تجربه‌های محلی و برنامه‌ریزی بهتر این بخش از سفر.</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary">مطالعه راهنما <ArrowLeft className="size-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="surface-card py-12 text-center text-sm text-muted-foreground">در این دسته هنوز راهنمایی منتشر نشده است.</div>
          )}
        </section>

        <section className="container-page">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><span className="section-eyebrow">بهترین زمان سفر</span><h2 className="text-2xl font-black">ماه‌های پیشنهادی برای {countryFa(country.name)}</h2></div>
              <p className="max-w-md text-xs leading-6 text-muted-foreground">آب‌وهوا و شلوغی مقصد می‌تواند تغییر کند؛ پیش از خرید، شرایط روز را بررسی کن.</p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
              {monthNamesFa.map((month, index) => {
                const recommended = country.bestMonths.includes(index + 1);
                return <span key={month} className={`grid min-h-11 place-items-center rounded-xl border px-2 text-xs font-bold ${recommended ? "border-secondary bg-secondary/10 text-secondary" : "border-border text-muted-foreground"}`}>{month}</span>;
              })}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default CountryPage;
