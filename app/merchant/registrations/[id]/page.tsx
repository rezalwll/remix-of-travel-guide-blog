import RegistrationDetail from "@/components/platform/RegistrationDetail";
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <RegistrationDetail scope="merchant" id={id}/>}
