import { DomainError } from "../domain/errors.js";

export type ProgramType = "TOUR" | "ZIYARAT";
export type PublicationStatus = "DRAFT" | "SUBMITTED" | "NEEDS_CHANGES" | "REJECTED" | "PUBLISHED" | "PAUSED" | "ARCHIVED";
export type DepartureSaleStatus = "DRAFT" | "OPEN" | "LOW_CAPACITY" | "FULL" | "CLOSED" | "DEPARTED" | "CANCELLED";

export type ProgramCompleteness = {
  title?: string;
  description?: string;
  origin?: string;
  durationDays?: number;
  destinations: unknown[];
  departures: Array<{ saleStatus: string }>;
  packages: Array<{ status: string }>;
  itinerary: unknown[];
  cancellationPolicy?: string;
  media: Array<{ isCover: boolean }>;
  futureSalePolicy?: boolean;
};

const transitionMap: Record<PublicationStatus, readonly PublicationStatus[]> = {
  DRAFT: ["SUBMITTED", "ARCHIVED"],
  SUBMITTED: ["PUBLISHED", "NEEDS_CHANGES", "REJECTED", "ARCHIVED"],
  NEEDS_CHANGES: ["SUBMITTED", "ARCHIVED"],
  REJECTED: ["SUBMITTED", "ARCHIVED"],
  PUBLISHED: ["PAUSED", "ARCHIVED"],
  PAUSED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: [],
};

export function assertProgramTransition(from: PublicationStatus, to: PublicationStatus, scope: "MERCHANT" | "INTERNAL") {
  if (!transitionMap[from]?.includes(to)) throw new DomainError("INVALID_STATE_TRANSITION", "تغییر وضعیت انتشار برنامه مجاز نیست", 409);
  if (scope === "MERCHANT" && ["PUBLISHED", "NEEDS_CHANGES", "REJECTED"].includes(to)) {
    throw new DomainError("PERMISSION_DENIED", "تأیید و انتشار برنامه فقط توسط بک‌آفیس انجام می‌شود", 403);
  }
  if (scope === "MERCHANT" && from === "PUBLISHED" && to !== "PAUSED") {
    throw new DomainError("PERMISSION_DENIED", "پذیرنده فقط می‌تواند فروش برنامه منتشرشده را موقتاً متوقف کند", 403);
  }
}

export function publicationIssues(program: ProgramCompleteness) {
  const issues: string[] = [];
  if (!program.title?.trim()) issues.push("TITLE_REQUIRED");
  if (!program.description?.trim()) issues.push("DESCRIPTION_REQUIRED");
  if (!program.origin?.trim()) issues.push("ORIGIN_REQUIRED");
  if (!program.durationDays || program.durationDays < 1) issues.push("DURATION_REQUIRED");
  if (!program.destinations.length) issues.push("DESTINATION_REQUIRED");
  if (!program.futureSalePolicy && !program.departures.some((item) => !["CANCELLED", "DEPARTED"].includes(item.saleStatus))) issues.push("USABLE_DEPARTURE_REQUIRED");
  if (!program.packages.some((item) => item.status === "ACTIVE")) issues.push("ACTIVE_PACKAGE_REQUIRED");
  if (!program.itinerary.length) issues.push("ITINERARY_REQUIRED");
  if (!program.cancellationPolicy?.trim()) issues.push("CANCELLATION_POLICY_REQUIRED");
  if (!program.media.some((item) => item.isCover)) issues.push("COVER_IMAGE_REQUIRED");
  return issues;
}

export function assertPublishable(program: ProgramCompleteness) {
  const issues = publicationIssues(program);
  if (issues.length) throw new DomainError("PROGRAM_INCOMPLETE", `اطلاعات لازم برای ارسال یا انتشار برنامه کامل نیست: ${issues.join(", ")}`, 409);
}

export function capacitySnapshot(input: { totalCapacity: number; heldCapacity: number; bookedTravelers: number; confirmedTravelers: number; cancelledTravelers?: number }) {
  const totalCapacity = Math.max(0, Math.trunc(input.totalCapacity));
  const heldCapacity = Math.max(0, Math.min(totalCapacity, Math.trunc(input.heldCapacity)));
  const booked = Math.max(0, Math.trunc(input.bookedTravelers));
  const confirmed = Math.max(0, Math.min(booked, Math.trunc(input.confirmedTravelers)));
  const remaining = Math.max(0, totalCapacity - heldCapacity - booked);
  return { totalCapacity, heldCapacity, booked, confirmed, pending: booked - confirmed, cancelled: Math.max(0, Math.trunc(input.cancelledTravelers ?? 0)), remaining };
}

export function effectiveDepartureStatus(configured: DepartureSaleStatus, remaining: number, totalCapacity: number): DepartureSaleStatus {
  if (!["OPEN", "LOW_CAPACITY", "FULL"].includes(configured)) return configured;
  if (remaining <= 0) return "FULL";
  const lowThreshold = Math.max(3, Math.ceil(totalCapacity * 0.15));
  return remaining <= lowThreshold ? "LOW_CAPACITY" : "OPEN";
}

export function assertDepartureSaleable(input: { status: DepartureSaleStatus; remaining: number; now?: Date; salesStartAt?: Date | null; salesEndAt?: Date | null }) {
  const now = input.now ?? new Date();
  if (!["OPEN", "LOW_CAPACITY"].includes(input.status) || input.remaining < 1) throw new DomainError("PROGRAM_SOLD_OUT", "ظرفیت این حرکت برای فروش باز نیست", 409);
  if (input.salesStartAt && input.salesStartAt > now) throw new DomainError("PROGRAM_SALE_NOT_STARTED", "فروش این حرکت هنوز آغاز نشده است", 409);
  if (input.salesEndAt && input.salesEndAt <= now) throw new DomainError("PROGRAM_SALE_ENDED", "مهلت فروش این حرکت به پایان رسیده است", 409);
}

export function travelerAgeCategory(value: unknown) {
  if (!value || typeof value !== "object") return "adult";
  const category = (value as Record<string, unknown>).ageCategory ?? (value as Record<string, unknown>).type;
  return category === "child" || category === "infant" ? category : "adult";
}

export function calculatePackageTotal(pack: { adultPrice: number; childPrice: number; infantPrice: number }, travelers: unknown[]) {
  const counts = { adult: 0, child: 0, infant: 0 };
  for (const traveler of travelers) counts[travelerAgeCategory(traveler)] += 1;
  return counts.adult * pack.adultPrice + counts.child * pack.childPrice + counts.infant * pack.infantPrice;
}

export function csvCell(value: unknown) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function createParticipantCsv(rows: Array<Record<string, unknown>>, columns: Array<{ key: string; label: string }>) {
  const header = columns.map((column) => csvCell(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(","));
  return `\uFEFF${[header, ...body].join("\r\n")}\r\n`;
}

export function maskParticipantMobile(value: unknown) {
  const mobile = typeof value === "string" ? value : "";
  return mobile.length >= 8 ? `${mobile.slice(0, 4)}***${mobile.slice(-4)}` : mobile ? "***" : "";
}
