import { backend, type ApiTracking } from './backend';

export const findPublicOrder = async (number: string, mobile: string): Promise<ApiTracking> => (await backend.track(number.trim(), mobile.replace(/\s/g, ''))).tracking;
export const maskMobile = (mobile: string) => mobile.length > 4 ? `${mobile.slice(0,4)}•••••••` : '••••';
