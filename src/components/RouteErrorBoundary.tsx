import { Component, type ErrorInfo, type ReactNode } from 'react';

export class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('route render failed', error.name, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="container-page grid min-h-screen place-items-center py-12" dir="rtl"><section role="alert" className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center"><h1 className="text-xl font-extrabold">نمایش این صفحه با مشکل روبه‌رو شد</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">اطلاعات شما از بین نرفته است. صفحه را دوباره بارگذاری کنید یا به خانه برگردید.</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">بارگذاری دوباره</button><a href="/" className="rounded-lg border border-border px-4 py-3 text-sm font-bold">خانه</a></div></section></main>;
  }
}
