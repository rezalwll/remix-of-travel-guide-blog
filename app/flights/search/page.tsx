import LegacyPage from "@/components/next/LegacyPage";
import { privateMetadata } from "@/seo/metadata";

export const dynamic = "force-dynamic";
export const metadata = privateMetadata("نتایج جست‌وجوی پرواز", "ترکیب‌های جست‌وجو برای جلوگیری از محتوای تکراری ایندکس نمی‌شوند.");
export default function FlightSearchPage() { return <LegacyPage name="FlightSearchResults" />; }
