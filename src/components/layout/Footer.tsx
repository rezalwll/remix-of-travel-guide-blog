import { Link } from '@/lib/router';
import { Instagram, Send, Headphones, ShieldCheck } from 'lucide-react';

const groups = [
  { title: 'خدمات سفر', links: [['پرواز', '/flights'], ['هتل', '/hotels'], ['تور و زیارت', '/tours'], ['قطار', '/trains'], ['اتوبوس', '/buses'], ['ویزا', '/visa'], ['بیمه', '/insurance'], ['CIP و ترانسفر', '/cip'], ['Fast Track', '/fast-track'], ['eSIM', '/esim']] },
  { title: 'راهنمایی و پشتیبانی', links: [['پیگیری خرید', '/track-order'], ['مرکز راهنما', '/help'], ['راهنمای خرید', '/help/purchase-guide'], ['راهنمای استرداد', '/help/refund-guide'], ['پشتیبانی', '/support'], ['تماس با ما', '/contact']] },
  { title: 'درباره و اعتماد', links: [['درباره ما', '/about'], ['قوانین و مقررات', '/terms'], ['حریم خصوصی', '/privacy'], ['مجوزها و اعتماد', '/licenses'], ['همکاری سازمانی', '/business-travel'], ['باشگاه مشتریان', '/club']] },
  { title: 'کشف و محتوا', links: [['مقصدهای محبوب', '/destinations'], ['مجله سفر', '/blog'], ['مسیرهای پرطرفدار', '/routes'], ['تجربه‌های شهری', '/city-tours'], ['آمادگی سفر', '/travel-preparation']] },
];

const Footer = () => <footer className="mt-auto bg-[hsl(220_22%_17%)] text-white/80">
  <div className="container-page py-12 sm:py-16">
    <div className="grid gap-10 lg:grid-cols-[minmax(11rem,1.1fr)_minmax(0,4fr)]">
      <div>
        <Link to="/" className="inline-flex"><img src="/kiashi-logo.png" alt="کیاشی" className="h-11 w-auto max-w-[124px] object-contain object-right brightness-0 invert" /></Link>
        <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">همراه مطمئن شما برای برنامه‌ریزی، رزرو و تجربه‌ی بهتر سفر.</p>
        <div className="mt-5 flex gap-2"><span title="شبکه اجتماعی پس از نهایی‌شدن اطلاعات کسب‌وکار درج می‌شود" className="rounded-lg bg-white/10 p-2 text-white/50"><Instagram className="size-4" /></span><span title="شبکه اجتماعی پس از نهایی‌شدن اطلاعات کسب‌وکار درج می‌شود" className="rounded-lg bg-white/10 p-2 text-white/50"><Send className="size-4" /></span><Link to="/contact" aria-label="تماس با پشتیبانی" className="rounded-lg bg-white/10 p-2 hover:bg-primary"><Headphones className="size-4" /></Link></div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">{groups.map((group) => <div key={group.title} className="min-w-0"><h2 className="mb-4 text-sm font-bold text-white">{group.title}</h2><ul className="space-y-3">{group.links.map(([label, to]) => <li key={to}><Link to={to} className="text-sm text-white/60 transition hover:text-white">{label}</Link></li>)}</ul></div>)}</div>
    </div>
    <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:grid-cols-[1fr_auto] sm:items-center"><span>© {new Date().getFullYear()} کیاشی — پلتفرم مستقل رزرو و برنامه‌ریزی سفر</span><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-secondary"/><span>پرداخت آزمایشی امن · اطلاعات مجوز پس از نهایی‌شدن قرارداد درج می‌شود</span></div></div>
  </div>
</footer>;
export default Footer;
