import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { createVisaApplication, getVisaCountry } from '@/services/visaService';
import { useAuth } from '@/context/AuthContext';

export default function VisaApply() {
  const { country = '' } = useParams();
  const item = getVisaCountry(country);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [values, setValues] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', mobile: user?.mobile || '', email: user?.email || '', nationality: 'ایران', passportNumber: '', passportExpiry: '', birthDate: '', departure: '2026-10-12', returnDate: '2026-10-20', purpose: 'گردشگری', notes: '' });
  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!item) return <Layout><main className="container-page py-16 text-center">کشور پیدا نشد</main></Layout>;
  const update = (key: string, value: string) => setValues({ ...values, [key]: value });
  const submit = async () => {
    if (!values.firstName || !values.lastName || !/^09\d{9}$/.test(values.mobile) || !values.passportNumber || !values.passportExpiry) return setError('اطلاعات اصلی متقاضی را کامل کنید.');
    setSubmitting(true); setError('');
    try {
      const application = await createVisaApplication({ country: item.name, visaType: item.types[0], applicant: { firstName: values.firstName, lastName: values.lastName, mobile: values.mobile, email: values.email, nationality: values.nationality, passportNumber: values.passportNumber, passportExpiry: values.passportExpiry, birthDate: values.birthDate }, travel: { departure: values.departure, returnDate: values.returnDate, purpose: values.purpose, notes: values.notes }, documents: files, notes: 'درخواست نمونه؛ ارسال رسمی انجام نشده است.', serviceFee: 850000 });
      navigate(`/account/visa?tracking=${application.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'ثبت درخواست انجام نشد.'); setSubmitting(false); }
  };
  return <Layout><main className="bg-muted/40 pb-16"><div className="container-page py-8"><div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-8"><p className="text-xs font-bold text-primary">درخواست ویزای نمونه · {item.name}</p><h1 className="mt-2 text-2xl font-extrabold">فرم درخواست</h1><div className="mt-6 grid gap-3 sm:grid-cols-2">{[['firstName','نام'],['lastName','نام خانوادگی'],['mobile','موبایل'],['email','ایمیل'],['nationality','ملیت'],['passportNumber','شماره گذرنامه']].map(([key,label]) => <label key={key} className="text-xs font-bold">{label}<input value={values[key as keyof typeof values]} onChange={(e) => update(key,e.target.value)} dir={key==='mobile'||key==='email'||key==='passportNumber'?'ltr':undefined} className="mt-1.5 min-h-11 w-full rounded-lg border border-border px-3 text-sm" /></label>)}<label className="text-xs font-bold">انقضای گذرنامه<input type="date" value={values.passportExpiry} onChange={(e) => update('passportExpiry',e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-border px-3" /></label><label className="text-xs font-bold">تاریخ تولد<input type="date" value={values.birthDate} onChange={(e) => update('birthDate',e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-border px-3" /></label><label className="text-xs font-bold">تاریخ حرکت<input type="date" value={values.departure} onChange={(e) => update('departure',e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-border px-3" /></label><label className="text-xs font-bold">تاریخ بازگشت<input type="date" value={values.returnDate} onChange={(e) => update('returnDate',e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-border px-3" /></label><label className="text-xs font-bold sm:col-span-2">هدف سفر<select value={values.purpose} onChange={(e) => update('purpose',e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3"><option>گردشگری</option><option>تجاری</option><option>دیدار خانواده</option></select></label><label className="text-xs font-bold sm:col-span-2">یادداشت<textarea value={values.notes} onChange={(e) => update('notes',e.target.value)} className="mt-1.5 min-h-20 w-full rounded-lg border border-border p-3" /></label><label className="rounded-xl border border-dashed border-border p-4 text-xs sm:col-span-2">انتخاب متادیتای مدارک<input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).map((file) => ({ name: file.name, size: file.size, type: file.type })))} className="mt-2 block w-full text-xs" /><span className="mt-2 block text-muted-foreground">فایل‌ها آپلود نمی‌شوند؛ فقط نام، اندازه و نوع در payload نمونه ذخیره می‌شود.</span></label></div>{error && <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<button type="button" disabled={submitting} onClick={() => void submit()} className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">{submitting ? 'در حال ثبت...' : 'ثبت درخواست نمونه'}</button></div></div></main></Layout>;
}
