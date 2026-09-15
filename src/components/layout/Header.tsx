import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Headphones, Menu, Search, UserRound, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const primaryLinks = [
  { label: 'پرواز', to: '/flights' }, { label: 'هتل', to: '/hotels' },
  { label: 'تور', to: '/tours' }, { label: 'قطار', to: '/trains' },
  { label: 'اتوبوس', to: '/buses' }, { label: 'زیارت', to: '/ziyarat' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) => cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-foreground/75');
  const close = () => setOpen(false);

  return <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
    <div className="container-page flex h-16 items-center justify-between gap-4">
      <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="کی‌آشی، صفحه اصلی">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground">ک</span>
        <span className="hidden text-lg font-extrabold tracking-tight sm:block">کی‌آشی</span>
      </Link>

      <nav className="hidden items-center gap-5 lg:flex" aria-label="خدمات اصلی">
        {primaryLinks.map((item) => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}
        <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
          <button type="button" onClick={() => setMoreOpen((value) => !value)} className="flex items-center gap-1 text-sm font-medium text-foreground/75 hover:text-primary" aria-expanded={moreOpen}>
            بیشتر <ChevronDown className="size-4" />
          </button>
          {moreOpen && <div className="absolute start-0 top-full mt-3 min-w-44 rounded-xl border border-border bg-card p-2 shadow-lg">
            {[['ویزا', '/visa'], ['بیمه سفر', '/insurance'], ['CIP فرودگاه', '/cip'], ['ترانسفر', '/transfer'], ['Fast Track', '/fast-track'], ['eSIM', '/esim'], ['مجله سفر', '/blog'], ['مرکز راهنما', '/help']].map(([label, to]) => <Link key={to} to={to} onClick={() => setMoreOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted hover:text-primary">{label}</Link>)}
          </div>}
        </div>
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        <Link to="/support" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-muted hover:text-primary"><Headphones className="size-4" /> پشتیبانی</Link>
        <Link to="/track-order" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-muted hover:text-primary"><Search className="size-4" /> پیگیری خرید</Link>
        {user ? <div className="flex items-center gap-2"><Link to="/account" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary"><UserRound className="size-4" /> {user.firstName}</Link><button type="button" onClick={logout} className="rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted">خروج</button></div> : <Link to="/auth/login" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary"><UserRound className="size-4" /> ورود / ثبت‌نام</Link>}
      </div>

      <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label={open ? 'بستن منو' : 'باز کردن منو'} aria-expanded={open}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
    </div>
    {open && <div className="border-t border-border bg-card lg:hidden">
      <nav className="container-page flex flex-col gap-1 py-3" aria-label="منوی موبایل">
        {primaryLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={close} className={({ isActive }) => cn('rounded-lg px-3 py-3 text-sm font-medium', isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}>{item.label}</NavLink>)}
        {[['ویزا', '/visa'], ['بیمه سفر', '/insurance'], ['CIP فرودگاه', '/cip'], ['ترانسفر', '/transfer'], ['Fast Track', '/fast-track'], ['eSIM', '/esim'], ['پیگیری خرید', '/track-order'], ['مجله سفر', '/blog'], ['مرکز راهنما', '/help'], [user ? 'حساب کاربری' : 'ورود / ثبت‌نام', user ? '/account' : '/auth/login']].map(([label, to]) => <Link key={to} to={to} onClick={close} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">{label}</Link>)}
      </nav>
    </div>}
  </header>;
};
export default Header;
