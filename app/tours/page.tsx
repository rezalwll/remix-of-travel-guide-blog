import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("tours");
export default function Page() { return <PublicLanding page="tours" />; }
