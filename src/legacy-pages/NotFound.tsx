import { Link } from "@/lib/router";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  return <Layout><main className="container-page flex min-h-[55vh] items-center justify-center py-20"><div className="max-w-xl text-center"><p className="mb-3 text-sm font-semibold text-primary">خطای ۴۰۴</p><h1 className="mb-4 text-4xl font-extrabold">این مسیر پیدا نشد</h1><p className="mb-7 text-sm leading-7 text-muted-foreground">ممکن است آدرس تغییر کرده باشد. از یکی از مسیرهای زیر ادامه دهید.</p><div className="flex flex-wrap justify-center gap-2"><Link to="/" className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">صفحه اصلی</Link><Link to="/flights" className="rounded-lg border border-border px-4 py-3 text-sm font-bold">پرواز</Link><Link to="/hotels" className="rounded-lg border border-border px-4 py-3 text-sm font-bold">هتل</Link><Link to="/help" className="rounded-lg border border-border px-4 py-3 text-sm font-bold">مرکز راهنما</Link></div></div></main></Layout>;
};

export default NotFound;
