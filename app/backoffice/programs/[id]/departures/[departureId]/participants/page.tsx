import ParticipantList from "@/components/platform/ParticipantList";
export default async function Page({params}:{params:Promise<{id:string;departureId:string}>}){const{id,departureId}=await params;return <ParticipantList scope="backoffice" programId={id} departureId={departureId}/>}
