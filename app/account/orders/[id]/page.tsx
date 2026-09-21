import { privateMetadata } from "@/seo/metadata";
import LegacyPage from "@/components/next/LegacyPage";

export const metadata = privateMetadata("جزئیات سفارش حساب");

export default function AccountOrderDetailPage() {
  return <LegacyPage name="AccountPage" guard="protected" />;
}
