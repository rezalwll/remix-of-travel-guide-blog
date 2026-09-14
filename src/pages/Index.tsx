import { ArrowLeft, Compass, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import BookingSearch from '@/components/home/BookingSearch';
import { ArticlesSection, DestinationsSection, HotelsSection, OffersSection, RecentSearches, RoutesSection, ServicesSection, SupportSection, ToursSection, TrustSection, ZiyaratSection } from '@/components/home/HomeSections';
import heroGreece from '@/assets/hero-greece.jpg';

const Index = () => <Layout>
  <main>
    <section className="relative min-h-[480px] overflow-hidden pb-24 pt-16 sm:min-h-[540px] sm:pt-24">
      <img src={heroGreece} alt="منظرهٔ ساحلی برای شروع یک سفر تازه" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-l from-[hsl(220_22%_17%/0.88)] via-[hsl(220_22%_17%/0.5)] to-[hsl(220_22%_17%/0.12)]" />
      <div className="container-page relative flex min-h-[390px] items-center"><div className="max-w-xl text-white"><span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur"><Compass className="size-3.5 text-[hsl(42_100%_60%)]" /> مقصد بعدی‌ات نزدیک‌تر از همیشه</span><h1 className="text-4xl font-extrabold leading-[1.35] sm:text-5xl lg:text-6xl">سفر بعدی‌ات را<br /><span className="text-[hsl(42_100%_60%)]">با خیال راحت</span> شروع کن</h1><p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">پرواز، هتل، تور و تجربه‌های سفر را با چند کلیک پیدا و مقایسه کن.</p><div className="mt-7 flex flex-wrap gap-2"><Link to="/destinations" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-foreground hover:bg-white/90"><Search className="size-4" /> کشف مقصدها</Link><Link to="/blog" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">مجله سفر <ArrowLeft className="size-4" /></Link></div></div></div>
    </section>
    <BookingSearch />
    <RecentSearches />
    <OffersSection />
    <RoutesSection />
    <ToursSection />
    <HotelsSection />
    <DestinationsSection />
    <ZiyaratSection />
    <ServicesSection />
    <TrustSection />
    <ArticlesSection />
    <SupportSection />
  </main>
</Layout>;

export default Index;
