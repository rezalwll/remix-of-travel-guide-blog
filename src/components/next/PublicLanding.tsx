import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import BookingSearch from "@/components/home/BookingSearch";
import { routePolicy } from "@/seo/routes";
import { createMetadata } from "@/seo/metadata";

type PageKey = "flights" | "hotels" | "routes" | "tours" | "ziyarat" | "visa" | "trains" | "buses" | "insurance" | "cip" | "transfer" | "fast-track" | "esim" | "city-tours";

const content: Record<PageKey, { intro: string; points: string[]; links: { href: string; label: string; text: string }[] }> = {
  flights: { intro: "مبدأ، مقصد و تاریخ را وارد کنید و گزینه‌ها را با توجه به زمان، بار مجاز و شرایط تغییر بررسی کنید. قیمت و ظرفیت فقط در نتیجهٔ جست‌وجوی متصل به تأمین‌کننده معتبر است.", points: ["مقایسهٔ ساعت و فرودگاه", "بررسی بار و قوانین نرخ", "ادامهٔ امن تا پرداخت"], links: [{ href: "/flights/tehran-to-mashhad", label: "تهران به مشهد", text: "فرودگاه‌ها، مدت مسیر و نکات انتخاب پرواز" }, { href: "/flights/tehran-to-kish", label: "تهران به کیش", text: "راهنمای مسیر و هماهنگی پرواز با اقامت" }, { href: "/flights/tehran-to-istanbul", label: "تهران به استانبول", text: "نکات مسیر بین‌المللی و مدارک سفر" }] },
  hotels: { intro: "پیش از انتخاب اقامت، محله، فاصله تا نقاط اصلی و شرایط لغو را کنار قیمت نهایی بسنجید.", points: ["انتخاب محلهٔ مناسب", "بررسی امکانات و قوانین", "تطبیق تاریخ ورود و خروج"], links: [{ href: "/hotels/kish", label: "هتل‌های کیش", text: "راهنمای محله‌ها و انتخاب اقامت در جزیره" }, { href: "/hotels/mashhad", label: "هتل‌های مشهد", text: "فاصله، دسترسی و نکات رزرو" }, { href: "/hotels/istanbul", label: "هتل‌های استانبول", text: "مقایسهٔ محله‌های اصلی شهر" }] },
  routes: { intro: "مسیرهای پیشنهادی برای ساختن یک برنامهٔ واقع‌بینانه؛ زمان آزاد، جابه‌جایی و فصل مناسب را پیش از رزرو بسنجید.", points: ["برنامهٔ روزبه‌روز", "زمان‌بندی جابه‌جایی", "نکات فصل و بودجه"], links: [{ href: "/routes/turkiye-city-coast", label: "استانبول و ساحل اژه", text: "ترکیب شهر و ساحل با ریتم متعادل" }, { href: "/routes/persian-classic", label: "مسیر کلاسیک ایران", text: "تهران، کاشان، اصفهان و شیراز" }] },
  tours: { intro: "برنامه، خدمات مشمول و غیرمشمول و وضعیت مدارک را شفاف مقایسه کنید. ظرفیت نمایشی به معنی تأیید رزرو نیست.", points: ["برنامه و مدت روشن", "خدمات قابل مقایسه", "کنترل مدارک پیش از خرید"], links: [{ href: "/tours/tour-استانبول-0", label: "نمونه تور استانبول", text: "مشاهدهٔ برنامه و خدمات نمونه" }, { href: "/support", label: "راهنمای خرید", text: "پاسخ پرسش‌های رایج پیش از رزرو" }] },
  ziyarat: { intro: "نوع جابه‌جایی، محل اقامت، مدارک و خدمات کاروان را پیش از انتخاب برنامه بررسی کنید.", points: ["برنامهٔ آرام و شفاف", "مدارک و مقررات سفر", "خدمات اقامت و ترانسفر"], links: [{ href: "/ziyarat/ziyarat-0-0", label: "نمونه نجف و کربلا", text: "برنامه و خدمات نمونهٔ سفر زیارتی" }, { href: "/travel-preparation", label: "آمادگی سفر", text: "چک‌لیست عمومی پیش از حرکت" }] },
  visa: { intro: "اطلاعات این بخش راهنمای عمومی است؛ مدارک، هزینه و زمان رسیدگی را همیشه از مرجع رسمی مقصد کنترل کنید.", points: ["تفکیک نوع ویزا", "چک‌لیست مدارک", "ارجاع به مقررات رسمی"], links: [{ href: "/visa/canada", label: "ویزای کانادا", text: "انواع درخواست و مدارک عمومی" }, { href: "/visa/schengen", label: "ویزای شنگن", text: "راهنمای اولیهٔ درخواست" }, { href: "/visa/uae", label: "ویزای امارات", text: "اطلاعات عمومی سفر و درخواست" }] },
  trains: { intro: "زمان حرکت، ایستگاه، نوع واگن و قوانین استرداد را در نتیجهٔ معتبر بررسی کنید.", points: ["مقایسهٔ نوع واگن", "کنترل ایستگاه", "قوانین استرداد"], links: [{ href: "/trains/search", label: "جست‌وجوی قطار", text: "مشاهدهٔ گزینه‌های موجود" }] },
  buses: { intro: "پایانهٔ مبدأ و مقصد، نوع اتوبوس و ساعت حضور را پیش از خرید کنترل کنید.", points: ["انتخاب پایانه", "مقایسهٔ نوع اتوبوس", "اطلاعات سوارشدن"], links: [{ href: "/buses/search", label: "جست‌وجوی اتوبوس", text: "مشاهدهٔ گزینه‌های موجود" }] },
  insurance: { intro: "مقصد، مدت سفر، سن مسافران و سقف پوشش روی انتخاب بیمه اثر دارد.", points: ["مقایسهٔ سقف پوشش", "بررسی استثناها", "ثبت دقیق مسافران"], links: [{ href: "/support", label: "پشتیبانی", text: "پرسش دربارهٔ فرایند خرید" }] },
  cip: { intro: "فرودگاه، پرواز و تعداد مسافران را ثبت کنید تا امکان ارائهٔ خدمت بررسی شود.", points: ["تشریفات ورود یا خروج", "هماهنگی اطلاعات پرواز", "تأیید نهایی ارائه‌دهنده"], links: [{ href: "/fast-track", label: "فست ترک", text: "تفاوت خدمات عبور سریع و CIP" }] },
  transfer: { intro: "شماره پرواز، زمان رسیدن و تعداد بارها برای هماهنگی ترانسفر ضروری است.", points: ["زمان‌بندی با پرواز", "انتخاب ظرفیت خودرو", "اطلاعات محل ملاقات"], links: [{ href: "/cip", label: "خدمات فرودگاهی", text: "سایر خدمات هنگام ورود و خروج" }] },
  "fast-track": { intro: "این خدمت برای تسهیل مراحل فرودگاهی است و دامنهٔ آن در هر فرودگاه متفاوت است.", points: ["بررسی فرودگاه پشتیبانی‌شده", "هماهنگی ساعت پرواز", "تأیید محدودهٔ خدمت"], links: [{ href: "/cip", label: "خدمات CIP", text: "مقایسهٔ خدمات تشریفاتی" }] },
  esim: { intro: "سازگاری گوشی، کشورهای پوشش و حجم بسته را پیش از خرید کنترل کنید.", points: ["کنترل سازگاری دستگاه", "انتخاب پوشش مقصد", "فعال‌سازی پیش از سفر"], links: [{ href: "/travel-preparation", label: "آمادگی سفر", text: "چک‌لیست ارتباط و مدارک" }] },
  "city-tours": { intro: "مدت گشت، نقطهٔ شروع، زبان راهنما و خدمات مشمول را برای انتخاب تجربهٔ مناسب مقایسه کنید.", points: ["برنامه و مدت مشخص", "محل شروع روشن", "تفکیک هزینه‌های جانبی"], links: [{ href: "/destinations", label: "راهنمای مقصدها", text: "شناخت شهر پیش از انتخاب تجربه" }] },
};

