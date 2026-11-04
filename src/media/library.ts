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

const sourcedPhoto = (
  id: string,
  src: string,
  width: number,
  height: number,
  alt: string,
  credit: string,
  licenseNote: string,
  usage: MediaUsage = "card",
): PhotoAsset => ({ kind: "photo", id, src, width, height, alt, usage, credit, licenseNote });

/** Photography that ships with the repository. Each entry is used deliberately, not as filler. */
export const photoLibrary = {
  kiashiTravelBanner: photo("kiashi-travel-support-banner", "/kiashi-travel-support-banner.webp", 1916, 821, "جادهٔ کوهستانی در غروب با نشان کیاشی", "hero"),
  redMountainLake: photo("red-mountain-lake", "/hero-red-mountain-lake.webp", 1672, 941, "چشم‌انداز کوهستان و دریاچه در غروب سرخ", "hero"),
  hormuzRedCoast: photo("hormuz-red-coast", "/hero-hormuz-red.webp", 1916, 821, "ساحل سرخ هرمز و صخره‌های ساحلی در غروب", "hero"),
  kishShore: sourcedPhoto("kish-beach", "/media/destinations/kish-beach-real.webp", 1600, 903, "ساحل واقعی جزیره کیش و آب‌های خلیج فارس", "Mehrraz — Wikimedia Commons", "CC BY-SA 4.0; source https://commons.wikimedia.org/wiki/File:Kish_Island,_Persian_Gulf,_Iran.jpg; resized and converted to WebP", "hero"),
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
  mountainLake: pexelsPhoto("417074", "mountain.webp", 1200, 808, "دریاچهٔ کوهستانی و قله‌های بلند", "hero"),
  cityBridge: pexelsPhoto("450597", "city.webp", 1200, 848, "پل شهری و خط آسمان در سفر", "hero"),
  globeInHand: pexelsPhoto("346885", "lake.webp", 1200, 800, "کرهٔ زمین در دست مسافر", "editorial"),
  roadTrip: pexelsPhoto("386009", "beach.webp", 1200, 800, "مینی‌بوس سفر و چمدان روی سقف"),
  scenicOverlook: pexelsPhoto("2574010", "airport.webp", 1200, 900, "چشم‌انداز کوهستان از سکوی تماشا", "hero"),
  tehran: sourcedPhoto("tehran-milad-night", "/media/destinations/tehran-milad-night.webp", 1280, 855, "نمای شب برج میلاد و بزرگراه‌های تهران", "Majid Masajedi — Pexels", "Pexels License; source https://www.pexels.com/photo/the-milad-tower-in-tehran-city-iran-illuminated-at-night-9183483/", "hero"),
  mashhad: sourcedPhoto("mashhad-imam-reza-courtyard", "/media/destinations/mashhad-shrine-courtyard.webp", 1600, 1000, "صحن و گنبد حرم امام رضا در مشهد", "Zsohani — Wikimedia Commons", "CC BY-SA 4.0; source https://commons.wikimedia.org/wiki/File:A_panorama_view_of_Imam_Reza_holy_shrine_and_saqa_khane.JPG; cropped, resized and converted to WebP", "hero"),
  shiraz: sourcedPhoto("shiraz-nasir-al-mulk", "/media/destinations/shiraz.webp", 1600, 1067, "شبستان رنگین مسجد نصیرالملک شیراز", "Faraz Ahanin — Wikimedia Commons", "CC0; source https://commons.wikimedia.org/wiki/File:Nasir_al-Mulk_Mosque_-_Shiraz.jpg", "hero"),
  isfahan: sourcedPhoto("isfahan-naqsh-e-jahan", "/media/destinations/isfahan.webp", 1600, 1067, "میدان نقش جهان اصفهان", "Ninara — Wikimedia Commons", "CC BY 2.0; source https://commons.wikimedia.org/wiki/File:Naqsh-e_Jahan_Square,_Isfahan_(53792753143).jpg", "hero"),
  yazd: sourcedPhoto("yazd-amir-chakhmaq", "/media/destinations/yazd.webp", 1600, 1067, "مجموعه امیرچخماق یزد", "Bernard Gagnon — Wikimedia Commons", "CC BY-SA 4.0; source https://commons.wikimedia.org/wiki/File:Amir_Chakhmaq_Complex,_Yazd.jpg", "hero"),
  tabriz: sourcedPhoto("tabriz-grand-bazaar", "/media/destinations/tabriz.webp", 1600, 2632, "راسته‌های تاریخی بازار بزرگ تبریز", "Sana Taba — Wikimedia Commons", "CC BY-SA 4.0; source https://commons.wikimedia.org/wiki/File:Tabriz_grand_bazaar-interior_view.jpg", "hero"),
  qeshm: sourcedPhoto("qeshm-stars-valley", "/media/destinations/qeshm.webp", 1600, 1067, "دره ستاره‌های قشم", "Ninara — Wikimedia Commons", "CC BY 2.0; source https://commons.wikimedia.org/wiki/File:Qeshm,_Iran,_Valley_of_the_stars.jpg", "hero"),
  istanbul: sourcedPhoto("istanbul-blue-mosque", "/media/destinations/istanbul-blue-mosque.webp", 1600, 1200, "مسجد سلطان احمد و تنگه بسفر در استانبول", "Constantin Barbu — Wikimedia Commons", "CC BY 2.0; source https://commons.wikimedia.org/wiki/File:The_Blue_Mosque_at_sunset.jpg; resized and converted to WebP", "hero"),
  dubai: sourcedPhoto("dubai-marina", "/media/destinations/dubai-marina.webp", 1600, 2000, "برج‌ها و آبراه دبی مارینا در غروب", "Max Avans — Pexels", "Pexels License; source https://www.pexels.com/photo/dubai-cityscape-at-sunset-5075784/; resized and converted to WebP", "hero"),
  najaf: sourcedPhoto("najaf-imam-ali-shrine", "/media/destinations/najaf-shrine-exterior.webp", 1600, 1067, "گنبد و مناره‌های حرم امام علی در نجف", "Goudarz.memar — Wikimedia Commons", "CC BY-SA 4.0; source https://commons.wikimedia.org/wiki/File:Shrine_of_Imam_Ali_Najaf_August_2023.jpg; resized and converted to WebP", "hero"),
  tbilisi: sourcedPhoto("tbilisi-old-town", "/media/destinations/tbilisi-old-town.webp", 1600, 1606, "قلعه ناریکالا و بافت قدیمی تفلیس", "LeontinaVarlamonva — Wikimedia Commons", "CC0; source https://commons.wikimedia.org/wiki/File:Fortress_and_Old_Town_of_Tbilisi_at_dusk,_Tbilisi,_Georgia.jpg; resized and converted to WebP", "hero"),
  yerevan: sourcedPhoto("yerevan-ararat", "/media/destinations/yerevan-ararat.webp", 1600, 1067, "نمای ایروان و کوه آرارات از کاسکاد", "Serouj Ourishian — Wikimedia Commons", "CC BY 4.0; source https://commons.wikimedia.org/wiki/File:Mount_Ararat_and_the_Yerevan_skyline_in_spring_from_the_Cascade.jpg; resized and converted to WebP", "hero"),
  antalya: sourcedPhoto("antalya-harbor", "/media/destinations/antalya-harbor.webp", 1600, 1067, "بندر قدیمی و قایق‌های آنتالیا", "Alan Wang — Pexels", "Pexels License; source https://www.pexels.com/photo/sunny-day-in-antalya-s-historic-harbor-31566937/; resized and converted to WebP", "hero"),
  van: sourcedPhoto("van-akdamar", "/media/destinations/van-akdamar.webp", 1200, 804, "جزیره آختامار و دریاچه وان", "gozturk — Wikimedia Commons", "CC BY 3.0; source https://commons.wikimedia.org/wiki/File:Akhtamar_Island_on_Lake_Van_with_the_Armenian_Cathedral_of_the_Holy_Cross.jpg; resized and converted to WebP", "hero"),
  baku: sourcedPhoto("baku-skyline", "/media/destinations/baku.webp", 1280, 960, "شهر قدیم باکو و برج‌های شعله", "Viceskeeni2 — Wikimedia Commons", "CC0; source https://commons.wikimedia.org/wiki/File:Baku_Skyline_qiz_qalasi.jpg", "hero"),
  doha: sourcedPhoto("doha-corniche", "/media/destinations/doha.webp", 1280, 832, "نمای خط آسمان دوحه از کورنیش", "Zairon — Wikimedia Commons", "CC BY 4.0; source https://commons.wikimedia.org/wiki/File:Doha_Corniche_Skyline_View_2.jpg; resized and converted to WebP", "hero"),
  muscat: sourcedPhoto("muscat-muttrah-corniche", "/media/destinations/muscat.webp", 1280, 960, "نمای ساحل مطرح و کوه‌های مسقط", "Izeberg007 — Wikimedia Commons", "CC0; source https://commons.wikimedia.org/wiki/File:Aerial_view_of_the_coastline_of_Muttrah.jpg", "hero"),
  karbalaHero: sourcedPhoto("karbala-aerial-night", "/media/ziyarat/karbala-hero.webp", 1600, 375, "نمای هوایی شبانه حرم امام حسین و شهر کربلا", "نهال‌گشت — نمونه آزمایشی", "Experimental prototype only; source https://nahalgasht.com/tours/iraq/karbala/; replace or obtain permission before public release", "hero"),
  karbalaNight: sourcedPhoto("karbala-shrine-entrance", "/media/ziyarat/karbala-night.webp", 1600, 1067, "ورودی و گلدسته‌های حرم در کربلا", "نهال‌گشت — نمونه آزمایشی", "Experimental prototype only; source https://nahalgasht.com/tours/iraq/karbala/; replace or obtain permission before public release"),
  karbalaPilgrims: sourcedPhoto("karbala-pilgrims-sunset", "/media/ziyarat/karbala-pilgrims.webp", 1600, 1067, "زائران در مسیر حرم کربلا هنگام غروب", "نهال‌گشت — نمونه آزمایشی", "Experimental prototype only; source https://nahalgasht.com/tours/iraq/karbala/; replace or obtain permission before public release"),
  karbalaDay: sourcedPhoto("karbala-shrine-aerial", "/media/ziyarat/karbala-day.webp", 1600, 1067, "نمای هوایی حرم و بافت شهری کربلا", "نهال‌گشت — نمونه آزمایشی", "Experimental prototype only; source https://nahalgasht.com/tours/iraq/karbala/; replace or obtain permission before public release"),
} satisfies Record<string, PhotoAsset>;

