import { privateMetadata } from "@/seo/metadata";
import { ManagedProgramDetail } from "@/components/experience/ManagedProgramCatalog";
export const metadata=privateMetadata("برنامه زیارتی مدیریت‌شده");
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <ManagedProgramDetail slug={slug}/>;}
