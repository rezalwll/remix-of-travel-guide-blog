import type { Destination, Hotel, Tour } from '@/types/travel';
import heroGreeceAsset from '@/assets/hero-greece.jpg';
import heroDesertAsset from '@/assets/hero-desert.jpg';
import heroCampingAsset from '@/assets/hero-camping.jpg';
import moroccoAsset from '@/assets/morocco.jpg';
import franceAsset from '@/assets/france.jpg';
import asiaTempleAsset from '@/assets/asia-temple.jpg';
import travelBooksAsset from '@/assets/travel-books.jpg';
import heroKishPremiumAsset from '@/assets/hero-kish-premium.png';
import hotelTehranPremiumAsset from '@/assets/hotel-tehran-premium.png';
import hotelIstanbulPremiumAsset from '@/assets/hotel-istanbul-premium.png';

const heroGreece = heroGreeceAsset.src;
const heroDesert = heroDesertAsset.src;
const heroCamping = heroCampingAsset.src;
const morocco = moroccoAsset.src;
const france = franceAsset.src;
const asiaTemple = asiaTempleAsset.src;
const travelBooks = travelBooksAsset.src;
const heroKishPremium = heroKishPremiumAsset.src;
const hotelTehranPremium = hotelTehranPremiumAsset.src;
const hotelIstanbulPremium = hotelIstanbulPremiumAsset.src;

export interface TravelLocation { id: string; city: string; airport: string; code: string; country: string; }
export interface Offer { id: string; title: string; description: string; image: string; accent: string; href: string; }
export interface RouteCard { id: string; from: string; to: string; price: string; hint: string; }
export interface ZiyaratOption { id: string; title: string; duration: string; type: string; date: string; price?: string; }
export interface TravelArticle { id: string; title: string; category: string; excerpt: string; image: string; readingTime: string; slug: string; }

export const travelLocations: TravelLocation[] = [
  { id: 'ika', city: 'تهران', airport: 'فرودگاه امام خمینی', code: 'IKA', country: 'ایران' },
  { id: 'thr', city: 'تهران', airport: 'فرودگاه مهرآباد', code: 'THR', country: 'ایران' },
  { id: 'mhd', city: 'مشهد', airport: 'فرودگاه شهید هاشمی‌نژاد', code: 'MHD', country: 'ایران' },
  { id: 'syz', city: 'شیراز', airport: 'فرودگاه شهید دستغیب', code: 'SYZ', country: 'ایران' },
  { id: 'ifn', city: 'اصفهان', airport: 'فرودگاه شهید بهشتی', code: 'IFN', country: 'ایران' },
  { id: 'tbz', city: 'تبریز', airport: 'فرودگاه شهید مدنی', code: 'TBZ', country: 'ایران' },
  { id: 'kish', city: 'کیش', airport: 'فرودگاه کیش', code: 'KIH', country: 'ایران' },
  { id: 'gsm', city: 'قشم', airport: 'فرودگاه دیرستان', code: 'GSM', country: 'ایران' },
  { id: 'ist', city: 'استانبول', airport: 'فرودگاه استانبول', code: 'IST', country: 'ترکیه' },
  { id: 'dxb', city: 'دبی', airport: 'فرودگاه بین‌المللی دبی', code: 'DXB', country: 'امارات' },
  { id: 'njf', city: 'نجف', airport: 'فرودگاه بین‌المللی نجف', code: 'NJF', country: 'عراق' },
  { id: 'bgw', city: 'بغداد', airport: 'فرودگاه بغداد', code: 'BGW', country: 'عراق' },
  { id: 'doh', city: 'دوحه', airport: 'فرودگاه حمد', code: 'DOH', country: 'قطر' },
  { id: 'cdg', city: 'پاریس', airport: 'فرودگاه شارل دوگل', code: 'CDG', country: 'فرانسه' },
  { id: 'lhr', city: 'لندن', airport: 'فرودگاه هیترو', code: 'LHR', country: 'انگلستان' },
];

