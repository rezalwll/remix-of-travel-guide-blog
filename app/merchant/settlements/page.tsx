import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/merchant/settlements" title="دوره‌های تسویه" description="وضعیت‌های عملیاتی تسویه؛ شناسه نمایشی به معنی انتقال بانکی واقعی نیست." dataKey="settlements" columns={[{ key: "periodStart", label: "شروع" }, { key: "periodEnd", label: "پایان" }, { key: "grossAmount", label: "ناخالص" }, { key: "commissionAmount", label: "کمیسیون" }, { key: "payableAmount", label: "قابل پرداخت" }, { key: "status", label: "وضعیت" }]} />; }

