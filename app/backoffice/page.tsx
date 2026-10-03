import PlatformResourceView from "@/components/platform/PlatformResourceView";

export default function BackofficeDashboardPage() {
  return <PlatformResourceView endpoint="/api/backoffice/dashboard/summary?preset=30d" title="نمای کلی عملیات" description="شاخص‌های عملیاتی ۳۰ روز اخیر؛ محاسبه‌شده در API و مبتنی بر وضعیت‌های مرجع." mode="summary" />;
}

