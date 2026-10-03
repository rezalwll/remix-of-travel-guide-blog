import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/backoffice/orders?preset=30d" title="سفارش‌ها" description="فهرست صفحه‌بندی‌شده سفارش‌ها بدون payload محرمانه تأمین‌کننده." dataKey="orders" columns={[{ key: "orderNumber", label: "شماره سفارش" }, { key: "serviceType", label: "خدمت" }, { key: "total", label: "مبلغ (تومان)" }, { key: "paymentStatus", label: "پرداخت" }, { key: "bookingStatus", label: "رزرو" }, { key: "createdAt", label: "ثبت" }]} />; }

