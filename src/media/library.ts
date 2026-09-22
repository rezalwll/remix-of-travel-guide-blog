import type { PaletteName, SceneKind } from "@/media/scenes";

export type MediaUsage = "hero" | "card" | "editorial" | "inline";

export type PhotoAsset = {
  kind: "photo";
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  usage: MediaUsage;
  credit: string;
  licenseNote: string;
};

export type SceneAsset = {
  kind: "scene";
  id: string;
  scene: SceneKind;
  palette: PaletteName;
  alt: string;
  usage: MediaUsage;
};

export type MediaAsset = PhotoAsset | SceneAsset;

const photo = (
  id: string,
  src: string,
  width: number,
  height: number,
  alt: string,
  usage: MediaUsage = "card",
): PhotoAsset => ({
  kind: "photo",
  id,
  src,
  width,
  height,
  alt,
  usage,
  credit: "کی‌آشی — دارایی نمایشی پروژه",
  licenseNote: "asset shipped with the repository; no third-party stock licence required",
});

const scene = (id: string, sceneKind: SceneKind, palette: PaletteName, alt: string, usage: MediaUsage = "card"): SceneAsset => ({
  kind: "scene",
  id,
  scene: sceneKind,
  palette,
  alt,
  usage,
});

/** Photography that ships with the repository. Each entry is used deliberately, not as filler. */
export const photoLibrary = {
  kishShore: photo("kish-shore", "/hero-kish-premium.webp", 1920, 768, "نمای ساحلی کیش در ساعت طلایی", "hero"),
  tehranHotel: photo("tehran-hotel", "/hotel-tehran-premium.webp", 1536, 1024, "نمای بیرونی یک هتل شهری مدرن", "hero"),
  istanbulHotel: photo("istanbul-hotel", "/hotel-istanbul-premium.webp", 1536, 1024, "لابی و فضای داخلی یک هتل شهری", "hero"),
  greece: photo("greece", "/hero-greece.jpg", 1920, 1280, "خانه‌های ساحلی رو به دریای مدیترانه"),
  desert: photo("desert", "/hero-desert.jpg", 1707, 1280, "تپه‌های شنی کویر در غروب"),
  camping: photo("camping", "/hero-camping.jpg", 1920, 1246, "اقامت در طبیعت کنار دریاچه"),
  morocco: photo("morocco", "/morocco.jpg", 1024, 1280, "معماری سنتی با کاشی‌کاری رنگی"),
  france: photo("france", "/france.jpg", 1920, 1255, "خیابان‌های شهری اروپایی"),
  temple: photo("temple", "/asia-temple.jpg", 1920, 1280, "بنای تاریخی با معماری شرقی"),
  aurora: photo("aurora", "/northern-lights.jpg", 920, 1280, "شفق قطبی در آسمان شب"),
  iceland: photo("iceland", "/iceland.jpg", 1918, 1280, "طبیعت سرد و کوهستانی"),
  lion: photo("lion", "/africa-lion.jpg", 854, 1280, "حیات وحش در سفر سافاری"),
  books: photo("books", "/travel-books.jpg", 1920, 1280, "کتاب‌ها و ابزار برنامه‌ریزی سفر", "editorial"),
  bloggers: photo("bloggers", "/bloggers.jpg", 1245, 1280, "دو مسافر در حال برنامه‌ریزی سفر", "editorial"),
  worldMap: photo("world-map", "/world-map.webp", 1600, 1067, "نقشه جهان برای انتخاب مقصد", "editorial"),
} satisfies Record<string, PhotoAsset>;

/**
 * Destination visuals. Iranian and regional destinations have no licensed photography in this
 * repository, so they use branded Kiashi scenes instead of pretending a stock photo is the city.
 */
