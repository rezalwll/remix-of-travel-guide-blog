import type { Hotel } from '../types/hotel.js';

type HotelSeed = [id: string, name: string, city: string, address: string, area: string, stars: number, rating: number, reviews: number, image: string, nightly: number, distance: number];

const checkedAt = '۱۴۰۵/۰۷/۰۷';
const fallbackRoom = '/media/hotel-room.webp';
const fallbackPool = '/media/hotel-pool.webp';
const citySources: Record<string, string> = {
  تهران: 'https://www.iranhotelonline.com/fa/state/8/تهران/hotelgrades/5/5/',
  مشهد: 'https://www.iranhotelonline.com/blog/luxe-mashhad-hotels/',
  کیش: 'https://www.iranhotelonline.com/fa/state/29/هرمزگان/hotelgrades/5/5/',
  شیراز: 'https://www.iranhotelonline.com/fa/city/37/شیراز/',
  اصفهان: 'https://www.iranhotelonline.com/fa/city/5/اصفهان/hotelgrades/5/5-star/',
  قشم: 'https://www.iranhotelonline.com/qeshm-hotels/',
  یزد: 'https://www.iranhotelonline.com/yazd-hotels/',
  تبریز: 'https://www.iranhotelonline.com/fa/state/1/آذربایجان-شرقی/hotelgrades/5/5/',
  رشت: 'https://www.iranhotelonline.com/rasht-hotels/',
};

const makeRooms = (hotelId: string, base: number, hero: string) => [
  {
    id: `${hotelId}-double`, hotelId, name: 'اتاق دو تخته', description: 'اتاق دو تخته با چیدمان استاندارد؛ ظرفیت و موجودی این بخش برای نمایش فرایند رزرو شبیه‌سازی شده است.', capacity: 2, bedType: 'یک تخت دبل یا دو تخت سینگل', size: 28, images: [hero, fallbackRoom], amenities: ['وای‌فای رایگان', 'تلویزیون', 'چای‌ساز'],
    ratePlans: [
      { id: `${hotelId}-double-breakfast`, title: 'اقامت با صبحانه', mealPlan: 'صبحانه' as const, refundable: true, cancellationSummary: 'لغو رایگان تا ۴۸ ساعت قبل از ورود (نمایشی)', nightlyPrice: base, originalNightlyPrice: base + 900000, currency: 'IRR' as const, taxesIncluded: true, remainingRooms: 4 },
      { id: `${hotelId}-double-room-only`, title: 'نرخ اقتصادی', mealPlan: 'بدون وعده' as const, refundable: false, cancellationSummary: 'غیرقابل استرداد (نمایشی)', nightlyPrice: Math.max(2500000, base - 600000), currency: 'IRR' as const, taxesIncluded: true, remainingRooms: 6 },
    ],
  },
  {
    id: `${hotelId}-suite`, hotelId, name: 'سوئیت یک‌خوابه', description: 'سوئیت جادار با فضای نشیمن؛ نوع تخت و موجودی در نسخه دمو شبیه‌سازی شده است.', capacity: 3, bedType: 'تخت دبل و مبل تخت‌خواب‌شو', size: 44, images: [hero, fallbackPool], amenities: ['فضای نشیمن', 'وای‌فای رایگان', 'مینی‌بار'],
    ratePlans: [{ id: `${hotelId}-suite-breakfast`, title: 'سوئیت با صبحانه', mealPlan: 'صبحانه' as const, refundable: true, cancellationSummary: 'لغو رایگان تا ۷۲ ساعت قبل از ورود (نمایشی)', nightlyPrice: base + 2400000, currency: 'IRR' as const, taxesIncluded: true, remainingRooms: 2 }],
  },
];

