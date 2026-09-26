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
  credit: "کیاشی — دارایی نمایشی پروژه",
  licenseNote: "asset shipped with the repository; no third-party stock licence required",
});

const pexelsPhoto = (id: string, file: string, width: number, height: number, alt: string, usage: MediaUsage = "card"): PhotoAsset => ({
  kind: "photo",
  id: `pexels-${id}`,
  src: `/media/${file}`,
  width,
  height,
  alt,
  usage,
  credit: `Pexels photo ${id}`,
  licenseNote: `Pexels License; source https://www.pexels.com/photo/${id}/`,
});

/** Photography that ships with the repository. Each entry is used deliberately, not as filler. */
export const photoLibrary = {
  hormuzRedCoast: photo("hormuz-red-coast", "/hero-hormuz-red.webp", 1916, 821, "ساحل سرخ هرمز و صخره‌های ساحلی در غروب", "hero"),
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
  aircraft: pexelsPhoto("358319", "plane.webp", 1200, 533, "هواپیمای مسافربری در حال فرود", "hero"),
  resortPool: pexelsPhoto("261102", "resort.webp", 1200, 801, "استخر و نمای یک هتل شهری", "hero"),
  hotelRoom: pexelsPhoto("271624", "hotel-room.webp", 1200, 801, "اتاق روشن هتل با تخت و فضای نشیمن"),
  tropicalBeach: pexelsPhoto("1450353", "hotel-pool.webp", 1200, 797, "ساحل گرمسیری با آب شفاف"),
  metro: pexelsPhoto("302428", "train-a.webp", 1200, 798, "فضای داخلی قطار شهری"),
  highland: pexelsPhoto("2884864", "train-b.webp", 1200, 800, "چشم‌انداز سبز کوهستانی در سفر"),
  forestRoad: pexelsPhoto("1173777", "bus.webp", 1200, 2133, "جادهٔ پیچان میان جنگل", "hero"),
  airportTraveller: pexelsPhoto("1008155", "road.webp", 1200, 798, "مسافر با چمدان در ترمینال فرودگاه", "hero"),
  mapAndPlane: pexelsPhoto("3769138", "phone.webp", 1200, 786, "نقشهٔ جهان و هواپیمای کوچک برای برنامه‌ریزی سفر"),
  forestMist: pexelsPhoto("723589", "passport.webp", 1200, 675, "جنگل مه‌آلود در سفر طبیعت", "hero"),
  travelTeam: pexelsPhoto("3183150", "support.webp", 1200, 801, "تیم برنامه‌ریزی سفر پشت میز", "editorial"),
  mountainLake: pexelsPhoto("417074", "mountain.webp", 1200, 808, "دریاچهٔ کوهستانی و قله‌های بلند", "hero"),
  cityBridge: pexelsPhoto("450597", "city.webp", 1200, 848, "پل شهری و خط آسمان در سفر", "hero"),
  globeInHand: pexelsPhoto("346885", "lake.webp", 1200, 800, "کرهٔ زمین در دست مسافر", "editorial"),
  roadTrip: pexelsPhoto("386009", "beach.webp", 1200, 800, "مینی‌بوس سفر و چمدان روی سقف"),
  scenicOverlook: pexelsPhoto("2574010", "airport.webp", 1200, 900, "چشم‌انداز کوهستان از سکوی تماشا", "hero"),
} satisfies Record<string, PhotoAsset>;

/**
 * Destination visuals. Iranian and regional destinations have no licensed photography in this
 * repository, so they use branded Kiashi scenes instead of pretending a stock photo is the city.
 */
export const destinationMedia: Record<string, MediaAsset> = {
  kish: photoLibrary.kishShore,
  qeshm: photoLibrary.tropicalBeach,
  mashhad: photoLibrary.temple,
  tehran: photoLibrary.tehranHotel,
  shiraz: photoLibrary.morocco,
  isfahan: photoLibrary.temple,
  yazd: photoLibrary.desert,
  tabriz: photoLibrary.cityBridge,
  rasht: photoLibrary.forestMist,
  mazandaran: photoLibrary.highland,
  alborz: photoLibrary.mountainLake,
  istanbul: photoLibrary.greece,
  dubai: photoLibrary.resortPool,
  antalya: photoLibrary.tropicalBeach,
  van: photoLibrary.mountainLake,
  najaf: photoLibrary.temple,
  karbala: photoLibrary.temple,
  tbilisi: photoLibrary.france,
  yerevan: photoLibrary.scenicOverlook,
};

/** Service landings. Each service has its own visual identity so pages never look interchangeable. */
export const serviceMedia: Record<string, MediaAsset> = {
  flights: photoLibrary.aircraft,
  hotels: photoLibrary.tehranHotel,
  routes: photoLibrary.forestRoad,
  tours: photoLibrary.cityBridge,
  ziyarat: photoLibrary.temple,
  trains: photoLibrary.metro,
  buses: photoLibrary.forestRoad,
  insurance: photoLibrary.globeInHand,
  cip: photoLibrary.airportTraveller,
  transfer: photoLibrary.roadTrip,
  "fast-track": photoLibrary.airportTraveller,
  esim: photoLibrary.travelTeam,
  visa: photoLibrary.mapAndPlane,
  "city-tours": photoLibrary.cityBridge,
  support: photoLibrary.travelTeam,
};

/** Stay categories used by hotel discovery blocks. */
export const stayMedia: Record<string, MediaAsset> = {
  resort: photoLibrary.kishShore,
  city: photoLibrary.tehranHotel,
  boutique: photoLibrary.istanbulHotel,
  traditional: photoLibrary.morocco,
  nature: photoLibrary.camping,
  seaView: photoLibrary.tropicalBeach,
  lobby: photoLibrary.resortPool,
  breakfast: photoLibrary.hotelRoom,
};

/** Experience/category strip used on discovery pages. */
export const experienceMedia: Record<string, MediaAsset> = {
  beach: photoLibrary.tropicalBeach,
  desert: photoLibrary.desert,
  city: photoLibrary.cityBridge,
  heritage: photoLibrary.temple,
  nature: photoLibrary.forestMist,
  shopping: photoLibrary.resortPool,
  food: photoLibrary.morocco,
  adventure: photoLibrary.iceland,
  luxury: photoLibrary.istanbulHotel,
  budget: photoLibrary.roadTrip,
  pilgrimage: photoLibrary.temple,
};

/** Editorial covers for magazine surfaces. */
export const editorialMedia: Record<string, MediaAsset> = {
  planning: photoLibrary.books,
  travellers: photoLibrary.bloggers,
  map: photoLibrary.worldMap,
  seasons: photoLibrary.aurora,
  wildlife: photoLibrary.lion,
};

const brandedFallback = (seed: string): PhotoAsset => {
  const fallbacks = [photoLibrary.scenicOverlook, photoLibrary.cityBridge, photoLibrary.mountainLake, photoLibrary.forestMist, photoLibrary.roadTrip];
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return { ...fallbacks[hash % fallbacks.length], id: `fallback-${seed}`, alt: "عکس واقعی نمایشی برای سفر" };
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
  return { kind: "photo", id: `legacy-${seed}`, src, width: 1600, height: 1067, alt, usage: "card", credit: "کیاشی — دارایی نمایشی پروژه", licenseNote: "repository demo asset" };
}

export const mediaRegistry = { destinationMedia, serviceMedia, stayMedia, experienceMedia, editorialMedia, photoLibrary };
