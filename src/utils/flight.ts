import type { FlightResult, FlightFilters, FlightSortMode } from '@/types/flight';

export const formatPersianNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
export const formatPrice = (value: number) => `${formatPersianNumber(value)} تومان`;
export const toPersianDigits = (value: string | number) => String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
export const formatDuration = (minutes: number) => `${formatPersianNumber(Math.floor(minutes / 60))} ساعت و ${formatPersianNumber(minutes % 60)} دقیقه`;
export const departureBucket = (dateTime: string) => { const hour = Number(dateTime.slice(11, 13)); if (hour < 6) return 'صبح زود'; if (hour < 12) return 'صبح'; if (hour < 18) return 'بعدازظهر'; return 'شب'; };
export const formatTime = (dateTime: string) => toPersianDigits(dateTime.slice(11, 16));
export const filterFlights = (flights: FlightResult[], filters: FlightFilters) => flights.filter((flight) => (!filters.airlines.length || filters.airlines.includes(flight.airlineCode)) && flight.price <= filters.maxPrice && (!filters.stops.length || filters.stops.includes(flight.stops === 0 ? 'direct' : flight.stops === 1 ? 'one' : 'two')) && (!filters.departureBuckets.length || filters.departureBuckets.includes(departureBucket(flight.departure))) && (!filters.refundableOnly || flight.refundable) && (!filters.kinds.length || filters.kinds.includes(flight.kind)) && (!filters.baggage30 || flight.baggageKg >= 30));
export const sortFlights = (flights: FlightResult[], mode: FlightSortMode) => [...flights].sort((a, b) => { if (mode === 'price') return a.price - b.price; if (mode === 'duration') return a.durationMinutes - b.durationMinutes; if (mode === 'early') return a.departure.localeCompare(b.departure); if (mode === 'late') return b.departure.localeCompare(a.departure); return (a.price + a.durationMinutes * 2200 + a.stops * 180000) - (b.price + b.durationMinutes * 2200 + b.stops * 180000); });
