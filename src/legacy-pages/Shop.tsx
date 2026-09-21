import { ArrowLeft, BookOpen, CheckCircle2, Download, Search, ShieldCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { products } from "@/data/products";
import { formatPrice } from "@/utils/flight";

const Shop = () => {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => products.filter((item) => `${item.name} ${item.description}`.includes(query.trim())), [query]);
  return (
    <Layout>
      <main className="pb-20">
        <section className="relative isolate overflow-hidden bg-earth-dark py-16 text-white sm:py-24">
          <img src="/travel-books.jpg" alt="کتاب‌ها و راهنماهای برنامه‌ریزی سفر" className="absolute inset-0 -z-20 size-full object-cover opacity-30" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[hsl(213_27%_12%/0.97)] via-[hsl(213_27%_12%/0.84)] to-[hsl(2_76%_45%/0.55)]" />
          <div className="container-page"><span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur"><BookOpen className="size-4 text-accent" /> فروشگاه راهنمای سفر</span><h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">برنامه‌ریزی بهتر، پیش از بستن چمدان</h1><p className="mt-5 max-w-2xl text-sm leading-8 text-white/75 sm:text-base">راهنماها و پلنرهای دیجیتال فارسی برای آماده‌سازی سفر؛ دانلودی، کاربردی و مناسب استفاده روی موبایل.</p>
            <label className="mt-7 flex h-14 max-w-xl items-center gap-3 rounded-2xl border border-white/20 bg-white px-4 text-foreground shadow-xl"><Search className="size-5 text-secondary" /><span className="sr-only">جست‌وجوی راهنما</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در راهنماها" className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" /></label>
          </div>
        </section>

        <section className="container-page -mt-7 relative z-10"><div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:grid-cols-3">{[{ icon: Download, title: "دریافت دیجیتال", text: "دسترسی سریع پس از خرید" }, { icon: CheckCircle2, title: "کاملاً فارسی", text: "راهنمای روشن و قابل استفاده" }, { icon: ShieldCheck, title: "پرداخت امن", text: "ثبت سفارش و پیگیری از حساب" }].map(({ icon: Icon, title, text }, index) => <div key={title} className={`flex items-center gap-3 px-5 py-4 ${index ? "border-t border-border sm:border-r sm:border-t-0" : ""}`}><span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-5" /></span><div><p className="text-sm font-extrabold">{title}</p><p className="text-xs text-muted-foreground">{text}</p></div></div>)}</div></section>

        <section className="container-page pt-16 sm:pt-20"><div className="mb-8 max-w-2xl"><span className="section-eyebrow">انتخاب راهنما</span><h2 className="page-heading">ابزارهای جمع‌وجور برای سفرهای واقعی</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">محتوای این فروشگاه نمایشی است و برای تکمیل تجربهٔ محصول ارائه می‌شود.</p></div>
          {visible.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{visible.map((product) => <article key={product.id} className="image-card group flex flex-col"><Link to={`/shop/${product.id}`} className="relative aspect-[4/3] overflow-hidden"><img src={product.image} alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /><span className="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold shadow">{product.format}</span></Link><div className="flex flex-1 flex-col p-5"><div className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-4 fill-accent text-accent" /><span className="font-extrabold text-foreground">{product.rating.toLocaleString("fa-IR")}</span><span>· {product.pages.toLocaleString("fa-IR")} صفحه</span></div><h3 className="mt-3 text-lg font-black leading-7"><Link to={`/shop/${product.id}`}>{product.name}</Link></h3><p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{product.description}</p><div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4"><div><p className="text-[11px] text-muted-foreground">قیمت نسخه دیجیتال</p><p className="font-black text-primary">{formatPrice(product.price)}</p></div><Link to={`/shop/${product.id}`} aria-label={`مشاهده ${product.name}`} className="grid size-10 place-items-center rounded-xl bg-primary text-white transition group-hover:-translate-x-1"><ArrowLeft className="size-4" /></Link></div></div></article>)}</div> : <div className="surface-card py-16 text-center"><Search className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 font-extrabold">راهنمایی با این عبارت پیدا نشد</h2><p className="mt-2 text-sm text-muted-foreground">عبارت کوتاه‌تری جست‌وجو کن.</p></div>}
        </section>
      </main>
    </Layout>
  );
};

export default Shop;
