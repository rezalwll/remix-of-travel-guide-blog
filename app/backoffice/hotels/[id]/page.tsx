import{HotelEditor}from"@/components/platform/HotelManagement";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <HotelEditor scope="backoffice" id={id}/>}
