export const reportingTimezone = "Asia/Tehran";

export type OperationalRecord = {
  total: number;
  paymentStatus: string;
  bookingStatus: string;
  refundAmount?: number;
  commissionAmount?: number;
  merchantPayable?: number;
};

export function summarizeOperationalRecords(records: readonly OperationalRecord[]) {
  return records.reduce((totals, record) => {
    totals.orders += 1;
    totals.grossAmount += record.paymentStatus === "paid" ? record.total : 0;
    totals.paymentSucceeded += record.paymentStatus === "paid" ? 1 : 0;
    totals.paymentFailed += ["failed", "cancelled"].includes(record.paymentStatus) ? 1 : 0;
    totals.bookingSucceeded += record.bookingStatus === "confirmed" ? 1 : 0;
    totals.bookingFailed += record.bookingStatus === "reservation_failed" ? 1 : 0;
    totals.manualReview += record.bookingStatus === "manual_review_required" ? 1 : 0;
    totals.completedOrders += record.paymentStatus === "paid" && record.bookingStatus === "confirmed" ? 1 : 0;
    if ((record.refundAmount ?? 0) > 0) totals.refunds += 1;
    totals.refundAmount += record.refundAmount ?? 0;
    totals.commissionAmount += record.commissionAmount ?? 0;
    totals.merchantPayable += record.merchantPayable ?? 0;
    return totals;
  }, {
    orders: 0,
    completedOrders: 0,
    grossAmount: 0,
    paymentSucceeded: 0,
    paymentFailed: 0,
    bookingSucceeded: 0,
    bookingFailed: 0,
    refunds: 0,
    refundAmount: 0,
    manualReview: 0,
    commissionAmount: 0,
    merchantPayable: 0,
  });
}

export type ReportPreset = "today" | "7d" | "30d" | "current_month";

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: reportingTimezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return { year: value.year!, month: value.month!, day: value.day! };
}

function localMidnightUtc(year: number, month: number, day: number) {
  const guess = Date.UTC(year, month - 1, day);
  const localAtGuess = new Intl.DateTimeFormat("en-CA", { timeZone: reportingTimezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(guess));
  const values = Object.fromEntries(localAtGuess.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const representedAsUtc = Date.UTC(values.year!, values.month! - 1, values.day!, values.hour!, values.minute!, values.second!);
  return new Date(guess - (representedAsUtc - guess));
}

export function reportRange(preset: ReportPreset, now = new Date()) {
  const to = new Date(now);
  const from = new Date(now);
  if (preset === "today") {
    const parts = zonedParts(now);
    return { from: localMidnightUtc(parts.year, parts.month, parts.day), to, timezone: reportingTimezone };
  }
  if (preset === "7d") from.setUTCDate(from.getUTCDate() - 7);
  if (preset === "30d") from.setUTCDate(from.getUTCDate() - 30);
  if (preset === "current_month") {
    const parts = zonedParts(now);
    return { from: localMidnightUtc(parts.year, parts.month, 1), to, timezone: reportingTimezone };
  }
  return { from, to, timezone: reportingTimezone };
}
