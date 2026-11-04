import { Link } from '@/lib/router';
import { Instagram, Send, Headphones, ShieldCheck } from 'lucide-react';

const groups = [
  { title: 'خدمات سفر', links: [['پرواز', '/flights'], ['هتل', '/hotels'], ['تور و زیارت', '/tours'], ['تورهای یک و دو روزه', '/tours/short-trips'], ['قطار', '/trains'], ['اتوبوس', '/buses'], ['ویزا', '/visa'], ['بیمه', '/insurance'], ['CIP و ترانسفر', '/cip']] },
  { title: 'راهنمایی و پشتیبانی', links: [['پیگیری خرید', '/track-order'], ['مرکز راهنما', '/help'], ['راهنمای خرید', '/help/purchase-guide'], ['راهنمای استرداد', '/help/refund-guide'], ['سیاست استرداد', '/refund-policy'], ['پشتیبانی', '/support'], ['تماس با ما', '/contact']] },
  { title: 'درباره و اعتماد', links: [['درباره ما', '/about'], ['قوانین و مقررات', '/terms'], ['حریم خصوصی', '/privacy'], ['مجوزها و اعتماد', '/licenses'], ['همکاری سازمانی', '/business-travel'], ['باشگاه مشتریان', '/club']] },
  { title: 'کشف و محتوا', links: [['مقصدهای محبوب', '/destinations'], ['مجله سفر', '/blog'], ['مسیرهای پرطرفدار', '/routes'], ['آمادگی سفر', '/travel-preparation']] },
];

const Footer = () => <footer className="mt-auto border-t border-white/20 bg-[#F12613] text-white shadow-[0_-18px_60px_rgb(223_48_28/0.24)]">
  <div className="container-page py-12 sm:py-16">
    <div className="grid gap-10 lg:grid-cols-[minmax(11rem,1.1fr)_minmax(0,4fr)]">
      <div>
        <Link to="/" className="inline-flex"><img src="/kiashi-logo.webp" alt="کیاشی" className="h-11 w-auto max-w-[124px] object-contain object-right brightness-0 invert" /></Link>
        <p className="mt-4 max-w-xs text-sm leading-7 text-white/80">همراه شما برای جست‌وجو، رزرو و پیگیری خدمات سفر.</p>
        <div className="mt-5 flex gap-2"><span title="اینستاگرام کیاشی" className="rounded-lg border border-white/25 bg-white/10 p-2 text-white/85"><Instagram className="size-4" /></span><span title="کانال کیاشی" className="rounded-lg border border-white/25 bg-white/10 p-2 text-white/85"><Send className="size-4" /></span><Link to="/contact" aria-label="تماس با پشتیبانی" className="rounded-lg border border-white/25 bg-white/10 p-2 text-white/85 transition hover:bg-white hover:text-[#DF301C]"><Headphones className="size-4" /></Link></div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">{groups.map((group) => <div key={group.title} className="min-w-0"><h2 className="mb-4 text-sm font-black text-white">{group.title}</h2><ul className="space-y-3">{group.links.map(([label, to]) => <li key={to}><Link to={to} className="text-sm text-white/72 transition-colors hover:text-white">{label}</Link></li>)}</ul></div>)}</div>
    </div>
    <div className="mt-8 grid gap-3 border-t border-white/20 pt-6 text-xs text-white/70 sm:grid-cols-[1fr_auto] sm:items-center"><span>© {new Date().getFullYear()} کیاشی — سامانه رزرو و برنامه‌ریزی سفر</span><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-white"/><span>پرداخت امن · پشتیبانی و پیگیری آنلاین سفارش‌ها</span></div></div>
  </div>
</footer>;
export default Footer;
