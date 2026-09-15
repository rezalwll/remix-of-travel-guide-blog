import type { VisaApplication } from '@/types/secondary';
const KEY='kiashi.visaApplications';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]') as VisaApplication[]}catch{return []}};
const write=(items:VisaApplication[])=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch{/* demo storage */}};
export const visaCountries=[{slug:'canada',name:'کانادا',types:['توریستی','تجاری']},{slug:'uk',name:'انگلستان',types:['توریستی','دیدار خانواده']},{slug:'uae',name:'امارات',types:['توریستی','ترانزیت']},{slug:'russia',name:'روسیه',types:['توریستی','الکترونیکی']},{slug:'china',name:'چین',types:['توریستی','تجاری']},{slug:'india',name:'هند',types:['توریستی','الکترونیکی']},{slug:'schengen',name:'کشورهای شنگن',types:['توریستی','تجاری']},{slug:'turkey',name:'ترکیه',types:['توریستی','الکترونیکی']},{slug:'azerbaijan',name:'آذربایجان',types:['توریستی','الکترونیکی']},{slug:'iraq',name:'عراق',types:['توریستی','زیارتی']}];
export const createVisaApplication=(application:Omit<VisaApplication,'id'|'createdAt'|'updatedAt'|'status'|'trackingNumber'>)=>{const now=new Date().toISOString();const item:VisaApplication={...application,id:`visa-${Date.now()}`,status:'submitted',createdAt:now,updatedAt:now,trackingNumber:`VISA-${String(Date.now()).slice(-8)}`};write([...read(),item]);return item};
export const listVisaApplications=(userId?:string)=>read().filter((item)=>!userId||item.userId===userId);
export const getVisaCountry=(slug:string)=>visaCountries.find((item)=>item.slug===slug);
