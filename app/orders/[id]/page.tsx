import { privateMetadata } from "@/seo/metadata";
import LegacyPage from "@/components/next/LegacyPage";

export const metadata = privateMetadata("جزئیات سفارش");

export default function OrderDetailPage() {
  return <LegacyPage name="OrderDetail" guard="protected" />;
}
