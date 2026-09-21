import { useEffect, useMemo, useState } from 'react';
import { Building2, CreditCard, Info, Landmark, LockKeyhole, WalletCards } from 'lucide-react';
import { Link, useNavigate } from '@/lib/router';
import Layout from '@/components/layout/Layout';
import { BookingSummary, CheckoutStepper, EmptyCheckout } from '@/components/checkout/CheckoutShared';
import { calculateInstallmentPlans, createServerCheckout, getWallet, payServerCheckout } from '@/services/payment';
import { readBookingDraft } from '@/store/booking';
import type { PaymentMethodKind } from '@/types/payment';
import type { ApiCheckout, ApiWallet } from '@/services/backend';
import { formatPrice } from '@/utils/flight';

const newIdempotencyKey = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const [draft] = useState(() => readBookingDraft());
  const [checkout, setCheckout] = useState<ApiCheckout | null>(null);
  const [wallet, setWallet] = useState<ApiWallet | null>(null);
  const [method, setMethod] = useState<PaymentMethodKind>('online');
  const [planId, setPlanId] = useState('plan-3');
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!draft) { setProcessing(false); return; }
    let active = true;
    Promise.all([createServerCheckout(draft), getWallet()])
      .then(([nextCheckout, nextWallet]) => { if (active) { setCheckout(nextCheckout); setWallet(nextWallet); } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'آماده‌سازی پرداخت انجام نشد.'); })
      .finally(() => { if (active) setProcessing(false); });
    return () => { active = false; };
  }, [draft]);

  const plans = useMemo(() => calculateInstallmentPlans(checkout?.total ?? 0), [checkout?.total]);
  if (!draft || !draft.termsAccepted) return <Layout><EmptyCheckout /></Layout>;

  const total = checkout?.total ?? 0;
  const walletBalance = wallet?.balance ?? 0;
  const walletAmount = method === 'wallet' || method === 'combined' ? Math.min(walletBalance, total) : 0;
  const onlineAmount = total - walletAmount;
  const continuePayment = async () => {
    if (!checkout) return;
    const idempotencyKey = newIdempotencyKey();
    const plan = method === 'installment' ? plans.find((item) => item.id === planId) : undefined;
    const metadata = plan ? { installmentPlan: plan } : undefined;
    if (method === 'online' || method === 'combined') {
      const params = new URLSearchParams({ checkout: checkout.id, method, key: idempotencyKey, amount: String(onlineAmount) });
      navigate(`/checkout/gateway?${params.toString()}`);
      return;
    }
    setProcessing(true); setError('');
    try {
      const { order } = await payServerCheckout(checkout.id, method, idempotencyKey, metadata);
      navigate(`/checkout/result?order=${order.id}&state=success`, { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'پرداخت انجام نشد.'); setProcessing(false); }
  };

  const methods = [
    { id: 'online' as const, title: 'پرداخت آنلاین', description: 'پرداخت از درگاه آزمایشی', icon: CreditCard },
    { id: 'wallet' as const, title: 'کیف پول', description: `موجودی: ${formatPrice(walletBalance)}`, icon: WalletCards },
    { id: 'combined' as const, title: 'پرداخت ترکیبی', description: 'استفاده از کیف پول و درگاه', icon: Landmark },
    { id: 'installment' as const, title: 'پرداخت اقساطی', description: 'اعتبارسنجی آزمایشی · چند طرح', icon: Info },
    { id: 'organization' as const, title: 'اعتبار سفر سازمانی', description: 'اعتبار شرکت یا کد کارمند (دمو)', icon: Building2 },
  ];

  return <Layout><main className="bg-muted/40"><div className="container-page py-5 pb-28 sm:py-8"><CheckoutStepper active={3} firstLabel={draft.serviceType === 'flight' ? undefined : 'اطلاعات مسافران'} /><div className="grid gap-5 lg:grid-cols-[1fr_330px]"><div className="space-y-5"><BookingSummary draft={draft} compact /><section className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="mb-4 flex items-center gap-2"><LockKeyhole className="size-5 text-secondary" /><div><h1 className="font-extrabold">روش پرداخت</h1><p className="mt-1 text-xs text-muted-foreground">مبلغ نهایی و تسویه توسط سرور محاسبه می‌شود.</p></div></div>{error && <p role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="grid gap-3 sm:grid-cols-2">{methods.map(({ id, title, description, icon: Icon }) => <button type="button" key={id} onClick={() => setMethod(id)} className={`rounded-xl border p-4 text-start ${method === id ? 'border-primary bg-primary/5' : 'border-border'}`}><div className="flex justify-between"><span className="grid size-10 place-items-center rounded-lg bg-secondary/10 text-secondary"><Icon className="size-5" /></span><span className={`size-4 rounded-full border-2 ${method === id ? 'border-primary bg-primary' : 'border-border'}`} /></div><h2 className="mt-4 font-bold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></button>)}</div>{method === 'combined' && <div className="mt-4 rounded-xl bg-secondary/5 p-4 text-sm"><div className="flex justify-between"><span>سهم کیف پول</span><strong>{formatPrice(walletAmount)}</strong></div><div className="mt-2 flex justify-between"><span>پرداخت آنلاین</span><strong>{formatPrice(onlineAmount)}</strong></div></div>}{method === 'installment' && <div className="mt-4 grid gap-3 sm:grid-cols-2">{plans.map((plan) => <button type="button" key={plan.id} onClick={() => setPlanId(plan.id)} className={`rounded-xl border p-4 text-start ${plan.id === planId ? 'border-primary' : 'border-border'}`}><p className="font-bold">{plan.label}</p><p className="mt-2 text-sm">پیش‌پرداخت: {formatPrice(plan.upfront)}</p><p className="mt-1 text-xs text-muted-foreground">قسط ماهانه: {formatPrice(plan.monthly)}</p></button>)}</div>}<div className="mt-5 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning"><Info className="size-4 shrink-0" /> اطلاعات بانکی واقعی وارد نکنید؛ درگاه همچنان آزمایشی است.</div></section></div><aside className="h-fit space-y-3 lg:sticky lg:top-24"><section className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">مبلغ authoritative سرور</p><p className="mt-2 text-2xl font-extrabold text-primary">{processing ? 'در حال محاسبه...' : formatPrice(total)}</p><p className="mt-3 text-xs leading-6 text-muted-foreground">قیمت نمایشی صفحات قبل ممکن است با کاتالوگ ثابت backend تفاوت داشته باشد.</p></section><button type="button" onClick={continuePayment} disabled={processing || !checkout || (method === 'wallet' && walletBalance < total)} className="hidden w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40 lg:block">{processing ? 'در حال آماده‌سازی...' : 'ادامه پرداخت'}</button><Link to="/checkout/review" className="hidden text-center text-xs font-bold text-secondary lg:block">بازگشت</Link></aside></div><div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-3 lg:hidden"><button type="button" onClick={continuePayment} disabled={processing || !checkout || (method === 'wallet' && walletBalance < total)} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40">ادامه پرداخت {checkout ? `· ${formatPrice(total)}` : ''}</button></div></div></main></Layout>;
};

export default CheckoutPayment;
