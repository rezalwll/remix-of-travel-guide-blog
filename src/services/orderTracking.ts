import type { MockOrder } from '@/types/payment';
import { listOrders } from './payment';

export type TrackingResult = { order: MockOrder } | { error: 'not_found' | 'mobile_mismatch' };
export const findPublicOrder = (number: string, mobile: string, orders: MockOrder[] = listOrders()): TrackingResult => { const order=orders.find((item)=>[item.id,item.orderNumber,item.payment.transactionReference].includes(number.trim())); if(!order)return {error:'not_found'}; return order.buyer.mobile===mobile.replace(/\s/g,'')?{order}:{error:'mobile_mismatch'}; };
export const maskMobile = (mobile: string) => mobile.length > 4 ? `${mobile.slice(0,4)}•••••••` : '••••';