export function PublicLanding({ page }: { page: PageKey }) {
  const policy = routePolicy(`/${page}`);
  const item = content[page];
  if (!policy) throw new Error(`Missing route policy for ${page}`);
  return <main>
    <section className="border-b bg-[linear-gradient(135deg,hsl(var(--primary)/.12),hsl(var(--secondary)/.08))] py-16 sm:py-24"><div className="container-page max-w-5xl"><p className="text-sm font-bold text-secondary">راهنمای خدمات کی‌آشی</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">{policy.title}</h1><p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{item.intro}</p><ul className="mt-7 grid gap-3 sm:grid-cols-3">{item.points.map((point) => <li key={point} className="flex items-center gap-2 rounded-xl border bg-background/80 p-4 text-sm font-bold"><CheckCircle2 className="size-5 text-secondary" />{point}</li>)}</ul></div></section>
    {(page === "flights" || page === "hotels") && <BookingSearch />}
    <section className="container-page py-14 sm:py-20"><h2 className="text-2xl font-black">راهنماها و مسیرهای مرتبط</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{item.links.map((link) => <Link key={link.href} href={link.href} className="rounded-2xl border bg-card p-6 shadow-sm transition hover:border-secondary/50"><h3 className="font-extrabold">{link.label}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{link.text}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-secondary">مشاهده <ArrowLeft className="size-4" /></span></Link>)}</div></section>
  </main>;
}

export type { PageKey };

export function publicPageMetadata(page: PageKey) {
  const policy = routePolicy(`/${page}`);
  if (!policy) throw new Error(`Missing route policy for ${page}`);
  return createMetadata({ title: policy.title, description: policy.description, path: policy.path });
}
