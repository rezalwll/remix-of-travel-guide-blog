import { PublicLanding, publicPageMetadata } from "@/components/next/PublicLanding";
import { ManagedHotelCatalog } from "@/components/hotel/ManagedHotelCatalog";
export const metadata = publicPageMetadata("hotels");
export default function Page() { return <><PublicLanding page="hotels" /><ManagedHotelCatalog /></>; }
