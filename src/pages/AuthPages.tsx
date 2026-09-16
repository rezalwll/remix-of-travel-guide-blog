import { useState } from 'react';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { demoOtp, requestOtp } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

const pending = {
  mobile: 'kiashi.pending.mobile',
  challenge: 'kiashi.pending.challenge',
  registration: 'kiashi.pending.registration',
  returnTo: 'kiashi.pending.returnTo',
};

const AuthCard = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => <Layout><main className="flex min-h-[75vh] items-center justify-center bg-muted/40 px-4 py-10"><div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"><div className="mb-7 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-xl font-extrabold text-white">ک</span><h1 className="mt-4 text-2xl font-extrabold">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p></div>{children}</div></main></Layout>;
const MobileField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => <label className="block"><span className="mb-1.5 block text-xs font-bold">شماره موبایل</span><input value={value} onChange={(e) => onChange(e.target.value)} inputMode="tel" dir="ltr" placeholder="09121234567" className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-left text-sm outline-none focus:ring-2 focus:ring-ring" /></label>;

const beginOtp = async (mobile: string, returnTo: string, registration?: Record<string, string>) => {
  const result = await requestOtp(mobile);
  sessionStorage.setItem(pending.mobile, mobile);
  sessionStorage.setItem(pending.challenge, result.challengeId);
  sessionStorage.setItem(pending.returnTo, returnTo);
  if (registration) sessionStorage.setItem(pending.registration, JSON.stringify(registration));
};

export const Login = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!/^09\d{9}$/.test(mobile)) return setError('شماره موبایل معتبر وارد کنید.');
    setSubmitting(true); setError('');
    try { await beginOtp(mobile, query.get('returnTo') || '/account'); navigate('/auth/otp'); }
    catch (err) { setError(err instanceof Error ? err.message : 'ارسال کد انجام نشد.'); }
    finally { setSubmitting(false); }
  };
  return <AuthCard title="ورود به کی‌آشی" subtitle="با شماره موبایل وارد حساب کاربری شوید."><MobileField value={mobile} onChange={setMobile} />{error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}<button type="button" disabled={submitting} onClick={submit} className="mt-5 w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50">{submitting ? 'در حال ارسال...' : 'دریافت کد ورود'}</button><p className="mt-5 text-center text-xs text-muted-foreground">حساب ندارید؟ <Link to="/auth/register" className="font-bold text-secondary">ثبت‌نام کنید</Link></p><p className="mt-5 rounded-lg bg-secondary/5 p-3 text-center text-[11px] leading-5 text-muted-foreground">کاربر دمو: 09121234567 · کد آزمایشی: 12345</p></AuthCard>;
};

export const Register = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ firstName: '', lastName: '', mobile: '', email: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!values.firstName || !values.lastName || !/^09\d{9}$/.test(values.mobile)) return setError('نام، نام خانوادگی و شماره موبایل معتبر الزامی است.');
    setSubmitting(true); setError('');
    try { await beginOtp(values.mobile, '/account', { firstName: values.firstName, lastName: values.lastName, email: values.email }); navigate('/auth/otp'); }
    catch (err) { setError(err instanceof Error ? err.message : 'ارسال کد انجام نشد.'); }
    finally { setSubmitting(false); }
  };
  return <AuthCard title="ساخت حساب کاربری" subtitle="ثبت‌نام سریع با شماره موبایل، بدون رمز عبور."><div className="space-y-3"><input value={values.firstName} onChange={(e) => setValues({ ...values, firstName: e.target.value })} placeholder="نام" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /><input value={values.lastName} onChange={(e) => setValues({ ...values, lastName: e.target.value })} placeholder="نام خانوادگی" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /><MobileField value={values.mobile} onChange={(mobile) => setValues({ ...values, mobile })} /><input value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="ایمیل (اختیاری)" dir="ltr" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /></div>{error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}<button type="button" disabled={submitting} onClick={submit} className="mt-5 w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50">{submitting ? 'در حال ارسال...' : 'ادامه و دریافت کد'}</button><p className="mt-5 text-center text-xs text-muted-foreground">قبلاً ثبت‌نام کرده‌اید؟ <Link to="/auth/login" className="font-bold text-secondary">ورود</Link></p></AuthCard>;
};

export const Otp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const mobile = sessionStorage.getItem(pending.mobile) || '';
  const challengeId = sessionStorage.getItem(pending.challenge) || '';
  const [code, setCode] = useState(demoOtp);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!challengeId) return setError('درخواست ورود منقضی شده است؛ دوباره کد بگیرید.');
    setSubmitting(true); setError('');
    try {
      const registration = JSON.parse(sessionStorage.getItem(pending.registration) || 'null');
      await login(challengeId, code, registration || undefined);
      const target = sessionStorage.getItem(pending.returnTo) || '/account';
      Object.values(pending).forEach((key) => sessionStorage.removeItem(key));
      navigate(target, { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'کد واردشده صحیح نیست.'); }
    finally { setSubmitting(false); }
  };
  return <AuthCard title="تأیید شماره موبایل" subtitle={`کد آزمایشی برای ${mobile || 'شماره شما'} ارسال شده است.`}><input autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" dir="ltr" className="min-h-14 w-full rounded-lg border border-border bg-background px-3 text-center text-xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring" aria-label="کد یکبارمصرف" />{error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}<p className="mt-3 flex items-center justify-center gap-1 text-xs text-secondary"><ShieldCheck className="size-4" /> کد آزمایشی: 12345</p><button type="button" disabled={submitting} onClick={submit} className="mt-5 w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50">{submitting ? 'در حال تأیید...' : 'تأیید و ورود'}</button><button type="button" onClick={() => navigate('/auth/login')} className="mt-3 w-full text-xs font-bold text-muted-foreground">ویرایش شماره</button></AuthCard>;
};

export const ForgotPassword = () => <AuthCard title="ورود بدون رمز عبور" subtitle="ورود به کی‌آشی با کد یک‌بارمصرف انجام می‌شود و نیازی به بازیابی رمز عبور نیست."><Link to="/auth/login" className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-white">ورود با شماره موبایل <ArrowLeft className="size-4" /></Link><div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-4" /> کد ورود روی API اعتبارسنجی و session در cookie امن نگهداری می‌شود.</div></AuthCard>;
