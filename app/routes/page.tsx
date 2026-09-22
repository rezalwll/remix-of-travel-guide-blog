import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("routes");
export default function Page() { return <PublicLanding page="routes" />; }
