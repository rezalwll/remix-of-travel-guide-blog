import { useEffect, useState } from 'react';
import { Bus, CalendarDays, Compass, Hotel, Plane, TrainFront } from 'lucide-react';
import { Link } from '@/lib/router';
import Layout from '@/components/layout/Layout';
import { AccountLayout } from '@/components/account/AccountLayout';
import { backend, type ApiOrder } from '@/services/backend';
import { orderTitle, serviceLabel } from '@/services/orderView';
import { formatPrice } from '@/utils/flight';
import MediaFrame from '@/components/media/MediaFrame';
import { serviceAsset } from '@/media/library';

const iconFor = (type: string) => type === 'hotel' ? Hotel : type === 'train' ? TrainFront : type === 'bus' ? Bus : type === 'tour' || type === 'ziyarat' ? Compass : Plane;
const mediaFor = (type: string) => type === 'flight' ? 'flights' : type === 'hotel' ? 'hotels' : type === 'train' ? 'trains' : type === 'bus' ? 'buses' : type;

export default function AccountTrips() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; backend.orders().then(({ orders: items }) => { if (active) setOrders(items); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const now = Date.now();
  const upcoming = orders.filter((order) => !order.relevantDate || new Date(order.relevantDate).getTime() >= now);
  const past = orders.filter((order) => order.relevantDate && new Date(order.relevantDate).getTime() < now);
  const Group = ({ items, title }: { items: ApiOrder[]; title: string }) => <section className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{items.length} سفر</span></div>{loading ? <p className="py-8 text-center text-sm text-muted-foreground">در حال دریافت سفرها...</p> : items.length ? <div className="space-y-3">{items.map((order) => { const Icon = iconFor(order.serviceType); return <Link to={`/account/orders/${order.id}`} key={order.id} className="group flex items-center gap-3 overflow-hidden rounded-xl border border-border p-3 hover:border-secondary"><MediaFrame asset={serviceAsset(mediaFor(order.serviceType), `تصویرسازی ${serviceLabel(order.serviceType)}`)} ratio="1/1" sizes="72px" decorative className="hidden size-[4.5rem] shrink-0 rounded-lg sm:block" /><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary sm:hidden"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{serviceLabel(order.serviceType)} · {order.orderNumber}</p><p className="mt-1 truncate font-bold group-hover:text-primary">{orderTitle(order)}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> {new Date(order.relevantDate || order.createdAt).toLocaleDateString('fa-IR')} · {formatPrice(order.total)}</p></div><span className="text-xs font-bold text-secondary">جزئیات ←</span></Link>; })}</div> : <div className="rounded-xl bg-muted/35 p-8 text-center"><Compass className="mx-auto size-9 text-secondary" /><p className="mt-3 text-sm font-bold">هنوز سفری در این بخش ندارید.</p><Link to="/destinations" className="mt-4 inline-flex text-xs font-bold text-primary">دیدن مقصدها ←</Link></div>}</section>;
  return <Layout><AccountLayout><div className="space-y-5"><div><p className="text-xs font-bold text-primary">Travel Center</p><h2 className="mt-1 text-2xl font-extrabold">سفرهای من</h2><p className="mt-2 text-sm text-muted-foreground">رزروهای ذخیره‌شده در حساب و PostgreSQL را یکجا ببینید.</p></div><Group items={upcoming} title="سفرهای پیش رو" /><Group items={past} title="سفرهای گذشته" /></div></AccountLayout></Layout>;
}
