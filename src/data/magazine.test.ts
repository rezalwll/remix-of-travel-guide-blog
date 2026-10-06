import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { continents, featuredArticles } from "./destinations";
import { localizeLegacyArticles } from "./magazine";

const legacyArticles = [
  ...featuredArticles,
  ...continents.flatMap((continent) =>
    continent.countries.flatMap((country) => country.articles),
  ),
];

describe("Persian travel magazine archive", () => {
  const articles = localizeLegacyArticles(legacyArticles);

  it("localizes every legacy article title, summary, category, author and body", () => {
    expect(articles).toHaveLength(legacyArticles.length);
    for (const article of articles) {
      expect(article.title).toMatch(/[\u0600-\u06ff]/);
      expect(article.excerpt).toMatch(/[\u0600-\u06ff]/);
      expect(article.category).toMatch(/[\u0600-\u06ff]/);
      expect(article.author).toBe("تحریریه کیاشی");
      expect(article.content).toHaveLength(4);
      expect(
        article.content?.every((paragraph) =>
          /[\u0600-\u06ff]/.test(paragraph),
        ),
      ).toBe(true);
      expect(existsSync(join(process.cwd(), "public", article.image))).toBe(
        true,
      );
    }
    expect(new Set(articles.map((article) => article.title)).size).toBe(
      articles.length,
    );
  });

  it("uses a varied set of locally shipped covers", () => {
    const covers = new Set(articles.map((article) => article.image));
    expect(covers.size).toBeGreaterThanOrEqual(16);
    expect([...covers].every((cover) => cover.startsWith("/"))).toBe(true);
  });
});
