import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("cip");
export default function Page() { return <PublicLanding page="cip" />; }
