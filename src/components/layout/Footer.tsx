import { Link } from '@/lib/router';
import { Instagram, Send, Headphones, ShieldCheck } from 'lucide-react';

const groups = [
  { title: 'خدمات سفر', links: [['پرواز', '/flights'], ['هتل', '/hotels'], ['تور و زیارت', '/tours'], ['قطار', '/trains'], ['اتوبوس', '/buses'], ['ویزا', '/visa'], ['بیمه', '/insurance'], ['CIP و ترانسفر', '/cip']] },
  { title: 'راهنمایی و پشتیبانی', links: [['پیگیری خرید', '/track-order'], ['مرکز راهنما', '/help'], ['راهنمای خرید', '/help/purchase-guide'], ['راهنمای استرداد', '/help/refund-guide'], ['پشتیبانی', '/support'], ['تماس با ما', '/contact']] },
  { title: 'درباره و اعتماد', links: [['درباره ما', '/about'], ['قوانین و مقررات', '/terms'], ['حریم خصوصی', '/privacy'], ['مجوزها و اعتماد', '/licenses'], ['همکاری سازمانی', '/business-travel'], ['باشگاه مشتریان', '/club']] },
  { title: 'کشف و محتوا', links: [['مقصدهای محبوب', '/destinations'], ['مجله سفر', '/blog'], ['مسیرهای پرطرفدار', '/routes'], ['آمادگی سفر', '/travel-preparation']] },
];

const Footer = () => <footer className="mt-auto border-t border-accent/25 bg-[hsl(var(--earth-cream))] text-foreground">
  <div className="container-page py-12 sm:py-16">
    <div className="grid gap-10 lg:grid-cols-[minmax(11rem,1.1fr)_minmax(0,4fr)]">
      <div>
        <Link to="/" className="inline-flex"><img src="/kiashi-logo.png" alt="کیاشی" className="h-11 w-auto max-w-[124px] object-contain object-right" /></Link>
        <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">همراه شما برای جست‌وجو، رزرو و پیگیری خدمات سفر.</p>
        <div className="mt-5 flex gap-2"><span title="اینستاگرام کیاشی" className="rounded-lg border border-border bg-card p-2 text-muted-foreground"><Instagram className="size-4" /></span><span title="کانال کیاشی" className="rounded-lg border border-border bg-card p-2 text-muted-foreground"><Send className="size-4" /></span><Link to="/contact" aria-label="تماس با پشتیبانی" className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:border-primary hover:bg-primary hover:text-white"><Headphones className="size-4" /></Link></div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">{groups.map((group) => <div key={group.title} className="min-w-0"><h2 className="mb-4 text-sm font-bold text-foreground">{group.title}</h2><ul className="space-y-3">{group.links.map(([label, to]) => <li key={to}><Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-primary">{label}</Link></li>)}</ul></div>)}</div>
    </div>
    <div className="mt-8 grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center"><span>© {new Date().getFullYear()} کیاشی — سامانه رزرو و برنامه‌ریزی سفر</span><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary"/><span>پرداخت امن · پشتیبانی و پیگیری آنلاین سفارش‌ها</span></div></div>
  </div>
</footer>;
export default Footer;
