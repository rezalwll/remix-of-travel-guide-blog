import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/backoffice/reports/summary?preset=30d" title="گزارش مدیریتی" description="تعاریف متریک‌ها در سرور یکسان‌سازی شده‌اند؛ این پوسته فقط خروجی جمع‌بندی را نمایش می‌دهد." mode="summary" />; }

