export default function Loading() {
  return <main className="container-page py-10" role="status" aria-live="polite"><span className="sr-only">در حال بارگذاری صفحه</span><div className="space-y-4"><div className="h-10 w-2/3 animate-pulse rounded-xl bg-muted" /><div className="h-5 w-full animate-pulse rounded-lg bg-muted" /><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div></main>;
}
