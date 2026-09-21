import LegacyPage from "@/components/next/LegacyPage";
import { privateMetadata } from "@/seo/metadata";

export const dynamic = "force-dynamic";
export const metadata = privateMetadata("نتایج جست‌وجوی هتل", "ترکیب‌های فیلتر و تاریخ اقامت برای جلوگیری از محتوای تکراری ایندکس نمی‌شوند.");
export default function HotelSearchPage() { return <LegacyPage name="HotelSearchResults" />; }
