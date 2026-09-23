import type { ApiOrder } from './backend';

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' ? value : '';

export const serviceLabel = (type: string) => ({ flight: 'پرواز', hotel: 'هتل', tour: 'تور', ziyarat: 'زیارت', train: 'قطار', bus: 'اتوبوس', insurance: 'بیمه مسافرتی', cip: 'CIP فرودگاهی', transfer: 'ترانسفر فرودگاهی' }[type] || type);

export const orderTitle = (order: ApiOrder) => {
  const snapshot = asRecord(order.serviceSnapshot);
  const hotel = asRecord(snapshot.hotel);
  const offer = asRecord(snapshot.offer);
  const item = asRecord(snapshot.item);
  const outbound = asRecord(snapshot.outbound);
  if (text(hotel.name)) return text(hotel.name);
  if (text(offer.title)) return text(offer.title);
  if (text(item.name)) return text(item.name);
  if (text(item.trainName)) return text(item.trainName);
  if (text(item.company)) return text(item.company);
  if (text(outbound.fromCity) || text(outbound.toCity)) return `${text(outbound.fromCity) || 'مبدأ'} ← ${text(outbound.toCity) || 'مقصد'}`;
  return `${serviceLabel(order.serviceType)} کیاشی`;
};

export const paymentReference = (order: ApiOrder) => text(asRecord(order.paymentSnapshot).reference) || order.trackingCode;
export const paymentMethodLabel = (order: ApiOrder) => text(asRecord(order.paymentSnapshot).method) || 'پرداخت آزمایشی';
export const travelerName = (value: unknown) => {
  const traveler = asRecord(value);
  return [text(traveler.firstName) || text(traveler.firstNameFa), text(traveler.lastName) || text(traveler.lastNameFa)].filter(Boolean).join(' ') || 'مسافر';
};
