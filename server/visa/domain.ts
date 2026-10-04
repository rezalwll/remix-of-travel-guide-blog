import { DomainError } from "../domain/errors.js";

export const visaStatuses = ["DRAFT", "SUBMITTED", "DOCUMENTS_REQUIRED", "UNDER_REVIEW", "READY_FOR_SUBMISSION", "SUBMITTED_TO_PROVIDER", "DECISION_RECEIVED", "COMPLETED", "REJECTED", "CANCELLED"] as const;
export type VisaStatus = (typeof visaStatuses)[number];

export const visaDocumentKeys = ["passport", "photo", "insurance", "financialProof", "reservations", "applicationForms"] as const;
export type VisaDocumentKey = (typeof visaDocumentKeys)[number];
export const visaDocumentStates = ["missing", "requested", "received", "verified", "not_required"] as const;
export type VisaDocumentState = (typeof visaDocumentStates)[number];

const transitions: Record<VisaStatus, readonly VisaStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["DOCUMENTS_REQUIRED", "UNDER_REVIEW", "CANCELLED"],
  DOCUMENTS_REQUIRED: ["SUBMITTED", "CANCELLED"],
  UNDER_REVIEW: ["DOCUMENTS_REQUIRED", "READY_FOR_SUBMISSION", "REJECTED", "CANCELLED"],
  READY_FOR_SUBMISSION: ["SUBMITTED_TO_PROVIDER", "DOCUMENTS_REQUIRED", "CANCELLED"],
  SUBMITTED_TO_PROVIDER: ["DECISION_RECEIVED"],
  DECISION_RECEIVED: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function normalizeVisaStatus(value: string): VisaStatus {
  const normalized = value.toUpperCase();
  if (!visaStatuses.includes(normalized as VisaStatus)) throw new DomainError("VISA_STATUS_INVALID", "وضعیت پرونده ویزا معتبر نیست", 409);
  return normalized as VisaStatus;
}

export function assertVisaTransition(fromValue: string, toValue: string) {
  const from = normalizeVisaStatus(fromValue);
  const to = normalizeVisaStatus(toValue);
  if (from === to) return;
  if (!transitions[from].includes(to)) throw new DomainError("VISA_TRANSITION_INVALID", `تغییر وضعیت ویزا از ${from} به ${to} مجاز نیست`, 409);
}

export function emptyVisaChecklist() {
  return Object.fromEntries(visaDocumentKeys.map((key) => [key, { status: "missing" as VisaDocumentState, note: "" }]));
}

export function publicVisaPayload(value: unknown) {
  const payload = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    applicant: payload.applicant ?? {},
    travelDates: payload.travelDates ?? null,
    purpose: payload.purpose ?? null,
    checklist: payload.checklist ?? emptyVisaChecklist(),
    customerNote: payload.customerNote ?? null,
    timeline: Array.isArray(payload.timeline) ? payload.timeline.filter((entry) => entry && typeof entry === "object" && (entry as Record<string, unknown>).audience !== "internal") : [],
  };
}

export function customerEditableVisaPayload(value: unknown) {
  const payload = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return { applicant: payload.applicant ?? {}, travelDates: payload.travelDates ?? null, purpose: payload.purpose ?? null };
}

