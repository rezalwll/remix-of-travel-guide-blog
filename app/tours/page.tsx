import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
import { ManagedProgramCatalog } from "@/components/experience/ManagedProgramCatalog";
import { PromoBanner } from "@/components/media/Cards";
import { photoLibrary } from "@/media/library";
export const metadata = publicPageMetadata("tours");
export default function Page() { return <><PublicLanding page="tours" /><section className="media-section py-8 sm:py-10"><div className="container-page"><PromoBanner href="/tours/short-trips" asset={photoLibrary.qamsar} eyebrow="تازه در کیاشی" title="تورهای یک‌روزه و دو‌روزه" description="قمصر، قم و جمکران، کردستان، ابیانه، الموت، گیلان، ورزنه و تنگه واشی را در یک صفحه مقایسه کن." cta="مشاهده تورهای کوتاه" /></div></section><ManagedProgramCatalog type="TOUR" /></>; }
