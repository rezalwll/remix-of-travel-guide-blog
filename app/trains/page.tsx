import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("trains");
export default function Page() { return <PublicLanding page="trains" />; }