const tourImage = (image: string): Tour['imageUrl'] => image;
export const featuredTours: Tour[] = [
  { id: 'tour-istanbul', title: 'تور استانبول', destination: 'استانبول، ترکیه', durationDays: 7, imageUrl: tourImage(hotelIstanbulPremium), dates: [{ id: 't1', startDate: '۱۴۰۵/۰۷/۲۲', endDate: '۱۴۰۵/۰۷/۲۸', remainingCapacity: 8, price: 29800000, currency: 'IRR' }], services: [{ title: 'پرواز رفت و برگشت', included: true }, { title: 'هتل ۵ ستاره', included: true }, { title: 'گشت شهری', included: true }] },
  { id: 'tour-dubai', title: 'تور دبی', destination: 'دبی، امارات', durationDays: 5, imageUrl: tourImage(heroDesert), dates: [{ id: 't2', startDate: '۱۴۰۵/۰۷/۲۸', endDate: '۱۴۰۵/۰۸/۰۲', remainingCapacity: 5, price: 38900000, currency: 'IRR' }], services: [{ title: 'پرواز رفت و برگشت', included: true }, { title: 'ترانسفر فرودگاهی', included: true }] },
  { id: 'tour-kish', title: 'تور کیش', destination: 'کیش، ایران', durationDays: 4, imageUrl: tourImage(heroKishPremium), dates: [{ id: 't3', startDate: '۱۴۰۵/۰۸/۰۵', endDate: '۱۴۰۵/۰۸/۰۸', remainingCapacity: 12, price: 12500000, currency: 'IRR' }], services: [{ title: 'هتل ۵ ستاره', included: true }, { title: 'گشت جزیره', included: true }, { title: 'ترانسفر', included: true }] },
  { id: 'tour-antalya', title: 'تور آنتالیا', destination: 'آنتالیا، ترکیه', durationDays: 7, imageUrl: tourImage(morocco), dates: [{ id: 't4', startDate: '۱۴۰۵/۰۸/۱۲', endDate: '۱۴۰۵/۰۸/۱۸', remainingCapacity: 6, price: 42500000, currency: 'IRR' }], services: [{ title: 'هتل ساحلی', included: true }, { title: 'صبحانه کامل', included: true }] },
  { id: 'tour-van', title: 'تور وان', destination: 'وان، ترکیه', durationDays: 4, imageUrl: tourImage(france), dates: [{ id: 't5', startDate: '۱۴۰۵/۰۸/۲۰', endDate: '۱۴۰۵/۰۸/۲۳', remainingCapacity: 10, price: 9800000, currency: 'IRR' }], services: [{ title: 'ترانسفر زمینی', included: true }, { title: 'هتل ۴ ستاره', included: true }] },
  { id: 'tour-ziyarat', title: 'تور نجف و کربلا', destination: 'عراق', durationDays: 7, imageUrl: tourImage(asiaTemple), dates: [{ id: 't6', startDate: '۱۴۰۵/۰۸/۱۵', endDate: '۱۴۰۵/۰۸/۲۱', remainingCapacity: 15, price: 18500000, currency: 'IRR' }], services: [{ title: 'کاروانی', included: true }, { title: 'اقامت و زیارت', included: true }] },
];

export const featuredHotels: Hotel[] = [
  { id: 'hotel-espinas', name: 'هتل اسپیناس پالاس', city: 'تهران', country: 'ایران', rating: 4.8, reviewCount: 342, imageUrl: hotelTehranPremium, amenities: [{ id: 'wifi', name: 'وای‌فای رایگان' }, { id: 'breakfast', name: 'صبحانه' }, { id: 'pool', name: 'استخر' }], rooms: [{ id: 'r1', title: 'اتاق دو تخته پریمیوم', capacity: 2, amenities: [], rates: [{ id: 'rr1', title: 'نرخ منعطف با صبحانه', amount: 3800000, currency: 'IRR', mealPlan: 'صبحانه', refundable: true }] }] },
  { id: 'hotel-darvishi', name: 'هتل مجلل درویشی', city: 'مشهد', country: 'ایران', rating: 4.7, reviewCount: 518, imageUrl: heroCamping, amenities: [{ id: 'pool', name: 'استخر' }, { id: 'breakfast', name: 'صبحانه' }, { id: 'shuttle', name: 'سرویس حرم' }], rooms: [] },
  { id: 'hotel-toranj', name: 'هتل دریایی ترنج', city: 'کیش', country: 'ایران', rating: 4.6, reviewCount: 289, imageUrl: heroKishPremium, amenities: [{ id: 'sea', name: 'نمای دریا' }, { id: 'wifi', name: 'وای‌فای' }, { id: 'breakfast', name: 'صبحانه' }], rooms: [] },
  { id: 'hotel-shayan', name: 'هتل شایان', city: 'کیش', country: 'ایران', rating: 4.4, reviewCount: 176, imageUrl: heroGreece, amenities: [{ id: 'breakfast', name: 'صبحانه' }, { id: 'transfer', name: 'ترانسفر' }, { id: 'beach', name: 'نزدیک ساحل' }], rooms: [] },
  { id: 'hotel-istanbul', name: 'هتل بسفروس استانبول', city: 'استانبول', country: 'ترکیه', rating: 4.5, reviewCount: 631, imageUrl: hotelIstanbulPremium, amenities: [{ id: 'breakfast', name: 'صبحانه' }, { id: 'wifi', name: 'وای‌فای' }, { id: 'view', name: 'نمای بسفروس' }], rooms: [] },
  { id: 'hotel-dubai', name: 'هتل ساحلی جمیرا', city: 'دبی', country: 'امارات', rating: 4.9, reviewCount: 804, imageUrl: morocco, amenities: [{ id: 'sea', name: 'ساحل اختصاصی' }, { id: 'pool', name: 'استخر' }, { id: 'breakfast', name: 'صبحانه' }], rooms: [] },
];

