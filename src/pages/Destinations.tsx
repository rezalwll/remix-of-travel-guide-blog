import { ArrowLeft, Compass, MapPinned, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { continents } from "@/data/destinations";
import {
  continentDescriptionsFa,
  continentFa,
  countryFa,
} from "@/data/destinationLocale";

const Destinations = () => {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("fa");
  const filtered = useMemo(
    () =>
      continents
        .map((continent) => ({
          ...continent,
          countries: continent.countries.filter((country) =>
            `${country.name} ${countryFa(country.name)}`
              .toLocaleLowerCase("fa")
              .includes(normalized),
          ),
        }))
        .filter(
          (continent) =>
            !normalized ||
            continent.countries.length > 0 ||
            `${continent.name} ${continentFa(continent.name)}`
              .toLocaleLowerCase("fa")
              .includes(normalized),
        ),
    [normalized],
  );

  return (
    <Layout>
      <main className="pb-20">
        <section className="relative isolate overflow-hidden bg-earth-dark py-16 text-white sm:py-24">
          <img
            src="/world-map.jpg"
            alt="نقشه جهان برای انتخاب مقصد سفر"
            className="absolute inset-0 -z-20 size-full object-cover opacity-25"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[hsl(213_27%_15%/0.96)] via-[hsl(213_27%_15%/0.86)] to-[hsl(180_100%_22%/0.68)]" />
          <div className="container-page">
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
                <Compass className="size-4 text-accent" /> الهام برای سفر بعدی
              </span>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">مقصدی متناسب با حال‌وهوایت پیدا کن</h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                مقصدها را بر اساس قاره مرور کن، راهنماهای کوتاه را بخوان و بعد برای پرواز، اقامت یا تور جست‌وجو را ادامه بده.
              </p>
              <label className="mt-7 flex h-14 max-w-xl items-center gap-3 rounded-2xl border border-white/20 bg-white px-4 text-foreground shadow-xl">
                <Search className="size-5 shrink-0 text-secondary" />
                <span className="sr-only">جست‌وجوی مقصد</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="نام کشور یا قاره"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-normal"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="container-page -mt-7 relative z-10">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:grid-cols-3">
            {[
              [MapPinned, `${continents.reduce((total, item) => total + item.countries.length, 0).toLocaleString("fa-IR")} کشور`, "برای مرور و الهام"],
              [Sparkles, "راهنمای کوتاه", "اطلاعات کاربردی و فصل مناسب"],
              [Compass, "اتصال به رزرو", "ادامه مسیر از ایده تا خرید"],
            ].map(([Icon, title, text], index) => (
              <div key={String(title)} className={`flex items-center gap-3 px-5 py-4 ${index ? "border-t border-border sm:border-t-0 sm:border-r" : ""}`}>
                <span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
                  <Icon className="size-5" />
                </span>
                <div><p className="text-sm font-extrabold">{String(title)}</p><p className="text-xs text-muted-foreground">{String(text)}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page pt-14 sm:pt-20">
          <div className="mb-8 max-w-2xl">
            <span className="section-eyebrow">مقصدها بر اساس قاره</span>
            <h2 className="page-heading">از تصویر کلی شروع کن</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">هر کارت یک نقطهٔ شروع روشن برای مقایسهٔ کشورها و ساختن برنامهٔ سفر است.</p>
          </div>
          {filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((continent) => (
                <article key={continent.slug} className="surface-card flex min-h-72 flex-col overflow-hidden">
                  <Link to={`/destinations/${continent.slug}`} className="relative h-36 overflow-hidden">
                    <img src={continent.heroImage} alt={continentFa(continent.name)} className="size-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                      <h2 className="text-2xl font-black">{continentFa(continent.name)}</h2>
                      <span className="text-xs font-bold text-white/75">{continent.countries.length.toLocaleString("fa-IR")} کشور</span>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm leading-7 text-muted-foreground">{continentDescriptionsFa[continent.name]}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {continent.countries.slice(0, 5).map((country) => (
                        <Link key={country.slug} to={`/destinations/${continent.slug}/${country.slug}`} className="soft-chip hover:border-secondary/40 hover:text-secondary">
                          {countryFa(country.name)}
                        </Link>
                      ))}
                    </div>
                    <Link to={`/destinations/${continent.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-primary">
                      مشاهده همه مقصدها <ArrowLeft className="size-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-card py-16 text-center">
              <Search className="mx-auto size-8 text-muted-foreground" />
              <h2 className="mt-4 font-extrabold">مقصدی با این نام پیدا نشد</h2>
              <p className="mt-2 text-sm text-muted-foreground">نام کشور یا قاره را کوتاه‌تر وارد کن.</p>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default Destinations;
