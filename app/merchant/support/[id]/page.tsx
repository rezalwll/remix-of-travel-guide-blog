import SupportDetail from "@/components/platform/SupportDetail";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <SupportDetail scope="merchant" id={id}/>}
