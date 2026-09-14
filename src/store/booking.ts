import type { BookingDraft } from '@/types/checkout';

const KEY = 'kiashi-booking-draft';
export const readBookingDraft = (): BookingDraft | null => { try { const raw = sessionStorage.getItem(KEY); return raw ? JSON.parse(raw) as BookingDraft : null; } catch { return null; } };
export const writeBookingDraft = (draft: BookingDraft) => { try { sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* storage is optional in prototype */ } };
export const clearBookingDraft = () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } };
