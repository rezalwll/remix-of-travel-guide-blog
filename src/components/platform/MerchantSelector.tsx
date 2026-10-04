"use client";

import { useEffect, useState } from "react";

type Merchant={id:string;name:string;merchantProfile?:{businessType?:string|null;merchantCode?:string|null}|null};

export default function MerchantSelector({businessType,value,onChange,label="پذیرنده"}:{businessType:string;value:string;onChange:(value:string)=>void;label?:string}){
  const[items,setItems]=useState<Merchant[]>([]);const[error,setError]=useState("");
  useEffect(()=>{fetch(`/api/backoffice/merchants?businessType=${encodeURIComponent(businessType)}&perPage=100`,{credentials:"include",cache:"no-store"}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error?.message??"پذیرنده‌ها دریافت نشدند");setItems(body.merchants??[])}).catch(reason=>setError(reason.message))},[businessType]);
  return <label className="text-xs font-bold">{label}<select className="mt-1 min-h-11 w-full rounded-xl border bg-white px-3 font-normal" value={value} onChange={event=>onChange(event.target.value)}><option value="">انتخاب کنید</option>{items.map(item=><option key={item.id} value={item.id}>{item.name}{item.merchantProfile?.merchantCode?` · ${item.merchantProfile.merchantCode}`:""}</option>)}</select>{error&&<span className="mt-1 block text-[11px] text-red-700">{error}</span>}</label>;
}
