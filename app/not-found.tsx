import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return <main className="container-page grid min-h-[65vh] place-items-center py-16 text-center"><section><Compass className="mx-auto size-14 text-secondary" /><p className="mt-5 text-sm font-bold text-primary">خطای ۴۰۴</p><h1 className="mt-2 text-3xl font-black">این مسیر پیدا نشد</h1><p className="mt-3 text-sm text-muted-foreground">ممکن است نشانی تغییر کرده باشد یا صفحه در دسترس نباشد.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><Link href="/" className="primary-cta">صفحه اصلی</Link><Link href="/support" className="secondary-cta">مرکز راهنما</Link></div></section></main>;
}
