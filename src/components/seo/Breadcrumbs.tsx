import Link from "next/link";
import JsonLd from "./JsonLd";
import { absoluteUrl } from "@/seo/metadata";

export type BreadcrumbItem = { label: string; href: string };

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <nav aria-label="مسیر صفحه" className="mb-5 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">←</span>}
              {index === items.length - 1 ? <span aria-current="page" className="font-bold text-foreground">{item.label}</span> : <Link href={item.href} className="hover:text-primary">{item.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: absoluteUrl(item.href) })),
      }} />
    </>
  );
}
