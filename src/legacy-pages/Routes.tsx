import { ArrowLeft, CalendarRange, Compass, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { travelRoutes } from "@/data/routes";

const Routes = () => (
  <Layout>
    <main className="pb-20">
      <section className="relative isolate overflow-hidden bg-earth-dark py-16 text-white sm:py-24">
        <img src="/hero-camping.jpg" alt="مسیر جاده‌ای برای برنامه سفر" className="absolute inset-0 -z-20 size-full object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[hsl(213_27%_12%/0.96)] via-[hsl(213_27%_12%/0.82)] to-[hsl(180_100%_26%/0.55)]" />
        <div className="container-page">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur"><Compass className="size-4 text-accent" /> مسیرهای پیشنهادی سفر</span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">برای روزهای سفرت یک نقشهٔ روشن داشته باش</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-white/75 sm:text-base">مسیرهای آماده با ترتیب شهرها، زمان پیشنهادی و برآورد نمایشی بودجه؛ برای الهام و شروع برنامه‌ریزی، نه جایگزین بررسی نهایی.</p>
        </div>
      </section>

      <section className="container-page -mt-7 relative z-10">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:grid-cols-3">
          {[{ icon: CalendarRange, title: "برنامهٔ روزبه‌روز", text: "ریتم متعادل و زمان آزاد" }, { icon: MapPin, title: "جابه‌جایی روشن", text: "ترتیب منطقی مقصدها" }, { icon: ShieldCheck, title: "بودجهٔ شفاف", text: "برآورد نمایشی و قابل تغییر" }].map(({ icon: Icon, title, text }, index) => (
            <div key={title} className={`flex items-center gap-3 px-5 py-4 ${index ? "border-t border-border sm:border-r sm:border-t-0" : ""}`}><span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-5" /></span><div><p className="text-sm font-extrabold">{title}</p><p className="text-xs text-muted-foreground">{text}</p></div></div>
          ))}
        </div>
      </section>

      <section className="container-page pt-16 sm:pt-20">
        <div className="mb-9 max-w-2xl"><span className="section-eyebrow">مسیرهای منتخب</span><h2 className="page-heading">از ایده تا برنامهٔ قابل اجرا</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">هر مسیر یک چارچوب پیشنهادی است و می‌توانی خدمات سفر را جداگانه مطابق تاریخ خودت رزرو کنی.</p></div>
        <div className="grid gap-6 lg:grid-cols-2">
          {travelRoutes.map((route, index) => (
            <article key={route.id} className={`image-card group ${index === 0 ? "lg:col-span-2 lg:grid lg:grid-cols-[1.15fr_.85fr]" : ""}`}>
              <Link to={`/routes/${route.id}`} className={`relative block overflow-hidden ${index === 0 ? "min-h-72" : "aspect-[16/9]"}`}>
                <img src={route.image} alt={route.title} className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" loading={index ? "lazy" : "eager"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className="absolute end-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-foreground shadow">{route.duration}</span>
              </Link>
              <div className="flex flex-col p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">{route.countries.map((place) => <span key={place} className="soft-chip"><MapPin className="size-3" />{place}</span>)}</div>
                <h2 className="mt-4 text-2xl font-black leading-tight">{route.title}</h2>
                <p className="mt-2 text-sm font-bold text-secondary">{route.subtitle}</p>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{route.description}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                  <div><p className="text-[11px] text-muted-foreground">برآورد نمایشی</p><p className="text-sm font-extrabold">{route.budget}</p></div>
                  <Link to={`/routes/${route.id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-primary">جزئیات مسیر <ArrowLeft className="size-4 transition group-hover:-translate-x-1" /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  </Layout>
);

export default Routes;