const makeHotel = ([id, name, city, address, area, stars, rating, reviewCount, image, base, distanceFromCenter]: HotelSeed): Hotel => ({
  id, slug: id, name, city, country: 'ایران', address, area, stars, rating, reviewCount,
  images: [image, fallbackRoom, fallbackPool],
  description: `${name} یکی از اقامتگاه‌های شناخته‌شده ${city} است. نام، موقعیت، درجه، تصویر و امتیاز مرجع گردآوری شده‌اند؛ نرخ و موجودی این دمو واقعی نیست.`,
  amenities: stars === 5 ? ['وای‌فای', 'صبحانه', 'رستوران', 'استخر', 'پارکینگ', 'باشگاه'] : ['وای‌فای', 'صبحانه', 'رستوران', 'پارکینگ'],
  neighborhood: area, distanceFromCenter, checkInTime: '۱۴:۰۰', checkOutTime: '۱۲:۰۰',
  policies: [
    { title: 'مدارک پذیرش', description: 'ارائه مدارک شناسایی معتبر همه مهمانان در زمان پذیرش الزامی است.' },
    { title: 'نرخ و موجودی', description: 'قیمت‌ها، ظرفیت اتاق‌ها و قوانین لغو در این نسخه صرفاً نمایشی‌اند و هنگام اتصال به تأمین‌کننده جایگزین می‌شوند.' },
  ],
  featured: stars === 5 && rating >= 4.4,
  tags: stars === 5 ? ['لوکس', 'مناسب خانواده'] : ['مناسب خانواده', 'اقتصادی'],
  rooms: makeRooms(id, base, image),
  source: { provider: 'ایران هتل آنلاین', url: citySources[city], checkedAt, note: 'مشخصات و تصویر مرجع؛ نرخ، ظرفیت و اتاق‌های قابل فروش در کیاشی نمایشی هستند.' },
});

