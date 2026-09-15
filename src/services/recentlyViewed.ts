export type RecentlyViewedItem = { type: 'hotel' | 'tour' | 'destination'; id: string; viewedAt: string };
const KEY='kiashi.recently-viewed';
const read=():RecentlyViewedItem[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]') as RecentlyViewedItem[]}catch{return[]}};
export const recordRecentlyViewed=(type:RecentlyViewedItem['type'],id:string)=>{const next=[{type,id,viewedAt:new Date().toISOString()},...read().filter((item)=>!(item.type===type&&item.id===id))].slice(0,8);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{/* optional storage */}return next};
export const listRecentlyViewed=()=>read();
export const clearRecentlyViewed=()=>{try{localStorage.removeItem(KEY)}catch{/* optional storage */}};
