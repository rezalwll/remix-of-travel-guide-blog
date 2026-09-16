import { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { payServerCheckout } from '@/services/payment';
import type { PaymentMethodKind } from '@/types/payment';
import { formatPrice } from '@/utils/flight';

const MockGateway = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const checkoutId = query.get('checkout') || '';
  const method = (query.get('method') || 'online') as PaymentMethodKind;
  const idempotencyKey = query.get('key') || '';
  const amount = Number(query.get('amount') || 0);
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState('6037 9999 0000 0001');
  const [error, setError] = useState('');

  if (!checkoutId || !idempotencyKey) return <Layout><main className="container-page flex min-h-[65vh] items-center justify-center py-16"><div className="rounded-2xl border border-border bg-card p-8 text-center"><h1 className="text-xl font-extrabold">پرداخت آزمایشی پیدا نشد</h1><button type="button" onClick={() => navigate('/checkout/payment')} className="mt-5 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">بازگشت به پرداخت</button></div></main></Layout>;

  const simulate = async (state: 'success' | 'failed' | 'cancelled') => {
    if (state !== 'success') { navigate(`/checkout/result?state=${state}`); return; }
    setProcessing(true); setError('');
    try {
      const { order } = await payServerCheckout(checkoutId, method, idempotencyKey);
      navigate(`/checkout/result?order=${order.id}&state=success`, { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'تسویه پرداخت انجام نشد.'); setProcessing(false); }
  };

  return <Layout><main className="min-h-[75vh] bg-muted/40 py-8"><div className="container-page"><div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="bg-[hsl(220_22%_17%)] p-5 text-white"><div className="flex items-center justify-between"><div><p className="text-xs text-white/60">درگاه پرداخت</p><h1 className="mt-1 text-lg font-extrabold">درگاه آزمایشی کی‌آشی</h1></div><LockKeyhole className="size-6 text-white/60" /></div><p className="mt-5 text-2xl font-extrabold">{formatPrice(amount)}</p><p className="mt-1 text-xs text-white/60">مبلغ پرداخت آنلاین</p></div><div className="space-y-5 p-5"><div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs leading-6 text-warning"><strong>درگاه آزمایشی — اطلاعات بانکی واقعی وارد نکنید.</strong><br />این فرم هیچ داده کارتی به API ارسال نمی‌کند.</div>{error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<label className="block"><span className="mb-1.5 block text-xs font-bold">شماره کارت نمایشی</span><input value={card} onChange={(e) => setCard(e.target.value)} dir="ltr" className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-left text-sm tracking-widest outline-none focus:ring-2 focus:ring-ring" /><span className="mt-1 block text-[11px] text-muted-foreground">نمونه: 6037 9999 0000 0001</span></label><div className="grid gap-3 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold">CVV2 نمایشی</span><input defaultValue="123" dir="ltr" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" /></label><label><span className="mb-1.5 block text-xs font-bold">رمز پویا نمایشی</span><input defaultValue="123456" dir="ltr" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" /></label></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-secondary" /> تنها checkout و روش پرداخت برای تسویه به سرور ارسال می‌شود.</div><div className="grid gap-2 sm:grid-cols-3"><button type="button" disabled={processing} onClick={() => void simulate('success')} className="min-h-11 rounded-lg bg-secondary text-xs font-bold text-white disabled:opacity-50">{processing ? 'در حال ثبت...' : 'شبیه‌سازی موفق'}</button><button type="button" disabled={processing} onClick={() => void simulate('failed')} className="min-h-11 rounded-lg border border-destructive/30 text-xs font-bold text-destructive disabled:opacity-50">شبیه‌سازی ناموفق</button><button type="button" disabled={processing} onClick={() => void simulate('cancelled')} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-border text-xs font-bold disabled:opacity-50"><ArrowRight className="size-3.5" /> انصراف</button></div></div></div></div></main></Layout>;
};

export default MockGateway;
