export type SceneKind =
  | "coast"
  | "city"
  | "heritage"
  | "mountain"
  | "desert"
  | "air"
  | "rail"
  | "road"
  | "lounge"
  | "shield"
  | "connect"
  | "document"
  | "market"
  | "forest";

export type ScenePalette = {
  skyFrom: string;
  skyTo: string;
  sun: string;
  far: string;
  mid: string;
  near: string;
  accent: string;
  sand: string;
  trunk: string;
  sky: string;
};

const palette = (
  skyFrom: string,
  skyTo: string,
  sun: string,
  far: string,
  mid: string,
  near: string,
  accent: string,
  sand = "#f4dcc0",
  trunk = "#7a5334",
): ScenePalette => ({ skyFrom, skyTo, sun, far, mid, near, accent, sand, trunk, sky: skyTo });

/**
 * Palettes are tuned per destination family so two cards never look identical,
 * while staying inside the Kiashi warm/turquoise identity.
 */
export const scenePalettes = {
  sea: palette("#bff1f0", "#0f7d86", "#ffd166", "#0c6b74", "#0a5b66", "#083f4d", "#12a3a3"),
  kish: palette("#ffe7cf", "#0fa3a3", "#ffb703", "#0c8f97", "#0a7a86", "#08505f", "#ff8a3d"),
  qeshm: palette("#ffe2bd", "#d9822b", "#ffd166", "#c06a24", "#9a4f1d", "#6d3517", "#12a3a3"),
  mashhad: palette("#e8f4f2", "#0c6b74", "#ffd166", "#14707c", "#0d5763", "#08323f", "#ffb703"),
  najaf: palette("#fdeacb", "#c79a4b", "#fff0c2", "#b98c42", "#8f6a32", "#5f4620", "#0fa3a3"),
  tehran: palette("#ffdfd6", "#3c4a63", "#ff8a3d", "#44536d", "#2f3c52", "#1c2434", "#e53935"),
  shiraz: palette("#ffe3ec", "#8f4d6a", "#ffb703", "#7d4460", "#5d3247", "#3a1e2d", "#12a3a3"),
  isfahan: palette("#dff1fb", "#1f7fa8", "#ffd166", "#1a6e92", "#155874", "#0d3849", "#00a6a6"),
  yazd: palette("#ffeacd", "#c1762f", "#ffd166", "#ab6527", "#84491b", "#57300f", "#0fa3a3"),
  caspian: palette("#e4f5e4", "#2f7d4f", "#ffd166", "#2b7048", "#1f5836", "#123723", "#00a6a6"),
  alborz: palette("#e7f0fb", "#4a6b8a", "#fff3d1", "#48657f", "#33495c", "#1f2c38", "#12a3a3"),
  istanbul: palette("#ffe0c6", "#20536f", "#ffb703", "#1e4d68", "#163b50", "#0d2432", "#ff8a3d"),
  dubai: palette("#ffe5c0", "#8a5bb0", "#ffd166", "#7d51a1", "#5d3b78", "#37224a", "#ffb703"),
  night: palette("#2b3a63", "#101a2f", "#ffd166", "#1b2942", "#141f33", "#0a101c", "#12a3a3"),
  sunrise: palette("#fff1d6", "#ff8a3d", "#ffd166", "#f0793a", "#c85c2c", "#8c3d1d", "#12a3a3"),
  lounge: palette("#fff4e6", "#c98b4b", "#ffd166", "#b87b40", "#8d5c2f", "#5d3b1e", "#0fa3a3"),
  trust: palette("#e3f7f6", "#0fa3a3", "#ffd166", "#0c8f97", "#0a7a86", "#06525c", "#ffb703"),
  brand: palette("#ffe4de", "#e53935", "#ffd166", "#d33531", "#a82724", "#6f1a18", "#ffb703"),
} as const;

export type PaletteName = keyof typeof scenePalettes;

export const sceneKinds: SceneKind[] = [
  "coast",
  "city",
  "heritage",
  "mountain",
  "desert",
  "air",
  "rail",
  "road",
  "lounge",
  "shield",
  "connect",
  "document",
  "market",
  "forest",
];
