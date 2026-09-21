import { ArrowLeft, CheckCircle2, ChevronLeft, Download, FileText, ShieldCheck, Star } from "lucide-react";
import { Link, useParams } from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { getProductById, products } from "@/data/products";
import { formatPrice } from "@/utils/flight";
import NotFound from "./NotFound";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = getProductById(productId || "");
  if (!product) return <NotFound />;
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <Layout>
      <main className="pb-20">
        <section className="border-b border-border bg-muted/45 py-5"><div className="container-page"><nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">خانه</Link><ChevronLeft className="size-3.5" /><Link to="/shop" className="hover:text-foreground">فروشگاه</Link><ChevronLeft className="size-3.5" /><span className="text-foreground">{product.name}</span></nav></div></section>

        <section className="container-page grid gap-8 py-10 lg:grid-cols-[.88fr_1.12fr] lg:items-start lg:py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl"><img src={product.image} alt={product.name} className="aspect-[4/3] size-full object-cover" /><div className="grid grid-cols-3 gap-px bg-border"><div className="bg-card p-4 text-center"><FileText className="mx-auto size-5 text-secondary" /><p className="mt-2 text-xs font-extrabold">{product.pages.toLocaleString("fa-IR")} صفحه</p></div><div className="bg-card p-4 text-center"><Download className="mx-auto size-5 text-secondary" /><p className="mt-2 text-xs font-extrabold">دانلود دیجیتال</p></div><div className="bg-card p-4 text-center"><ShieldCheck className="mx-auto size-5 text-secondary" /><p className="mt-2 text-xs font-extrabold">پرداخت امن</p></div></div></div>
          <div className="lg:pt-3"><span className="section-eyebrow">راهنمای دیجیتال سفر</span><h1 className="page-heading max-w-2xl">{product.name}</h1><div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1.5 font-extrabold text-foreground"><Star className="size-4 fill-accent text-accent" />{product.rating.toLocaleString("fa-IR")}</span><span>{product.format}</span><span>·</span><span>{product.pages.toLocaleString("fa-IR")} صفحه</span></div><p className="mt-6 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">{product.description}</p>
            <div className="mt-7 rounded-2xl border border-primary/15 bg-primary/5 p-5"><p className="text-xs text-muted-foreground">قیمت نسخهٔ دیجیتال</p><p className="mt-1 text-2xl font-black text-primary">{formatPrice(product.price)}</p><button type="button" className="primary-cta mt-4 w-full sm:w-auto"><Download className="size-4" /> افزودن به سبد خرید</button><p className="mt-3 text-[11px] leading-6 text-muted-foreground">این محصول در نسخهٔ نمایشی است؛ مبلغ پیش از پرداخت نهایی نمایش داده می‌شود.</p></div>
            <div className="mt-8"><h2 className="text-lg font-black">این راهنما شامل چیست؟</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{product.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm leading-7 text-muted-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-secondary" />{feature}</li>)}</ul></div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/45 py-14"><div className="container-page max-w-5xl"><div className="text-center"><span className="section-eyebrow">فهرست محتوا</span><h2 className="text-3xl font-black">داخل فایل چه می‌بینی؟</h2></div><div className="mt-8 space-y-3">{product.contents.map((item, index) => <article key={item} className="surface-card flex gap-4 p-5"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/10 text-sm font-black text-secondary">{(index + 1).toLocaleString("fa-IR")}</span><p className="pt-1 text-sm leading-7 text-muted-foreground">{item}</p></article>)}</div></div></section>

        <section className="container-page pt-16"><div className="mb-7 flex items-end justify-between gap-4"><div><span className="section-eyebrow">پیشنهادهای دیگر</span><h2 className="text-2xl font-black">راهنماهای مکمل</h2></div><Link to="/shop" className="text-sm font-extrabold text-primary">همه راهنماها</Link></div><div className="grid gap-5 md:grid-cols-3">{related.map((item) => <Link key={item.id} to={`/shop/${item.id}`} className="image-card group"><img src={item.image} alt={item.name} className="aspect-[16/10] size-full object-cover" loading="lazy" /><div className="p-5"><h3 className="font-black leading-7">{item.name}</h3><div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm font-extrabold text-primary">{formatPrice(item.price)}</span><ArrowLeft className="size-4 text-primary transition group-hover:-translate-x-1" /></div></div></Link>)}</div></section>
      </main>
    </Layout>
  );
};

export default ProductDetailPage;
