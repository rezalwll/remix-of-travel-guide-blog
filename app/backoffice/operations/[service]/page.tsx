import { notFound } from "next/navigation";
import ProviderOperations, { providerServiceLabels, type ProviderService } from "@/components/platform/ProviderOperations";

export default async function ProviderOperationsPage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (!(service in providerServiceLabels)) notFound();
  return <ProviderOperations service={service as ProviderService} />;
}

