import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/merchant/orders?preset=30d" title="سفارش‌های سازمان" description="اطلاعات مشتریان در این خروجی محدود و شناسه‌های مستقیم ماسک شده‌اند." dataKey="orders" columns={[{ key: "orderNumber", label: "شماره سفارش" }, { key: "serviceType", label: "خدمت" }, { key: "customer.name", label: "مسافر" }, { key: "customer.mobile", label: "موبایل" }, { key: "total", label: "مبلغ" }, { key: "bookingStatus", label: "رزرو" }]} />; }

