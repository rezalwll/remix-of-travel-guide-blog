import SupportCenter from "@/components/next/SupportCenter";
import { createMetadata } from "@/seo/metadata";
import { routePolicy } from "@/seo/routes";
const policy = routePolicy("/support")!;
export const metadata = createMetadata({ title: policy.title, description: policy.description, path: policy.path });
export default function Page() { return <SupportCenter />; }
