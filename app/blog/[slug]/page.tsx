import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import SeoShell from "@/components/seo/SeoShell";
import { continents, featuredArticles, type Article } from "@/data/destinations";
import { getSeoArticle, seoArticles } from "@/seo/content";
import { absoluteUrl, createMetadata } from "@/seo/metadata";

type NormalizedArticle = { slug: string; title: string; description: string; image: string; author: string; publishedAt: string; updatedAt: string; body: string[]; relatedDestination?: string; indexable: boolean };
const legacyArticles = [...featuredArticles, ...continents.flatMap((continent) => continent.countries.flatMap((country) => country.articles))];

function normalizeLegacy(article: Article): NormalizedArticle { return { slug: article.id, title: article.title, description: article.excerpt, image: article.image, author: article.author || "تحریریه کی‌آشی", publishedAt: article.date, updatedAt: article.date, body: article.content || [article.excerpt], indexable: Boolean(article.content?.length) }; }
function findArticle(slug: string): NormalizedArticle | undefined { return getSeoArticle(slug) || (legacyArticles.find((item) => item.id === slug) ? normalizeLegacy(legacyArticles.find((item) => item.id === slug)!) : undefined); }

export const revalidate = 86_400;
export const dynamicParams = false;
export function generateStaticParams() { return [...seoArticles.map((item) => ({ slug: item.slug })), ...legacyArticles.map((item) => ({ slug: item.id }))]; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  return article ? createMetadata({ title: article.title, description: article.description, path: `/blog/${article.slug}`, image: article.image, index: article.indexable, type: "article" }) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();
  const canonical = `/blog/${article.slug}`;
  return <SeoShell><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مجله سفر", href: "/blog" }, { label: article.title, href: canonical }]} /><article className="mx-auto max-w-4xl"><header><p className="text-xs font-bold text-secondary">{article.author} · <time dateTime={article.updatedAt}>{new Date(article.updatedAt).toLocaleDateString("fa-IR")}</time></p><h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{article.title}</h1><p className="mt-5 text-base leading-8 text-muted-foreground">{article.description}</p><div className="relative mt-7 aspect-[16/8] overflow-hidden rounded-3xl"><Image src={article.image} alt={article.title} fill priority sizes="(max-width: 1024px) 100vw, 896px" className="object-cover" /></div></header><div className="mt-8 space-y-6 text-base leading-9">{article.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{article.relatedDestination && <aside className="mt-9 rounded-2xl border bg-card p-6"><h2 className="font-black">برنامه‌ریزی مقصد</h2><p className="mt-2 text-sm text-muted-foreground">راهنمای مقصد و پیوندهای پرواز و اقامت را در صفحه مرتبط ببینید.</p><Link href={article.relatedDestination} className="secondary-cta mt-4">مشاهده راهنمای مقصد</Link></aside>}</article><JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.description, image: absoluteUrl(article.image), author: { "@type": "Organization", name: article.author }, publisher: { "@type": "Organization", name: "کی‌آشی" }, datePublished: article.publishedAt, dateModified: article.updatedAt, mainEntityOfPage: absoluteUrl(canonical), inLanguage: "fa-IR" }} /></SeoShell>;
}
