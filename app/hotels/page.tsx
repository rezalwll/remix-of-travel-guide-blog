import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("hotels");
export default function Page() { return <PublicLanding page="hotels" />; }
