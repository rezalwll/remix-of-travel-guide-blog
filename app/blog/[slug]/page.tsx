import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import TravelHero from "@/components/media/TravelHero";
import MediaFrame from "@/components/media/MediaFrame";
import { ImageCard, PromoBanner, SectionHeader } from "@/components/media/Cards";
import { continents, featuredArticles, type Article } from "@/data/destinations";
import { getSeoArticle, seoArticles } from "@/seo/content";
import { absoluteUrl, createMetadata } from "@/seo/metadata";
import { destinationAsset, editorialMedia, legacyAsset, serviceAsset } from "@/media/library";

type NormalizedArticle = { slug: string; title: string; description: string; image: string; author: string; publishedAt: string; updatedAt: string; body: string[]; relatedDestination?: string; indexable: boolean };
const legacyArticles = [...featuredArticles, ...continents.flatMap((continent) => continent.countries.flatMap((country) => country.articles))];

function normalizeLegacy(article: Article): NormalizedArticle { return { slug: article.id, title: article.title, description: article.excerpt, image: article.image, author: article.author || "تحریریه کیاشی", publishedAt: article.date, updatedAt: article.date, body: article.content || [article.excerpt], indexable: Boolean(article.content?.length) }; }
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
  const cover = legacyAsset(article.image, article.title, article.slug);
  const destinationSlug = article.relatedDestination?.split("/").at(-1);
  const related = [...seoArticles, ...legacyArticles.map(normalizeLegacy)].filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <main id="main-content" className="min-h-[70vh] bg-muted/35">
      <TravelHero asset={cover} size="compact" title={article.title} description={article.description} />

      <div className="container-page pt-7"><Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مجله سفر", href: "/blog" }, { label: article.title, href: canonical }]} /></div>

      <article className="container-page pb-12 pt-5">
        <div className="mx-auto max-w-3xl space-y-7 text-base leading-9">
          {article.body.map((paragraph, index) => (
            <div key={paragraph}>
              <p>{paragraph}</p>
              {index === 0 && article.body.length > 1 && <MediaFrame asset={destinationSlug ? destinationAsset(destinationSlug, `تصویر مرتبط با ${article.title}`) : editorialMedia.map} ratio="16/9" sizes="(max-width: 768px) 100vw, 768px" className="mt-7 rounded-2xl" />}
            </div>
          ))}
        </div>
        {article.relatedDestination && <aside className="mx-auto mt-10 max-w-3xl"><PromoBanner href={article.relatedDestination} asset={destinationSlug ? destinationAsset(destinationSlug, `تصویر مقصد مرتبط با ${article.title}`) : editorialMedia.travellers} title="راهنمای مقصد را هم ببین" description="زمان سفر، رفت‌وآمد و پیوندهای پرواز و اقامت در صفحهٔ مقصد جمع شده است." cta="مشاهدهٔ مقصد" /></aside>}
      </article>

      <section className="media-section-tinted"><div className="container-page"><SectionHeader title="از مجلهٔ سفر" action={{ href: "/blog", label: "همهٔ مقاله‌ها" }} /><div className="media-grid sm:grid-cols-2 lg:grid-cols-3">{related.map((item, index) => <ImageCard key={item.slug} href={`/blog/${item.slug}`} asset={legacyAsset(item.image, item.title, item.slug)} title={item.title} description={item.description} meta={index === 0 ? "پیشنهاد تحریریه" : undefined} cta="خواندن مقاله" />)}</div></div></section>

      <section className="pb-14 pt-10 sm:pb-20"><div className="container-page"><PromoBanner href="/travel-preparation" asset={serviceAsset("routes", "تصویر برنامه‌ریزی پیش از سفر")} title="چک‌لیست سفر را مرور کن" description="مدارک، بیمه، اینترنت و زمان‌بندی رفت‌وآمد را یک‌جا بررسی کن." cta="آمادگی سفر" align="center" /></div></section>

      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.description, image: absoluteUrl(article.image), author: { "@type": "Organization", name: article.author }, publisher: { "@type": "Organization", name: "کیاشی" }, datePublished: article.publishedAt, dateModified: article.updatedAt, mainEntityOfPage: absoluteUrl(canonical), inLanguage: "fa-IR" }} />
    </main>
  );
}