export const destinationMedia: Record<string, MediaAsset> = {
  kish: photoLibrary.kishShore,
  qeshm: scene("qeshm", "coast", "qeshm", "تصویرسازی ساحل و صخره‌های قشم"),
  mashhad: scene("mashhad", "heritage", "mashhad", "تصویرسازی گنبد و گلدسته در مشهد"),
  tehran: scene("tehran", "city", "tehran", "تصویرسازی خط آسمان تهران"),
  shiraz: scene("shiraz", "heritage", "shiraz", "تصویرسازی بناهای تاریخی شیراز"),
  isfahan: scene("isfahan", "heritage", "isfahan", "تصویرسازی میدان و گنبد فیروزه‌ای اصفهان"),
  yazd: scene("yazd", "desert", "yazd", "تصویرسازی کویر و بادگیرهای یزد"),
  tabriz: scene("tabriz", "market", "isfahan", "تصویرسازی بازار سنتی تبریز"),
  rasht: scene("rasht", "forest", "caspian", "تصویرسازی جنگل و مه گیلان"),
  mazandaran: scene("mazandaran", "forest", "caspian", "تصویرسازی جنگل‌های مازندران"),
  alborz: scene("alborz", "mountain", "alborz", "تصویرسازی رشته‌کوه البرز"),
  istanbul: photoLibrary.greece,
  dubai: scene("dubai", "city", "dubai", "تصویرسازی آسمان‌خراش‌های دبی"),
  antalya: scene("antalya", "coast", "sea", "تصویرسازی سواحل آنتالیا"),
  van: scene("van", "mountain", "alborz", "تصویرسازی دریاچه و کوه‌های وان"),
  najaf: scene("najaf", "heritage", "najaf", "تصویرسازی حرم و معماری نجف"),
  karbala: scene("karbala", "heritage", "najaf", "تصویرسازی فضای زیارتی کربلا"),
  tbilisi: photoLibrary.france,
  yerevan: scene("yerevan", "mountain", "alborz", "تصویرسازی کوهستان و شهر ایروان"),
};

/** Service landings. Each service has its own visual identity so pages never look interchangeable. */
export const serviceMedia: Record<string, MediaAsset> = {
  flights: scene("svc-flights", "air", "sea", "تصویرسازی پرواز میان ابرها", "hero"),
  hotels: photoLibrary.tehranHotel,
  routes: scene("svc-routes", "mountain", "alborz", "تصویرسازی مسیر سفر کوهستانی", "hero"),
  tours: scene("svc-tours", "market", "sunrise", "تصویرسازی بازار و تجربه‌های مقصد", "hero"),
  ziyarat: scene("svc-ziyarat", "heritage", "najaf", "تصویرسازی آرام از فضای زیارتی", "hero"),
  trains: scene("svc-trains", "rail", "caspian", "تصویرسازی سفر ریلی", "hero"),
  buses: scene("svc-buses", "road", "alborz", "تصویرسازی سفر جاده‌ای با اتوبوس", "hero"),
  insurance: scene("svc-insurance", "shield", "trust", "تصویرسازی پوشش و ایمنی سفر", "hero"),
  cip: scene("svc-cip", "lounge", "lounge", "تصویرسازی سالن تشریفات فرودگاه", "hero"),
  transfer: scene("svc-transfer", "road", "tehran", "تصویرسازی ترانسفر فرودگاهی", "hero"),
  "fast-track": scene("svc-fast-track", "lounge", "trust", "تصویرسازی مسیر سریع فرودگاهی", "hero"),
  esim: scene("svc-esim", "connect", "isfahan", "تصویرسازی ارتباط و اینترنت سفر", "hero"),
  visa: scene("svc-visa", "document", "brand", "تصویرسازی مدارک سفر و ویزا", "hero"),
  "city-tours": scene("svc-city-tours", "market", "shiraz", "تصویرسازی گشت شهری و تجربه محلی", "hero"),
  support: scene("svc-support", "shield", "trust", "تصویرسازی پشتیبانی سفر", "hero"),
};

