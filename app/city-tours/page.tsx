import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("city-tours");
export default function Page() { return <PublicLanding page="city-tours" />; }
