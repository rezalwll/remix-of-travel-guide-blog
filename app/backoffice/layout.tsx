import { privateMetadata } from "@/seo/metadata";
import PlatformShell from "@/components/platform/PlatformShell";

export const metadata = privateMetadata("پنل داخلی");
export const dynamic = "force-dynamic";

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return <PlatformShell scope="backoffice">{children}</PlatformShell>;
}

