import { Coffee, MapPin, Star, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Hotel, HotelSearchParams } from '@/types/hotel';
import { getHotelStartingPrice } from '@/services/hotelService';
import { formatPrice } from '@/utils/flight';

export const HotelCard = ({ hotel, search }: { hotel: Hotel; search: HotelSearchParams }) => {
  const nightly = getHotelStartingPrice(hotel);
  const nights = Math.max(1, Math.round((new Date(`${search.checkOut}T00:00:00`).getTime() - new Date(`${search.checkIn}T00:00:00`).getTime()) / 86400000));
  const query = new URLSearchParams({ destination: search.destination, checkin: search.checkIn, checkout: search.checkOut, rooms: String(search.rooms), adults: String(search.adults), children: String(search.children) });
  const discounted = hotel.rooms.some((room) => room.ratePlans.some((rate) => rate.originalNightlyPrice));
  return <article className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-secondary/50 hover:shadow-md sm:grid sm:grid-cols-[250px_1fr]">
    <Link to={`/hotels/${hotel.slug}?${query}`} className="block h-52 sm:h-full"><img src={hotel.images[0]} alt={`نمای هتل ${hotel.name}`} className="size-full object-cover" loading="lazy" /></Link>
    <div className="flex flex-col p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><div className="flex items-center gap-2"><h2 className="text-lg font-extrabold">{hotel.name}</h2><span className="flex text-amber-500" aria-label={`${hotel.stars} ستاره`}>{Array.from({ length: hotel.stars }).map((_, index) => <Star key={index} className="size-3 fill-current" />)}</span></div><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5 text-secondary" /> {hotel.city}، {hotel.area} · {hotel.distanceFromCenter} کیلومتر تا مرکز</p></div><span className="rounded-lg bg-secondary px-2.5 py-1.5 text-sm font-extrabold text-white">{hotel.rating.toLocaleString('fa-IR')} <small className="font-normal">از ۵</small></span></div>
      <div className="mt-4 flex flex-wrap gap-2">{hotel.amenities.slice(0, 4).map((amenity) => <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">{amenity === 'صبحانه' ? <Coffee className="size-3" /> : amenity === 'وای‌فای' ? <Wifi className="size-3" /> : null}{amenity}</span>)}{hotel.rooms.some((room) => room.ratePlans.some((rate) => rate.refundable)) && <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-bold text-secondary">قابل استرداد</span>}</div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5"><p className="text-xs text-muted-foreground">{hotel.reviewCount.toLocaleString('fa-IR')} نظر نمونه</p><div className="text-end">{discounted && <p className="text-[11px] font-bold text-primary">نرخ ویژه دمو</p>}<p className="text-xs text-muted-foreground">از شبی</p><p className="text-lg font-extrabold text-primary">{formatPrice(nightly)}</p><p className="text-[11px] text-muted-foreground">مجموع {nights.toLocaleString('fa-IR')} شب: {formatPrice(nightly * nights * search.rooms)}</p><Link to={`/hotels/${hotel.slug}?${query}`} className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white">مشاهده اتاق‌ها</Link></div></div>
    </div>
  </article>;
};
