import type { Metadata } from "next";

export const siteName = "کی‌آشی";
export const siteUrl = process.env.SITE_URL?.replace(/\/$/, "") || "https://kiashi.ir";

export const absoluteUrl = (path: string) => new URL(path.startsWith("/") ? path : `/${path}`, `${siteUrl}/`).toString();

export function createMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
  type?: "website" | "article";
}): Metadata {
  const index = input.index ?? true;
  const title = input.title.includes(siteName) ? input.title : `${input.title} | ${siteName}`;
  const image = input.image ? absoluteUrl(input.image) : absoluteUrl("/hero-greece.jpg");
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    robots: { index, follow: index, googleBot: { index, follow: index } },
    openGraph: { title, description: input.description, url: input.path, siteName, locale: "fa_IR", type: input.type ?? "website", images: [{ url: image, width: 1200, height: 630, alt: input.title }] },
    twitter: { card: "summary_large_image", title, description: input.description, images: [image] },
  };
}

export const privateMetadata = (title: string, description = "این صفحه برای کاربران و فرایندهای تراکنشی کی‌آشی است."): Metadata =>
  createMetadata({ title, description, path: "/", index: false });
