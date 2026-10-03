import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/merchant/finance/summary?preset=30d" title="خلاصه مالی" description="گردش دفترکل و تسویه‌ها بر حسب تومان؛ اجرای پرداخت بانکی در این فاز وجود ندارد." mode="summary" />; }

