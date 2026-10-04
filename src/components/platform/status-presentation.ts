export const operationalStatusLabels: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  SUBMITTED: "ارسال‌شده برای بررسی",
  NEEDS_CHANGES: "نیازمند اصلاح",
  REJECTED: "ردشده",
  PUBLISHED: "منتشرشده",
  PAUSED: "متوقف موقت",
  ARCHIVED: "بایگانی‌شده",
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  SUSPENDED: "تعلیق‌شده",
  OPEN: "باز",
  LOW_CAPACITY: "ظرفیت محدود",
  FULL: "تکمیل ظرفیت",
  CLOSED: "بسته",
  DEPARTED: "حرکت‌کرده",
  CANCELLED: "لغوشده",
  requested: "درخواست‌شده",
  processing: "در حال پردازش",
  completed: "تکمیل‌شده",
  failed: "ناموفق",
  paid: "پرداخت‌شده",
  refunded: "مستردشده",
  confirmed: "تأییدشده",
  paid_booking_pending: "پرداخت‌شده؛ در انتظار رزرو",
  reservation_failed: "رزرو ناموفق",
  compensation_pending: "در انتظار جبران مالی",
  manual_review_required: "نیازمند بررسی دستی",
  open: "باز",
  pending: "در انتظار پاسخ",
  resolved: "حل‌شده",
  closed: "بسته",
};

export function operationalStatusLabel(value: unknown) {
  const key = String(value ?? "");
  return operationalStatusLabels[key] ?? key;
}