const iranianSeeds: HotelSeed[] = [
  ['golden-palace-mashhad', 'هتل گلدن پالاس مشهد', 'مشهد', 'خیابان امام رضا، بین امام رضا ۳۴ و ۳۶', 'خیابان امام رضا', 5, 4.5, 697, '/media/hotels/mashhad/golden-palace.webp', 12600000, 2.1],
  ['darvishi-mashhad', 'هتل مجلل درویشی مشهد', 'مشهد', 'خیابان امام رضا، بین امام رضا ۲۴ و ۲۶', 'خیابان امام رضا', 5, 4.4, 980, '/media/hotels/mashhad/darvishi.webp', 11900000, 1.4],
  ['almas-2-mashhad', 'هتل الماس ۲ مشهد', 'مشهد', 'خیابان امام رضا، امام رضا ۲۰', 'خیابان امام رضا', 5, 4.4, 736, '/media/hotels/mashhad/almas-2.webp', 10800000, 1.3],
  ['homa-2-mashhad', 'هتل هما ۲ مشهد', 'مشهد', 'بلوار خیام، میدان جانباز', 'بلوار خیام', 5, 4.2, 439, '/media/hotels/mashhad/homa-2.webp', 9200000, 6.2],
  ['javad-mashhad', 'هتل جواد مشهد', 'مشهد', 'خیابان امام رضا، امام رضا ۳', 'اطراف حرم', 4, 4.3, 421, '/media/hotels/mashhad/javad.webp', 7900000, 0.7],
  ['espinas-palace-tehran', 'هتل اسپیناس پالاس تهران', 'تهران', 'سعادت‌آباد، میدان بهرود', 'سعادت‌آباد', 5, 4.4, 1240, '/media/hotels/tehran/espinas-palace.webp', 15800000, 9.2],
  ['parsian-azadi-tehran', 'هتل پارسیان آزادی تهران', 'تهران', 'بزرگراه چمران، تقاطع یادگار امام', 'اوین', 5, 4.4, 924, '/media/hotels/tehran/parsian-azadi.webp', 13200000, 8.4],
  ['espinas-boulevard-tehran', 'هتل اسپیناس بلوار تهران', 'تهران', 'بلوار کشاورز، بین فلسطین و نادری', 'بلوار کشاورز', 5, 4.3, 680, '/media/hotels/tehran/espinas-boulevard.webp', 12900000, 2.8],
  ['esteghlal-tehran', 'هتل پارسیان استقلال تهران', 'تهران', 'تقاطع بزرگراه چمران و ولیعصر', 'پارک‌وی', 5, 3.8, 1110, '/media/hotels/tehran/esteghlal.webp', 11500000, 7.4],
  ['persian-plaza-tehran', 'هتل پرشین پلازا تهران', 'تهران', 'خیابان سهروردی شمالی، خیابان میرزای زینالی', 'سهروردی', 5, 4.2, 312, '/media/hotels/tehran/persian-plaza.webp', 10600000, 4.1],
  ['toranj-kish', 'هتل ترنج کیش', 'کیش', 'میدان جاسک، جاده جهان', 'ساحل غربی', 5, 4.3, 760, '/media/hotels/kish/toranj.webp', 17800000, 12],
  ['aria-kish', 'هتل آریا باستان کیش', 'کیش', 'میدان هور، بلوار جهان', 'میدان هور', 5, 4.1, 198, '/media/hotels/kish/aria.webp', 14200000, 8.7],
  ['dariush-kish', 'هتل داریوش کیش', 'کیش', 'میدان داریوش', 'شرق جزیره', 5, 4.2, 1120, '/media/hotels/kish/dariush.webp', 16500000, 4.5],
  ['parmis-kish', 'هتل پارمیس کیش', 'کیش', 'میدان پردیس', 'پردیس', 5, 3.9, 640, '/media/hotels/kish/parmis.webp', 10800000, 1.7],
  ['aramis-plus-kish', 'هتل آرامیس پلاس کیش', 'کیش', 'میدان پردیس', 'پردیس', 5, 4.0, 326, '/media/hotels/kish/aramis-plus.webp', 11700000, 1.8],
  ['grand-shiraz', 'هتل بزرگ شیراز', 'شیراز', 'دروازه قرآن', 'دروازه قرآن', 5, 4.6, 614, '/media/hotels/shiraz/grand.webp', 12400000, 3.5],
  ['zandiyeh-shiraz', 'هتل زندیه شیراز', 'شیراز', 'خیابان هجرت، پشت ارگ کریم‌خان', 'مرکز تاریخی', 5, 4.6, 217, '/media/hotels/shiraz/zandiyeh.webp', 11800000, 1.1],
  ['chamran-shiraz', 'هتل چمران شیراز', 'شیراز', 'بلوار چمران', 'بلوار چمران', 5, 4.1, 281, '/media/hotels/shiraz/chamran.webp', 10200000, 5.2],
  ['persepolis-shiraz', 'هتل پرسپولیس شیراز', 'شیراز', 'خیابان آزادی، حدفاصل میدان اطلسی و حافظیه', 'حافظیه', 5, 4.0, 242, '/media/hotels/shiraz/persepolis.webp', 8900000, 2.2],
  ['karim-khan-shiraz', 'هتل کریم‌خان شیراز', 'شیراز', 'خیابان رودکی', 'مرکز شهر', 3, 4.2, 162, '/media/hotels/shiraz/karim-khan.webp', 6200000, 1.3],
  ['abbasi-isfahan', 'هتل عباسی اصفهان', 'اصفهان', 'خیابان چهارباغ عباسی، خیابان آمادگاه', 'چهارباغ', 5, 4.3, 1280, '/media/hotels/isfahan/abbasi.webp', 13900000, 0.8],
  ['parsian-kowsar-isfahan', 'هتل پارسیان کوثر اصفهان', 'اصفهان', 'بلوار ملت، مقابل سی‌وسه‌پل', 'سی‌وسه‌پل', 5, 4.2, 726, '/media/hotels/isfahan/parsian-kowsar.webp', 12100000, 1.2],
  ['chaharbagh-isfahan', 'هتل چهارباغ اصفهان', 'اصفهان', 'خیابان چهارباغ عباسی', 'چهارباغ', 5, 4.7, 186, '/media/hotels/isfahan/chaharbagh.webp', 12700000, 0.6],
  ['pirouzi-isfahan', 'هتل پیروزی اصفهان', 'اصفهان', 'میدان امام حسین، ابتدای چهارباغ پایین', 'میدان امام حسین', 4, 4.1, 172, '/media/hotels/isfahan/pirouzi.webp', 7900000, 1],
  ['safir-isfahan', 'هتل سفیر اصفهان', 'اصفهان', 'خیابان آمادگاه، مقابل هتل عباسی', 'آمادگاه', 4, 3.8, 59, '/media/hotels/isfahan/safir.webp', 6900000, 0.9],
  ['arakta-qeshm', 'هتل آراکتا قشم', 'قشم', 'بلوار پیامبر اعظم، نخل زرین', 'نخل زرین', 5, 4.5, 122, '/media/hotels/qeshm/arakta.webp', 11200000, 2.4],
  ['arta-qeshm', 'هتل آرتا قشم', 'قشم', 'بلوار شهید بهشتی', 'مرکز قشم', 4, 4.0, 80, '/media/hotels/qeshm/arta.webp', 8300000, 1.8],
  ['irman-qeshm', 'هتل بوتیک ایرمان قشم', 'قشم', 'نخل زرین، خیابان پژوهش', 'نخل زرین', 4, 4.6, 172, '/media/hotels/qeshm/irman.webp', 8900000, 2.1],
  ['ataman-qeshm', 'هتل آتامان قشم', 'قشم', 'میدان حافظ، به سمت میدان امام قلی خان', 'بلوار گلستان', 4, 4.1, 93, '/media/hotels/qeshm/ataman.webp', 7600000, 2.7],
  ['eram-qeshm', 'هتل ارم قشم', 'قشم', 'بلوار آزادگان، روبه‌روی شیلات', 'بلوار آزادگان', 4, 3.6, 56, '/media/hotels/qeshm/eram.webp', 6800000, 3.1],
  ['dad-yazd', 'هتل داد یزد', 'یزد', 'خیابان دهم فروردین', 'مرکز تاریخی', 4, 4.5, 447, '/media/hotels/yazd/dad.webp', 9200000, 1.2],
  ['moshir-yazd', 'هتل باغ مشیرالممالک یزد', 'یزد', 'خیابان انقلاب، بلوار مشیر', 'باغ مشیر', 4, 4.3, 231, '/media/hotels/yazd/moshir.webp', 8800000, 3.2],
  ['safaiyeh-yazd', 'هتل پارسیان صفائیه یزد', 'یزد', 'میدان امام حسن، خیابان تیمسار فلاحی', 'صفائیه', 5, 4.3, 454, '/media/hotels/yazd/safaiyeh.webp', 10800000, 4.6],
  ['sib-o-nar-yazd', 'هتل سیب و نار یزد', 'یزد', 'بلوار شهیدان اشرف', 'صفائیه', 4, 4.4, 25, '/media/hotels/yazd/sib-o-nar.webp', 7600000, 4.9],
  ['laleh-yazd', 'هتل لاله یزد', 'یزد', 'بلوار بسیج، کنار آب‌انبار گلشن', 'بافت تاریخی', 3, 4.0, 187, '/media/hotels/yazd/laleh.webp', 6100000, 1.5],
  ['laleh-park-tabriz', 'هتل لاله پارک تبریز', 'تبریز', 'میدان شهید فهمیده، جنب مجتمع لاله پارک', 'رشدیه', 5, 4.7, 421, '/media/hotels/tabriz/laleh-park.webp', 12900000, 8.1],
  ['pars-el-goli-tabriz', 'هتل پارس ائل‌گلی تبریز', 'تبریز', 'جاده ائل‌گلی، جنب پارک ائل‌گلی', 'ائل‌گلی', 5, 4.2, 360, '/media/hotels/tabriz/pars-el-goli.webp', 11200000, 7.4],
  ['shahriar-tabriz', 'هتل شهریار تبریز', 'تبریز', 'ابتدای جاده ائل‌گلی', 'ائل‌گلی', 5, 3.8, 189, '/media/hotels/tabriz/shahriar.webp', 9800000, 6.3],
  ['laleh-kandovan', 'هتل صخره‌ای لاله کندوان', 'تبریز', 'روستای تاریخی کندوان', 'کندوان', 5, 4.4, 266, '/media/hotels/tabriz/laleh-kandovan.webp', 10500000, 55],
  ['international-tabriz', 'هتل بین‌المللی تبریز', 'تبریز', 'خیابان امام خمینی، میدان دانشگاه', 'مرکز شهر', 4, 4.2, 169, '/media/hotels/tabriz/international.webp', 7200000, 2.6],
  ['kadus-rasht', 'هتل بزرگ کادوس رشت', 'رشت', 'بلوار منظریه', 'منظریه', 5, 3.8, 344, '/media/hotels/rasht/kadus.webp', 9600000, 2.8],
  ['shabestan-rasht', 'هتل شبستان رشت', 'رشت', 'چهارراه گلسار، ابتدای بلوار بنت‌الهدی', 'گلسار', 4, 3.6, 50, '/media/hotels/rasht/shabestan.webp', 7100000, 3.4],
  ['pamchal-rasht', 'هتل پامچال رشت', 'رشت', 'بلوار امام خمینی، میدان مصلی', 'مرکز شهر', 3, 3.6, 208, '/media/hotels/rasht/pamchal.webp', 5200000, 1.7],
  ['sabouri-rasht', 'هتل آپارتمان صبوری رشت', 'رشت', 'بلوار گلسار، خیابان ۱۲۳', 'گلسار', 3, 3.6, 60, '/media/hotels/rasht/sabouri.webp', 4800000, 3.7],
  ['iran-rasht', 'هتل ایران رشت', 'رشت', 'میدان شهرداری', 'میدان شهرداری', 3, 3.9, 134, '/media/hotels/rasht/iran.webp', 5600000, 0.3],
];

export const hotels: Hotel[] = iranianSeeds.map(makeHotel);
export const hotelAmenities = ['صبحانه', 'استخر', 'پارکینگ', 'وای‌فای', 'باشگاه', 'اسپا', 'ترانسفر', 'رستوران'];
export const hotelAreas = Array.from(new Set(hotels.map((hotel) => hotel.area)));