/**
 * Destination visuals use locally stored, source-tracked photography matched to each place.
 */
export const destinationMedia: Record<string, MediaAsset> = {
  kish: photoLibrary.kishShore,
  qeshm: photoLibrary.qeshm,
  mashhad: photoLibrary.mashhad,
  tehran: photoLibrary.tehran,
  shiraz: photoLibrary.shiraz,
  isfahan: photoLibrary.isfahan,
  yazd: photoLibrary.yazd,
  tabriz: photoLibrary.tabriz,
  rasht: photoLibrary.forestMist,
  mazandaran: photoLibrary.highland,
  alborz: photoLibrary.mountainLake,
  istanbul: photoLibrary.istanbul,
  dubai: photoLibrary.dubai,
  antalya: photoLibrary.antalya,
  van: photoLibrary.van,
  najaf: photoLibrary.najaf,
  karbala: photoLibrary.karbalaHero,
  "najaf-karbala": photoLibrary.karbalaHero,
  tbilisi: photoLibrary.tbilisi,
  yerevan: photoLibrary.yerevan,
  baku: photoLibrary.baku,
  doha: photoLibrary.doha,
  muscat: photoLibrary.muscat,
};

/** Service landings. Each service has its own visual identity so pages never look interchangeable. */
export const serviceMedia: Record<string, MediaAsset> = {
  flights: photoLibrary.aircraft,
  hotels: photoLibrary.tehranHotel,
  routes: photoLibrary.forestRoad,
  tours: photoLibrary.antalya,
  ziyarat: photoLibrary.karbalaHero,
  trains: photoLibrary.metro,
  buses: photoLibrary.forestRoad,
  insurance: photoLibrary.globeInHand,
  cip: photoLibrary.airportTraveller,
  transfer: photoLibrary.airportTraveller,
  visa: photoLibrary.mapAndPlane,
  support: photoLibrary.mapAndPlane,
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
  pilgrimage: photoLibrary.karbalaPilgrims,
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

/** Guide cards and their detail heroes must share a photo of the actual tour destination. */
export function tourGuideAsset(slug: string, alt?: string): MediaAsset {
  return destinationAsset(slug === "najaf-karbala" ? "najaf" : slug, alt);
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
