import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("buses");
export default function Page() { return <PublicLanding page="buses" />; }
