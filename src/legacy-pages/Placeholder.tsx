import { Link, useLocation } from '@/lib/router';
import Layout from '@/components/layout/Layout';
import { ArrowLeft, Construction } from 'lucide-react';

const labels: Record<string, string> = {
  flights: 'پروازها', hotels: 'هتل‌ها', tours: 'تورهای سفر', trains: 'قطار', buses: 'اتوبوس', ziyarat: 'زیارت', visa: 'ویزا', insurance: 'بیمه مسافرتی', cip: 'خدمات CIP', blog: 'مجله سفر', cart: 'سبد خرید', checkout: 'تکمیل رزرو', account: 'حساب کاربری', support: 'پشتیبانی', faq: 'سوالات متداول', terms: 'قوانین و مقررات', destinations: 'مقصدها',
};

const Placeholder = () => {
  const { pathname } = useLocation();
  const key = pathname.split('/').filter(Boolean)[0] ?? 'home';
  const title = labels[key] ?? 'این بخش';
  return <Layout><main className="container-page flex min-h-[55vh] items-center justify-center py-20"><div className="surface-card w-full max-w-xl p-8 text-center sm:p-12"><div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-secondary/10 text-secondary"><Construction className="size-7" /></div><p className="mb-2 text-sm font-semibold text-primary">در حال آماده‌سازی</p><h1 className="mb-4 text-2xl font-extrabold sm:text-3xl">{title}</h1><p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">این مسیر در معماری محصول آماده شده و در فاز بعدی با تجربه‌ی کامل رزرو توسعه پیدا می‌کند.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">بازگشت به خانه <ArrowLeft className="size-4" /></Link></div></main></Layout>;
};
export default Placeholder;
