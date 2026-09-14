import { Link } from 'react-router-dom';
import { Instagram, Send, Headphones } from 'lucide-react';

const groups = [
  { title: 'خدمات سفر', links: [['پرواز داخلی و خارجی', '/flights'], ['رزرو هتل', '/hotels'], ['تورهای سفر', '/tours'], ['قطار و اتوبوس', '/trains']] },
  { title: 'راهنمایی و پشتیبانی', links: [['پیگیری سفارش', '/account/orders'], ['پشتیبانی', '/support'], ['قوانین و مقررات', '/terms'], ['سوالات متداول', '/faq']] },
  { title: 'کشف مقصدها', links: [['مقصدهای محبوب', '/destinations'], ['مجله سفر', '/blog'], ['بیمه مسافرتی', '/insurance'], ['خدمات ویزا', '/visa']] },
];

const Footer = () => <footer className="mt-auto bg-[hsl(220_22%_17%)] text-white/80">
  <div className="container-page py-12 sm:py-16">
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_2fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-white"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">ک</span> کی‌آشی</Link>
        <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">همراه مطمئن شما برای برنامه‌ریزی، رزرو و تجربه‌ی بهتر سفر.</p>
        <div className="mt-5 flex gap-2"><a href="#" aria-label="اینستاگرام" className="rounded-lg bg-white/10 p-2 hover:bg-primary"><Instagram className="size-4" /></a><a href="#" aria-label="تلگرام" className="rounded-lg bg-white/10 p-2 hover:bg-primary"><Send className="size-4" /></a><a href="tel:02100000000" aria-label="تماس با پشتیبانی" className="rounded-lg bg-white/10 p-2 hover:bg-primary"><Headphones className="size-4" /></a></div>
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><h2 className="mb-4 text-sm font-bold text-white">{group.title}</h2><ul className="space-y-3">{group.links.map(([label, to]) => <li key={to}><Link to={to} className="text-sm text-white/60 transition hover:text-white">{label}</Link></li>)}</ul></div>)}</div>
    </div>
    <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} کی‌آشی — تمامی حقوق محفوظ است.</span><span>پلتفرم مستقل رزرو و برنامه‌ریزی سفر</span></div>
  </div>
</footer>;
export default Footer;
