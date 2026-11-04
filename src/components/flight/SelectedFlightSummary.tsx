import { ArrowLeft, Check } from 'lucide-react';
import type { FlightResult } from '@/types/flight';
import { formatPrice, formatTime } from '@/utils/flight';

const SelectedFlightSummary = ({ outbound, inbound, requiresReturn = false, onContinue }: { outbound: FlightResult | null; inbound: FlightResult | null; requiresReturn?: boolean; onContinue: () => void }) => {
  if (!outbound && !inbound) return null;
  const total = (outbound?.price ?? 0) + (inbound?.price ?? 0);
  const canContinue = Boolean(outbound && (!requiresReturn || inbound));
  return (
    <div className="fixed inset-x-3 top-[84px] z-40 mx-auto max-w-xl rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:top-[88px] sm:mx-0 sm:w-[min(36rem,calc(100vw-2rem))]" role="status" aria-live="polite">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 font-bold text-secondary">
            <Check className="size-4" /> {outbound ? 'پرواز رفت انتخاب شد' : 'پرواز را انتخاب کنید'}
          </span>
          {outbound && <span className="text-muted-foreground">رفت: {outbound.fromCity} → {outbound.toCity} · {formatTime(outbound.departure)}</span>}
          {inbound && <span className="text-muted-foreground">برگشت: {inbound.fromCity} → {inbound.toCity} · {formatTime(inbound.departure)}</span>}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-end">
            <p className="text-[11px] text-muted-foreground">مجموع تقریبی</p>
            <p className="font-extrabold text-primary">{formatPrice(total)}</p>
          </div>
          <button type="button" onClick={onContinue} disabled={!canContinue} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45">
            {requiresReturn && !inbound ? 'انتخاب برگشت' : 'ادامه رزرو'} <ArrowLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SelectedFlightSummary;
