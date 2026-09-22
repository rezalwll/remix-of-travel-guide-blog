import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("fast-track");
export default function Page() { return <PublicLanding page="fast-track" />; }
