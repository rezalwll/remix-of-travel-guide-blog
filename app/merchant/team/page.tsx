import PlatformResourceView from "@/components/platform/PlatformResourceView";
export default function Page() { return <PlatformResourceView endpoint="/api/merchant/team" title="اعضای تیم" description="اعضا و نقش‌ها فقط در محدوده همین سازمان نمایش داده می‌شوند." dataKey="team" columns={[{ key: "user.firstName", label: "نام" }, { key: "user.lastName", label: "نام خانوادگی" }, { key: "user.mobile", label: "موبایل" }, { key: "roles", label: "نقش‌ها" }, { key: "status", label: "وضعیت" }, { key: "joinedAt", label: "عضویت" }]} />; }

