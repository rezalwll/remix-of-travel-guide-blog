import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return <Layout><main className="container-page flex min-h-[55vh] items-center justify-center py-20"><div className="text-center"><p className="mb-3 text-sm font-semibold text-primary">خطای ۴۰۴</p><h1 className="mb-4 text-4xl font-extrabold">صفحه پیدا نشد</h1><p className="mb-6 text-muted-foreground">آدرس واردشده وجود ندارد یا جابه‌جا شده است.</p><Link to="/" className="text-primary underline hover:text-primary/90">بازگشت به صفحه اصلی</Link></div></main></Layout>;
};

export default NotFound;
