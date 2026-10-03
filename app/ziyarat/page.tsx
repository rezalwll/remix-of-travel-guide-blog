import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
import { ManagedProgramCatalog } from "@/components/experience/ManagedProgramCatalog";
export const metadata = publicPageMetadata("ziyarat");
export default function Page() { return <><PublicLanding page="ziyarat" /><ManagedProgramCatalog type="ZIYARAT" /></>; }
