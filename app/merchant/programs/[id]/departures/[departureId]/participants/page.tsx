import ParticipantList from "@/components/platform/ParticipantList";
export default async function Page({params}:{params:Promise<{id:string;departureId:string}>}){const{id,departureId}=await params;return <ParticipantList scope="merchant" programId={id} departureId={departureId}/>}
