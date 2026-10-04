import{MerchantDetail}from"@/components/platform/MerchantManagement";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <MerchantDetail id={id}/>}
