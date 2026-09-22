import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("flights");
export default function Page() { return <PublicLanding page="flights" />; }
