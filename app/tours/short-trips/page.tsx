import { Backpack, CalendarRange, CircleCheck, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ShortTourCatalog from "@/components/experience/ShortTourCatalog";
import TravelHero from "@/components/media/TravelHero";
import { PromoBanner, SectionHeader } from "@/components/media/Cards";
import { photoLibrary } from "@/media/library";
import { createMetadata } from "@/seo/metadata";

export const metadata = createMetadata({
  title: "تورهای یک‌روزه و دو‌روزه ایران",
  description: "مقایسه برنامه‌های تور کوتاه از تهران به قمصر، قم و جمکران، کردستان، ابیانه، الموت، گیلان، ورزنه و تنگه واشی.",
  path: "/tours/short-trips",
  image: photoLibrary.qamsar.src,
});

export const revalidate = 86_400;

const planningItems = [
  { icon: CalendarRange, title: "زمان‌بندی روشن", text: "ساعت و محل حرکت، توقف‌ها و زمان تقریبی بازگشت پیش از قطعی‌کردن سفارش اعلام می‌شود." },
  { icon: Backpack, title: "آمادگی متناسب مسیر", text: "سطح فعالیت و فصل مناسب را ببین تا کفش، لباس و وسایل شخصی را درست انتخاب کنی." },
  { icon: ShieldCheck, title: "جزئیات قابل بررسی", text: "خدمات شامل، هزینه‌های خارج از پکیج و شرایط لغو باید در قرارداد نهایی دوباره کنترل شوند." },
] as const;

const imageCredits = [
  ["قمصر", "Mostafameraji", "https://commons.wikimedia.org/wiki/File:مراسم_گلابگیری_در_قمصر_کاشان_Golabgiri_(%22making_Rosewater%22)_-_Ghamsar-_Kashan-_Iran_29.jpg"],
  ["جمکران", "Sarailah Ankouti", "https://commons.wikimedia.org/wiki/File:Saheb_al-Zaman_Mosque_2020_01.jpg"],
  ["پالنگان", "Diyar Muhammed", "https://commons.wikimedia.org/wiki/File:Palangan_Village_in_Hawraman,_Kamyaran,Kurdistan,_Iran.JPG"],
  ["ابیانه", "Diego Delso", "https://commons.wikimedia.org/wiki/File:Abyaneh,_Irán,_2016-09-19,_DD_13-15_PAN.jpg"],
  ["اوان", "Hussein abri", "https://commons.wikimedia.org/wiki/File:Ovan_Lake.jpg"],
  ["قلعه رودخان", "Hosseinronaghi", "https://commons.wikimedia.org/wiki/File:Ghaleh-Rudkhan_(7).jpg"],
  ["ورزنه", "Ninara", "https://commons.wikimedia.org/wiki/File:Varzaneh_Desert,_Isfahan,_Iran_(53822294894).jpg"],
  ["تنگه واشی", "Mostafa Saeednejad", "https://commons.wikimedia.org/wiki/File:Tang_e_Vashi.jpg"],
] as const;

export default function ShortTripsPage() {
  return (
    <main className="atmospheric-page">
      <TravelHero
        asset={photoLibrary.qamsar}
        eyebrow="سفرهای کوتاه داخلی"
        title={<>یک یا دو روز؛<br /><span className="text-accent">یک حال‌وهوای تازه</span></>}
        description="از گلاب‌گیری قمصر و زیارت قم و جمکران تا روستاهای کردستان، کویر ورزنه و جنگل‌های گیلان؛ برنامه‌ای را انتخاب کن که با آخر هفته و توان بدنی‌ات هماهنگ است."
        badges={["حرکت از تهران", "برنامه یک‌روزه", "برنامه دو‌روزه", "تصاویر واقعی مقصد"]}
        primary={{ href: "#short-tour-list", label: "دیدن برنامه‌ها" }}
        secondary={{ href: "/tours", label: "همه تورها" }}
      />

      <div className="container-page pt-7">
        <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "تورها", href: "/tours" }, { label: "تورهای یک و دو روزه", href: "/tours/short-trips" }]} />
      </div>

      <ShortTourCatalog />

      <section className="media-section-tinted" aria-labelledby="short-tour-planning-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="پیش از حرکت"
            title="تور کوتاه خوب، برنامه مبهم ندارد"
            description="برای مسیرهای زیارتی، شهری، کوهستانی و کویری جزئیات متفاوتی مهم است؛ این سه مورد را همیشه پیش از پرداخت کنترل کن."
          />
          <h2 id="short-tour-planning-heading" className="sr-only">نکات برنامه‌ریزی تور کوتاه</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {planningItems.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-xs)]">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <h3 className="mt-4 text-base font-black">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            <CircleCheck className="mt-1 size-4 shrink-0" />
            <p>قیمت، تاریخ و ظرفیت این صفحه برای دموی محصول است. پیش از فعال‌شدن فروش واقعی باید از تأمین‌کننده دریافت و در قرارداد نهایی تأیید شود.</p>
          </div>
        </div>
      </section>

      <section className="media-section">
        <div className="container-page">
          <PromoBanner
            href="/tours/palangan-kurdistan-two-day"
            asset={photoLibrary.palangan}
            eyebrow="پیشنهاد دو‌روزه"
            title="کردستان؛ از سنندج تا بافت پلکانی پالنگان"
            description="برنامه، سطح فعالیت، نوع اقامت و خدمات نمایشی این سفر را در صفحه جزئیات ببین."
            cta="مشاهده برنامه کردستان"
          />
          <details className="mt-6 rounded-2xl border border-border/70 bg-card p-5 text-sm text-muted-foreground">
            <summary className="cursor-pointer font-extrabold text-foreground">اعتبار و منبع تصاویر واقعی این صفحه</summary>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {imageCredits.map(([destination, author, href]) => (
                <li key={destination}>
                  <a href={href} rel="license" className="font-bold text-secondary hover:text-primary">{destination}</a>
                  <span className="block text-xs">عکس: {author} / Wikimedia Commons</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>
    </main>
  );
}
