import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function MerchantDashboardPage() { return <PlatformResourceView endpoint="/api/merchant/dashboard/summary?preset=30d" title="نمای کلی پذیرنده" description="خلاصهٔ ۳۰ روز اخیر فقط برای سازمانی که عضویت فعال آن تأیید شده است." mode="summary" />; }

