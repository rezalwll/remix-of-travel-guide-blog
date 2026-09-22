import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
export const metadata = publicPageMetadata("transfer");
export default function Page() { return <PublicLanding page="transfer" />; }
