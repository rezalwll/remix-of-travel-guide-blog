import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("visa");
export default function Page() { return <PublicLanding page="visa" />; }
