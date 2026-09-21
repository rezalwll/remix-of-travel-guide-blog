import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "@/index.css";
import Providers from "@/components/next/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, siteName, siteUrl } from "@/seo/metadata";

const vazirmatn = Vazirmatn({ subsets: ["arabic"], display: "swap", variable: "--font-vazirmatn" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "کی‌آشی | پرواز، هتل و برنامه‌ریزی سفر", template: "%s | کی‌آشی" },
  description: "برنامه‌ریزی و مقایسه خدمات سفر، راهنمای مقصدها و مدیریت سفارش در کی‌آشی.",
  applicationName: siteName,
  icons: { icon: "/favicon.ico" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={`${vazirmatn.className} min-h-screen bg-background text-foreground`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <a href="#main-content" className="fixed start-3 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white focus:translate-y-0">رفتن به محتوای اصلی</a>
            <Header />
            <div id="main-content" tabIndex={-1} className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
        <JsonLd data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl, inLanguage: "fa-IR" },
          { "@context": "https://schema.org", "@type": "Organization", name: siteName, url: siteUrl, logo: absoluteUrl("/favicon.ico") },
        ]} />
      </body>
    </html>
  );
}
