import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("insurance");
export default function Page() { return <PublicLanding page="insurance" />; }
