import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
import { ManagedProgramCatalog } from "@/components/experience/ManagedProgramCatalog";
export const metadata = publicPageMetadata("tours");
export default function Page() { return <><PublicLanding page="tours" /><ManagedProgramCatalog type="TOUR" /></>; }
