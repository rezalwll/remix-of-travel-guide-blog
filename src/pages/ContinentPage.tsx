import { ArrowLeft, BookOpenText, CalendarRange, ChevronLeft, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getContinentBySlug } from "@/data/destinations";
import {
  continentDescriptionsFa,
  continentFa,
  countryFa,
} from "@/data/destinationLocale";
import NotFound from "./NotFound";

const ContinentPage = () => {
  const { continent: slug } = useParams<{ continent: string }>();
  const continent = getContinentBySlug(slug || "");
  if (!continent) return <NotFound />;

  return (
    <Layout>
      <main className="pb-20">
        <section className="relative min-h-[420px] overflow-hidden text-white">
          <img src={continent.heroImage} alt={continentFa(continent.name)} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[hsl(213_27%_12%/0.92)] via-[hsl(213_27%_12%/0.65)] to-transparent" />
          <div className="container-page relative flex min-h-[420px] flex-col justify-between py-8">
            <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-white/65">
              <Link to="/" className="hover:text-white">خانه</Link><ChevronLeft className="size-3.5" />
              <Link to="/destinations" className="hover:text-white">مقصدها</Link><ChevronLeft className="size-3.5" />
              <span className="text-white">{continentFa(continent.name)}</span>
            </nav>
            <div className="max-w-2xl pb-8">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
                <MapPin className="size-4 text-accent" /> {continent.countries.length.toLocaleString("fa-IR")} کشور برای کشف
              </span>
              <h1 className="text-4xl font-black sm:text-6xl">راهنمای سفر به {continentFa(continent.name)}</h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/78 sm:text-base">{continentDescriptionsFa[continent.name]}</p>
            </div>
          </div>
        </section>

        <section className="container-page -mt-8 relative z-10">
          <div className="premium-panel grid gap-px overflow-hidden bg-border p-0 sm:grid-cols-3">
            {[
              { icon: MapPin, title: `${continent.countries.length.toLocaleString("fa-IR")} کشور`, text: "انتخاب‌های متنوع برای هر سبک سفر" },
              { icon: BookOpenText, title: `${continent.countries.reduce((total, country) => total + country.articles.length, 0).toLocaleString("fa-IR")} راهنما`, text: "ایده‌ها و نکته‌های برنامه‌ریزی" },
              { icon: CalendarRange, title: "فصل مناسب", text: "بررسی زمان پیشنهادی هر مقصد" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 bg-card p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-5" /></span>
                <div><p className="text-sm font-extrabold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page pt-16">
          <div className="mb-8 max-w-2xl">
            <span className="section-eyebrow">انتخاب کشور</span>
            <h2 className="page-heading">مقصدها را کنار هم ببین</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">اطلاعات هر کشور را مرور کن و از همان صفحه وارد مسیر رزرو خدمات سفر شو.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {continent.countries.map((country) => (
              <Link key={country.slug} to={`/destinations/${continent.slug}/${country.slug}`} className="image-card group">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={country.heroImage} alt={countryFa(country.name)} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  <span className="absolute end-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {country.articles.length.toLocaleString("fa-IR")} راهنما
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black">{countryFa(country.name)}</h3>
                    <ArrowLeft className="size-5 text-primary transition group-hover:-translate-x-1" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">برای فصل مناسب، منطقه‌های پیشنهادی و ایده‌های سفر به {countryFa(country.name)} آماده شو.</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default ContinentPage;
