import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SeoShell from "@/components/seo/SeoShell";
import { continents, featuredArticles } from "@/data/destinations";
import { seoArticles } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";

export const metadata = createMetadata({ title: "مجله و راهنمای سفر", description: "راهنماهای فارسی سفر و آرشیو محتوای مقصدها برای برنامه‌ریزی آگاهانه‌تر.", path: "/blog" });
export const revalidate = 86_400;

const legacyArticles = [...featuredArticles, ...continents.flatMap((continent) => continent.countries.flatMap((country) => country.articles))];

export default function BlogPage() {
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مجله سفر", href: "/blog" }]} /><header className="max-w-3xl"><p className="section-eyebrow"><BookOpen className="size-4" /> مجله سفر</p><h1 className="page-heading">قبل از حرکت بخوان</h1><p className="mt-4 text-sm leading-8 text-muted-foreground">مقاله‌های منتخب فارسی در اولویت‌اند و آرشیو محتوای قبلی نیز با نشانی پایدار حفظ شده است.</p></header><section className="mt-8 grid gap-5 md:grid-cols-3">{seoArticles.map((article) => <ArticleCard key={article.slug} slug={article.slug} title={article.title} description={article.description} image={article.image} date={article.updatedAt} />)}</section><section className="mt-14"><h2 className="text-2xl font-black">آرشیو راهنماهای مقصد</h2><p className="mt-2 text-sm text-muted-foreground">محتوای قدیمی بدون حذف یا شکستن پیوندها به معماری جدید منتقل شده است.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{legacyArticles.map((article) => <ArticleCard key={article.id} slug={article.id} title={article.title} description={article.excerpt} image={article.image} date={article.date} />)}</div></section></SeoShell>;
}

function ArticleCard({ slug, title, description, image, date }: { slug: string; title: string; description: string; image: string; date: string }) { return <article className="overflow-hidden rounded-2xl border bg-card shadow-sm"><Link href={`/blog/${slug}`} className="group block"><div className="relative aspect-[16/9]"><Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition group-hover:scale-[1.02]" /></div><div className="p-5"><time dateTime={date} className="text-xs font-bold text-secondary">{new Date(date).toLocaleDateString("fa-IR")}</time><h3 className="mt-2 line-clamp-2 text-lg font-black group-hover:text-primary">{title}</h3><p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">خواندن مقاله <ArrowLeft className="size-4" /></span></div></Link></article>; }