/** Stay categories used by hotel discovery blocks. */
export const stayMedia: Record<string, MediaAsset> = {
  resort: photoLibrary.kishShore,
  city: photoLibrary.tehranHotel,
  boutique: photoLibrary.istanbulHotel,
  traditional: photoLibrary.morocco,
  nature: photoLibrary.camping,
  seaView: scene("stay-sea-view", "coast", "kish", "تصویرسازی اتاق با نمای دریا"),
  lobby: scene("stay-lobby", "lounge", "lounge", "تصویرسازی لابی هتل"),
  breakfast: scene("stay-breakfast", "market", "sunrise", "تصویرسازی صبحانه و رستوران هتل"),
};

/** Experience/category strip used on discovery pages. */
export const experienceMedia: Record<string, MediaAsset> = {
  beach: scene("exp-beach", "coast", "kish", "تصویرسازی تجربه ساحلی"),
  desert: photoLibrary.desert,
  city: scene("exp-city", "city", "istanbul", "تصویرسازی گشت شهری"),
  heritage: scene("exp-heritage", "heritage", "isfahan", "تصویرسازی بازدید تاریخی"),
  nature: scene("exp-nature", "forest", "caspian", "تصویرسازی طبیعت‌گردی"),
  shopping: scene("exp-shopping", "market", "dubai", "تصویرسازی خرید و بازار"),
  food: scene("exp-food", "market", "shiraz", "تصویرسازی تجربه غذایی سفر"),
  adventure: photoLibrary.iceland,
  luxury: photoLibrary.istanbulHotel,
  budget: scene("exp-budget", "road", "alborz", "تصویرسازی سفر اقتصادی"),
  pilgrimage: scene("exp-pilgrimage", "heritage", "najaf", "تصویرسازی سفر زیارتی"),
};

/** Editorial covers for magazine surfaces. */
export const editorialMedia: Record<string, MediaAsset> = {
  planning: photoLibrary.books,
  travellers: photoLibrary.bloggers,
  map: photoLibrary.worldMap,
  seasons: photoLibrary.aurora,
  wildlife: photoLibrary.lion,
};

const brandedFallback = (seed: string): SceneAsset => {
  const palettes: PaletteName[] = ["sea", "kish", "isfahan", "sunrise", "alborz", "caspian", "shiraz", "istanbul"];
  const kinds: SceneKind[] = ["coast", "city", "heritage", "mountain", "forest", "market"];
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return scene(`fallback-${seed}`, kinds[hash % kinds.length], palettes[hash % palettes.length], "تصویرسازی پیش‌فرض سفر کی‌آشی");
};

/** Never returns undefined: unknown slugs get a deterministic branded scene instead of a broken image. */
export function destinationAsset(slug: string, alt?: string): MediaAsset {
  const asset = destinationMedia[slug] ?? brandedFallback(slug);
  return alt ? { ...asset, alt } : asset;
}

export function serviceAsset(slug: string, alt?: string): MediaAsset {
  const asset = serviceMedia[slug] ?? brandedFallback(slug);
  return alt ? { ...asset, alt } : asset;
}

export function experienceAsset(slug: string, alt?: string): MediaAsset {
  const asset = experienceMedia[slug] ?? brandedFallback(slug);
  return alt ? { ...asset, alt } : asset;
}

/** Wraps an arbitrary legacy image path so old demo catalogues keep working inside the new media frame. */
export function legacyAsset(src: string | undefined, alt: string, seed = "legacy"): MediaAsset {
  if (!src || !src.startsWith("/")) return { ...brandedFallback(seed), alt };
  const known = Object.values(photoLibrary).find((item) => item.src === src);
  if (known) return { ...known, alt };
  return { kind: "photo", id: `legacy-${seed}`, src, width: 1600, height: 1067, alt, usage: "card", credit: "کی‌آشی — دارایی نمایشی پروژه", licenseNote: "repository demo asset" };
}

export const mediaRegistry = { destinationMedia, serviceMedia, stayMedia, experienceMedia, editorialMedia, photoLibrary };
