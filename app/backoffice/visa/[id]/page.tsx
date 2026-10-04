import { VisaCaseDetail } from "@/components/platform/VisaOperations";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <VisaCaseDetail id={id}/>}

