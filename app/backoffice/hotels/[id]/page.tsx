import{HotelEditor}from"@/components/platform/HotelEditor";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <HotelEditor scope="backoffice" id={id}/>}
