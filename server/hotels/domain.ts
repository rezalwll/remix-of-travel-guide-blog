import { DomainError } from "../domain/errors.js";

export type HotelSourceType = "DIRECT" | "SUPPLIER" | "HYBRID" | "DEMO";
export type HotelPublicationStatus = "DRAFT" | "SUBMITTED" | "NEEDS_CHANGES" | "REJECTED" | "PUBLISHED" | "PAUSED" | "ARCHIVED";
export type InventoryDay = { date: Date; availableRooms: number; priceOverride?: number | null; closed?: boolean; minimumStay?: number };

export function assertManualInventoryAllowed(sourceType: HotelSourceType) {
  if (sourceType !== "DIRECT" && sourceType !== "DEMO") throw new DomainError("SUPPLIER_INVENTORY_AUTHORITATIVE", "موجودی هتل تأمین‌کننده با تقویم دستی قابل بازنویسی نیست", 409);
}

const publicationTransitions: Record<HotelPublicationStatus, readonly HotelPublicationStatus[]> = {
  DRAFT: ["SUBMITTED", "ARCHIVED"],
  SUBMITTED: ["NEEDS_CHANGES", "REJECTED", "PUBLISHED", "ARCHIVED"],
  NEEDS_CHANGES: ["SUBMITTED", "ARCHIVED"],
  REJECTED: ["SUBMITTED", "ARCHIVED"],
  PUBLISHED: ["PAUSED", "ARCHIVED"],
  PAUSED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: [],
};

export function assertPropertyPublicationTransition(from: HotelPublicationStatus, to: HotelPublicationStatus, scope: "INTERNAL" | "MERCHANT") {
  if (from === to) return;
  if (!publicationTransitions[from]?.includes(to)) throw new DomainError("INVALID_STATE_TRANSITION", "تغییر وضعیت انتشار هتل مجاز نیست", 409);
  if (scope === "MERCHANT" && ["PUBLISHED", "NEEDS_CHANGES", "REJECTED"].includes(to)) throw new DomainError("APPROVAL_REQUIRED", "تأیید و انتشار هتل فقط توسط بک‌آفیس انجام می‌شود", 403);
}

export function dateRange(from: Date, to: Date, weekdays?: number[]) {
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  if (end < start) throw new DomainError("INVALID_DATE_RANGE", "پایان بازه باید بعد از شروع باشد", 400);
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > 366) throw new DomainError("DATE_RANGE_TOO_LARGE", "بازه تقویم حداکثر ۳۶۶ روز است", 400);
  const accepted = weekdays?.length ? new Set(weekdays) : null;
  return Array.from({ length: days }, (_, index) => new Date(start.getTime() + index * 86_400_000)).filter((date) => !accepted || accepted.has(date.getUTCDay()));
}

export function inventoryPrice(baseRate: number, inventory?: { priceOverride: number | null; closed: boolean; availableRooms: number }) {
  if (inventory?.closed || inventory?.availableRooms === 0) return null;
  return inventory?.priceOverride ?? baseRate;
}

export function maskGuestMobile(value?: string | null) {
  if (!value) return null;
  return value.length >= 7 ? `${value.slice(0, 4)}***${value.slice(-4)}` : "***";
}

export function stayDates(checkIn: Date, checkOut: Date) {
  const dates = dateRange(checkIn, new Date(checkOut.getTime() - 86_400_000));
  if (!dates.length) throw new DomainError("INVALID_STAY", "اقامت باید حداقل یک شب باشد", 400);
  return dates;
}
