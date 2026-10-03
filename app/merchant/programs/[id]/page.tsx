import ProgramEditor from "@/components/platform/ProgramEditor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ProgramEditor scope="merchant" id={id} />; }
