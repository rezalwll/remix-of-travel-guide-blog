export const continentNamesFa: Record<string, string> = {
  Europe: "اروپا",
  Asia: "آسیا",
  Africa: "آفریقا",
  "Central America": "آمریکای مرکزی",
  "South America": "آمریکای جنوبی",
  Oceania: "اقیانوسیه",
  "North America": "آمریکای شمالی",
};

export const countryNamesFa: Record<string, string> = {
  France: "فرانسه",
  Greece: "یونان",
  Iceland: "ایسلند",
  Italy: "ایتالیا",
  Netherlands: "هلند",
  Portugal: "پرتغال",
  Spain: "اسپانیا",
  Philippines: "فیلیپین",
  Indonesia: "اندونزی",
  Japan: "ژاپن",
  China: "چین",
  "Sri Lanka": "سری‌لانکا",
  Thailand: "تایلند",
  Vietnam: "ویتنام",
  Botswana: "بوتسوانا",
  Kenya: "کنیا",
  Morocco: "مراکش",
  "South Africa": "آفریقای جنوبی",
  "Costa Rica": "کاستاریکا",
  Mexico: "مکزیک",
  Peru: "پرو",
  Colombia: "کلمبیا",
  Australia: "استرالیا",
  "New Zealand": "نیوزیلند",
  "United States": "ایالات متحده",
  Canada: "کانادا",
};

export const categoryNamesFa: Record<string, string> = {
  Nature: "طبیعت",
  Adventure: "ماجراجویی",
  "Hot Springs": "چشمه‌های آب‌گرم",
  Wildlife: "حیات‌وحش",
  "Northern Lights": "شفق قطبی",
  Culture: "فرهنگ",
  Food: "خوراک و رستوران",
  Museums: "موزه‌ها",
  Attractions: "دیدنی‌ها",
  Islands: "جزیره‌ها",
  History: "تاریخ",
  Beaches: "ساحل‌ها",
};

export const monthNamesFa = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

export const continentDescriptionsFa: Record<string, string> = {
  Europe: "شهرهای تاریخی، مسیرهای ریلی و سواحل مدیترانه برای سفری چندلایه و برنامه‌پذیر.",
  Asia: "از کلان‌شهرهای مدرن تا جزیره‌ها و معابد؛ مقصدهایی متنوع برای هر سبک سفر.",
  Africa: "طبیعت گسترده، فرهنگ‌های زنده و تجربه‌های حیات‌وحش در مسیرهای متفاوت.",
  "Central America": "ساحل‌های گرم، جنگل‌های استوایی و شهرهای رنگارنگ در سفرهایی جمع‌وجور.",
  "South America": "ترکیبی از کوهستان، فرهنگ شهری و طبیعتی که هر مسیر را به تجربه‌ای تازه تبدیل می‌کند.",
  Oceania: "جزیره‌ها، جاده‌های ساحلی و طبیعت بکر برای سفرهای آرام یا ماجراجویانه.",
  "North America": "شهرهای بزرگ، پارک‌های ملی و مسیرهای جاده‌ای با انتخاب‌های فراوان.",
};

export const countryFa = (name: string) => countryNamesFa[name] ?? name;
export const continentFa = (name: string) => continentNamesFa[name] ?? name;
export const categoryFa = (name: string) => categoryNamesFa[name] ?? name;

export const countryIntroFa = (name: string) =>
  `${countryFa(name)} برای مسافرانی که می‌خواهند بین دیدنی‌ها، تجربه‌های محلی و زمان استراحت تعادل داشته باشند، انتخابی جذاب است. این راهنما برای شناخت فصل مناسب، منطقه‌های پیشنهادی و ایده‌های اولیهٔ برنامه‌ریزی سفر آماده شده است.`;
