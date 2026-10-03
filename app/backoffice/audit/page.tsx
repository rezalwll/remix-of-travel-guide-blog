import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/backoffice/audit?preset=30d" title="ردپای ممیزی" description="رکوردهای append-only عملیات حساس با request ID و بازیگر ثبت‌شده." dataKey="audit" columns={[{ key: "createdAt", label: "زمان" }, { key: "action", label: "عملیات" }, { key: "resourceType", label: "منبع" }, { key: "resourceId", label: "شناسه" }, { key: "actorUserId", label: "کاربر" }, { key: "requestId", label: "درخواست" }]} />; }