export const popularDestinations: Destination[] = [
  { id: 'istanbul', slug: 'istanbul', name: 'استانبول', country: 'ترکیه', description: 'شهر دو قاره و تجربه‌ای پر از رنگ', imageUrl: heroGreece },
  { id: 'dubai', slug: 'dubai', name: 'دبی', country: 'امارات', description: 'خرید، تفریح و آسمان‌خراش‌ها', imageUrl: heroDesert },
  { id: 'kish', slug: 'kish', name: 'کیش', country: 'ایران', description: 'آرامش جزیره در خلیج فارس', imageUrl: heroKishPremium },
  { id: 'mashhad', slug: 'mashhad', name: 'مشهد', country: 'ایران', description: 'سفر زیارتی و تجربه‌ای ماندگار', imageUrl: asiaTemple },
  { id: 'shiraz', slug: 'shiraz', name: 'شیراز', country: 'ایران', description: 'شهر شعر، باغ و تاریخ', imageUrl: france },
  { id: 'qeshm', slug: 'qeshm', name: 'قشم', country: 'ایران', description: 'طبیعت متفاوت جنوب', imageUrl: heroDesert },
];

export const offers: Offer[] = [
  { id: 'kish', title: 'چند روز آبی در کیش', description: 'پرواز و اقامت جزیره را برای یک سفر کوتاه کنار هم ببین', image: heroKishPremium, accent: 'bg-primary', href: '/hotels' },
  { id: 'istanbul', title: 'استانبول و محله‌های دیدنی', description: 'تورهای شهری با اقامت در قلب شهر و دسترسی آسان', image: hotelIstanbulPremium, accent: 'bg-secondary', href: '/tours' },
  { id: 'international', title: 'پروازهای خارجی پیشنهادی', description: 'مسیرهای منتخب برای سفر بعدی، با قیمت شروع نمایشی', image: heroDesert, accent: 'bg-warning', href: '/flights' },
];

export const popularRoutes: RouteCard[] = [
  { id: 'r1', from: 'تهران', to: 'مشهد', price: 'از ۱٬۸۵۰٬۰۰۰ تومان', hint: 'پرواز داخلی' }, { id: 'r2', from: 'تهران', to: 'استانبول', price: 'از ۸٬۹۰۰٬۰۰۰ تومان', hint: 'پرواز خارجی' }, { id: 'r3', from: 'تهران', to: 'دبی', price: 'از ۹٬۷۰۰٬۰۰۰ تومان', hint: 'پرواز خارجی' }, { id: 'r4', from: 'مشهد', to: 'نجف', price: 'از ۷٬۵۰۰٬۰۰۰ تومان', hint: 'پرواز زیارتی' }, { id: 'r5', from: 'تهران', to: 'کیش', price: 'از ۲٬۲۰۰٬۰۰۰ تومان', hint: 'پرواز داخلی' }, { id: 'r6', from: 'شیراز', to: 'تهران', price: 'از ۱٬۶۰۰٬۰۰۰ تومان', hint: 'پرواز داخلی' },
];

export const ziyaratOptions: ZiyaratOption[] = [
  { id: 'z1', title: 'نجف و کربلا', duration: '۷ روز', type: 'کاروانی', date: 'از ۱۵ آذر', price: 'از ۱۸٬۵۰۰٬۰۰۰ تومان' }, { id: 'z2', title: 'عتبات عالیات', duration: '۸ روز', type: 'هوایی', date: 'از ۲۰ آذر', price: 'مشاهده برنامه‌ها' }, { id: 'z3', title: 'سفر زمینی کربلا', duration: '۶ روز', type: 'زمینی', date: 'از ۱۰ دی', price: 'از ۱۲٬۹۰۰٬۰۰۰ تومان' }, { id: 'z4', title: 'عمره', duration: '۱۰ روز', type: 'هوایی', date: 'به‌زودی', price: 'مشاهده برنامه‌ها' },
];

export const travelArticles: TravelArticle[] = [
  { id: 'a1', slug: 'istanbul-guide', title: 'راهنمای سفر به استانبول برای اولین بار', category: 'راهنمای مقصد', excerpt: 'از انتخاب محله تا برنامه‌ریزی یک سفر خاطره‌انگیز.', image: heroGreece, readingTime: '۶ دقیقه' }, { id: 'a2', slug: 'best-kish-season', title: 'بهترین زمان سفر به کیش چه فصلی است؟', category: 'ایده سفر', excerpt: 'آب‌وهوا، تفریحات و نکاتی که قبل از رزرو باید بدانی.', image: heroCamping, readingTime: '۴ دقیقه' }, { id: 'a3', slug: 'ziyarat-guide', title: 'راهنمای سفر به نجف و کربلا', category: 'سفر زیارتی', excerpt: 'چک‌لیست ساده برای برنامه‌ریزی سفری آرام و مطمئن.', image: asiaTemple, readingTime: '۷ دقیقه' }, { id: 'a4', slug: 'choose-hotel', title: 'چطور هتل مناسب انتخاب کنیم؟', category: 'راهنمای رزرو', excerpt: 'امتیاز، موقعیت و امکانات را هوشمندانه مقایسه کن.', image: travelBooks, readingTime: '۵ دقیقه' },
];
