import Breadcrumbs from "@/components/seo/Breadcrumbs";
import TravelHero from "@/components/media/TravelHero";
import { EditorialCard, ImageCard, SectionHeader } from "@/components/media/Cards";
import { continents, featuredArticles } from "@/data/destinations";
import { seoArticles } from "@/seo/content";
import { createMetadata } from "@/seo/metadata";
import { editorialMedia, legacyAsset, photoLibrary } from "@/media/library";

export const metadata = createMetadata({
  title: "مجله و راهنمای سفر",
  description: "راهنماهای فارسی سفر و آرشیو محتوای مقصدها برای برنامه‌ریزی آگاهانه‌تر.",
  path: "/blog",
  image: "/travel-books.jpg",
});
export const revalidate = 86_400;

const legacyArticles = [...featuredArticles, ...continents.flatMap((continent) => continent.countries.flatMap((country) => country.articles))];
const covers = [editorialMedia.seasons, editorialMedia.planning, editorialMedia.travellers];
const faDate = (value: string) => new Date(value).toLocaleDateString("fa-IR");

export default function BlogPage() {
  const [lead, ...rest] = seoArticles;
  return (
    <main>
      <TravelHero
        asset={photoLibrary.books}
        size="compact"
        eyebrow="مجلهٔ سفر کی‌آشی"
        title="قبل از حرکت بخوان"
        description="مقاله‌های منتخب فارسی در اولویت‌اند و آرشیو محتوای قبلی نیز با نشانی پایدار حفظ شده است."
      />

      <div className="container-page pt-6">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "مجله سفر", href: "/blog" }]} />
      </div>

      <section className="pb-4 pt-8">
        <div className="container-page">
          <h2 className="sr-only">مقاله‌های منتخب</h2>
          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            {lead && (
              <EditorialCard
                featured
                priority
                href={`/blog/${lead.slug}`}
                asset={covers[0]}
                title={lead.title}
                description={lead.description}
                category="مقالهٔ منتخب"
                date={faDate(lead.updatedAt)}
              />
            )}
            <div className="grid gap-4">
              {rest.map((article, index) => (
                <EditorialCard
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  asset={covers[(index + 1) % covers.length]}
                  title={article.title}
                  description={article.description}
                  category="راهنمای سفر"
                  date={faDate(article.updatedAt)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="media-section-tinted">
        <div className="container-page">
          <SectionHeader
            eyebrow="آرشیو"
            title="راهنماهای مقصد"
            description="محتوای پیشین بدون حذف یا شکستن پیوند به معماری جدید منتقل شده است."
          />
          <div className="media-grid sm:grid-cols-2 lg:grid-cols-3">
            {legacyArticles.map((article) => (
              <ImageCard
                key={article.id}
                href={`/blog/${article.id}`}
                asset={legacyAsset(article.image, article.title, article.id)}
                title={article.title}
                description={article.excerpt}
                meta={article.category}
                cta="خواندن مقاله"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
