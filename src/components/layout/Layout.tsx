import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="fixed start-3 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white focus:translate-y-0">رفتن به محتوای اصلی</a>
      <Header />
      <div id="main-content" className="flex-1" tabIndex={-1}>{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
