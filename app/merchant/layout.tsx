import { privateMetadata } from "@/seo/metadata";
import PlatformShell from "@/components/platform/PlatformShell";

export const metadata = privateMetadata("پنل پذیرنده");
export const dynamic = "force-dynamic";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <PlatformShell scope="merchant">{children}</PlatformShell>;
}

