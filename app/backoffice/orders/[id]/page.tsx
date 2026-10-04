import {AdaptiveOrderDetail}from"@/components/platform/UnifiedOperations";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <AdaptiveOrderDetail id={id}/>}
