export const bookingStatuses = ['paid_booking_pending', 'confirmed', 'reservation_failed', 'compensation_pending', 'refunded', 'manual_review_required'] as const;
export type BookingStatus = typeof bookingStatuses[number];
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export const bookingStatusView: Record<BookingStatus, { label: string; message: string; tone: 'good' | 'warn' | 'bad' | 'muted' }> = {
  paid_booking_pending: { label: 'در انتظار تأیید تأمین‌کننده', message: 'پرداخت ثبت شده و تأیید نهایی رزرو در حال انجام است.', tone: 'warn' },
  confirmed: { label: 'تأییدشده', message: 'رزرو توسط تأمین‌کننده تأیید شده است.', tone: 'good' },
  reservation_failed: { label: 'رزرو ناموفق', message: 'تأمین‌کننده رزرو را نپذیرفت؛ جبران مالی آغاز می‌شود.', tone: 'bad' },
  compensation_pending: { label: 'بازپرداخت در حال انجام', message: 'رزرو انجام نشد و بازپرداخت وجه در حال پردازش است.', tone: 'warn' },
  refunded: { label: 'وجه بازگردانده شد', message: 'رزرو انجام نشد و مبلغ پرداختی به منابع پرداخت بازگردانده شد.', tone: 'muted' },
  manual_review_required: { label: 'نیازمند بررسی', message: 'نتیجه تأمین‌کننده قطعی نیست؛ تا روشن‌شدن وضعیت، بازپرداخت خودکار انجام نمی‌شود.', tone: 'warn' },
};

export const viewForBookingStatus = (status: string) => bookingStatusView[status as BookingStatus] ?? { label: status, message: 'وضعیت سفارش در حال بررسی است.', tone: 'muted' as const };
