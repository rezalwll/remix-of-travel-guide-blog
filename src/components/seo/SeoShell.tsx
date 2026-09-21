import type { ReactNode } from "react";

export default function SeoShell({ children }: { children: ReactNode }) {
  return <main id="main-content" className="min-h-[70vh] bg-muted/35"><div className="container-page py-8 sm:py-12">{children}</div></main>;
}
