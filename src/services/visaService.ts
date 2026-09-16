import { backend, type ApiVisaApplication } from './backend';

export const visaCountries=[{slug:'canada',name:'کانادا',types:['توریستی','تجاری']},{slug:'uk',name:'انگلستان',types:['توریستی','دیدار خانواده']},{slug:'uae',name:'امارات',types:['توریستی','ترانزیت']},{slug:'russia',name:'روسیه',types:['توریستی','الکترونیکی']},{slug:'china',name:'چین',types:['توریستی','تجاری']},{slug:'india',name:'هند',types:['توریستی','الکترونیکی']},{slug:'schengen',name:'کشورهای شنگن',types:['توریستی','تجاری']},{slug:'turkey',name:'ترکیه',types:['توریستی','الکترونیکی']},{slug:'azerbaijan',name:'آذربایجان',types:['توریستی','الکترونیکی']},{slug:'iraq',name:'عراق',types:['توریستی','زیارتی']}];
export const createVisaApplication = async (application: Record<string, unknown> & { country: string }) => (await backend.createVisaApplication(application.country, application)).application;
export const listVisaApplications = async () => (await backend.visaApplications()).applications;
export const getVisaCountry=(slug:string)=>visaCountries.find((item)=>item.slug===slug);
export type VisaApplication = ApiVisaApplication;
