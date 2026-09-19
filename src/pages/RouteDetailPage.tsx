import { ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, Clock3, Gauge, Lightbulb, Plane, Sun } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getRouteById, travelRoutes } from "@/data/routes";
import NotFound from "./NotFound";

const RouteDetailPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const route = getRouteById(routeId || "");
  if (!route) return <NotFound />;
  const related = travelRoutes.filter((item) => item.id !== route.id).slice(0, 2);

  return (
    <Layout>
      <main className="pb-20">
        <section className="relative min-h-[500px] overflow-hidden text-white">
          <img src={route.image} alt={route.title} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/55 to-black/15" />
          <div className="container-page relative flex min-h-[500px] flex-col justify-between py-8">
            <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-xs text-white/65"><Link to="/" className="hover:text-white">خانه</Link><ChevronLeft className="size-3.5" /><Link to="/routes" className="hover:text-white">مسیرها</Link><ChevronLeft className="size-3.5" /><span className="text-white">{route.title}</span></nav>
            <div className="max-w-3xl pb-10">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur"><Clock3 className="size-4 text-accent" /> برنامهٔ {route.duration}</span>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">{route.title}</h1>
              <p className="mt-4 text-lg font-bold text-white/90">{route.subtitle}</p>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">{route.description}</p>
            </div>
          </div>
        </section>

        <section className="container-page -mt-9 relative z-10">
          <div className="premium-panel grid gap-px overflow-hidden bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
            {[{ icon: Clock3, label: "مدت", value: route.duration }, { icon: Gauge, label: "سطح سفر", value: route.difficulty }, { icon: Sun, label: "فصل مناسب", value: route.bestSeason }, { icon: CalendarDays, label: "برآورد بودجه", value: route.budget }].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-5" /></span><div><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-extrabold">{value}</p></div></div>
            ))}
          </div>
        </section>

        <section className="container-page grid gap-8 py-16 lg:grid-cols-[1fr_22rem]">
          <div>
            <span className="section-eyebrow">برنامهٔ پیشنهادی</span><h2 className="page-heading">روزبه‌روز مسیر</h2>
            <div className="mt-8 space-y-0">
              {route.itinerary.map((step, index) => (
                <article key={step.day} className="relative grid grid-cols-[2.75rem_1fr] gap-4 pb-8 last:pb-0">
                  {index < route.itinerary.length - 1 ? <span className="absolute right-[1.35rem] top-11 h-[calc(100%-1.25rem)] w-px bg-border" /> : null}
                  <span className="relative z-10 grid size-11 place-items-center rounded-2xl bg-secondary text-sm font-black text-white shadow-lg shadow-secondary/20">{(index + 1).toLocaleString("fa-IR")}</span>
                  <div className="surface-card p-5"><p className="text-xs font-bold text-secondary">{step.day}</p><h3 className="mt-1 text-lg font-black">{step.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p></div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="premium-panel p-5"><h2 className="flex items-center gap-2 font-black"><CheckCircle2 className="size-5 text-secondary" /> تجربه‌های اصلی</h2><ul className="mt-4 space-y-3">{route.highlights.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" />{item}</li>)}</ul></div>
            <div className="premium-panel bg-earth-dark p-5 text-white"><p className="text-xs font-bold text-accent">رزرو را از اینجا ادامه بده</p><h2 className="mt-2 text-xl font-black">تاریخ سفرت مشخص است؟</h2><p className="mt-3 text-sm leading-7 text-white/70">قیمت‌ها در این راهنما برآوردی‌اند؛ موجودی واقعی را در جست‌وجو بررسی کن.</p><Link to="/flights" className="primary-cta mt-5 w-full"><Plane className="size-4" /> جست‌وجوی پرواز</Link></div>
          </aside>
        </section>

        <section className="border-y border-border bg-muted/45 py-14"><div className="container-page"><h2 className="flex items-center gap-2 text-xl font-black"><Lightbulb className="size-5 text-accent-foreground" /> نکته‌های مسیر</h2><div className="mt-6 grid gap-3 md:grid-cols-3">{route.tips.map((tip, index) => <div key={tip} className="rounded-2xl border border-border bg-card p-4"><span className="text-xs font-black text-primary">نکته {(index + 1).toLocaleString("fa-IR")}</span><p className="mt-2 text-sm leading-7 text-muted-foreground">{tip}</p></div>)}</div></div></section>

        <section className="container-page pt-16"><div className="mb-7 flex items-end justify-between gap-4"><div><span className="section-eyebrow">مسیرهای دیگر</span><h2 className="text-2xl font-black">گزینه‌های مشابه</h2></div><Link to="/routes" className="text-sm font-extrabold text-primary">همه مسیرها</Link></div><div className="grid gap-5 md:grid-cols-2">{related.map((item) => <Link key={item.id} to={`/routes/${item.id}`} className="image-card group grid sm:grid-cols-[12rem_1fr]"><img src={item.image} alt={item.title} className="h-48 w-full object-cover sm:h-full" loading="lazy" /><div className="p-5"><p className="text-xs font-bold text-secondary">{item.duration}</p><h3 className="mt-2 text-xl font-black">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary">دیدن مسیر <ArrowLeft className="size-4" /></span></div></Link>)}</div></section>
      </main>
    </Layout>
  );
};

export default RouteDetailPage;
