import type { ScenePalette, SceneKind } from "@/media/scenes";
import { scenePalettes } from "@/media/scenes";

type SceneProps = { palette: ScenePalette };

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

/** Deterministic pseudo-random so a scene always renders identically on server and client. */
const jitter = (seed: number, spread: number) => ((Math.sin(seed * 12.9898) * 43758.5453) % 1) * spread;

function Sky({ palette, horizon = 62 }: SceneProps & { horizon?: number }) {
  return (
    <>
      <rect width="800" height="600" fill="url(#sky)" />
      <circle cx="610" cy={horizon * 3.2} r="54" fill="url(#glow)" />
      <circle cx="610" cy={horizon * 3.2} r="26" fill={palette.sun} opacity="0.92" />
    </>
  );
}

function Vignette() {
  return (
    <>
      <rect width="800" height="600" fill="url(#vignette)" />
      <rect width="800" height="600" fill="url(#grain)" opacity="0.06" />
    </>
  );
}

function Coast({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={52} />
      <path d="M0 330 q120 -46 240 -8 q90 28 170 6 q120 -34 220 4 l170 26 V600 H0Z" fill={palette.far} opacity="0.45" />
      <rect y="352" width="800" height="248" fill="url(#ground)" />
      {range(5).map((index) => (
        <path
          key={index}
          d={`M${-40 + index * 30} ${392 + index * 34} q110 ${14 + jitter(index + 1, 10)} 220 0 q110 -14 220 0 q110 14 220 0`}
          fill="none"
          stroke={palette.near}
          strokeWidth={index % 2 ? 2 : 3}
          opacity={0.16 + index * 0.05}
          strokeLinecap="round"
        />
      ))}
      <path d="M0 528 q200 -30 400 -6 q200 24 400 -12 V600 H0Z" fill={palette.sand} opacity="0.94" />
      {[110, 168].map((x, index) => (
        <g key={x} opacity={index ? 0.78 : 0.92}>
          <path d={`M${x} 520 q-8 -70 4 -112`} stroke={palette.trunk} strokeWidth="7" fill="none" strokeLinecap="round" />
          {range(5).map((leaf) => (
            <path
              key={leaf}
              d={`M${x + 4} 408 q${leaf % 2 ? 52 : -52} ${-30 + leaf * 16} ${leaf % 2 ? 74 : -74} ${6 + leaf * 9}`}
              stroke={palette.mid}
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
      <Vignette />
    </>
  );
}

function City({ palette }: SceneProps) {
  const skyline = [96, 150, 74, 210, 128, 178, 92, 240, 116, 160, 86, 198];
  return (
    <>
      <Sky palette={palette} horizon={50} />
      <path d="M0 360 l90 -40 l70 30 l110 -54 l96 44 l120 -62 l104 52 l110 -34 l100 40 V600 H0Z" fill={palette.far} opacity="0.4" />
      <g>
        {skyline.map((height, index) => {
          const x = index * 68 - 6;
          const width = index % 3 === 0 ? 74 : 56;
          return (
            <g key={index}>
              <rect x={x} y={600 - height - 120} width={width} height={height + 120} rx="6" fill={palette.mid} opacity={0.88} />
              {range(Math.max(2, Math.round(height / 46))).map((row) => (
                <rect
                  key={row}
                  x={x + 12}
                  y={600 - height - 96 + row * 38}
                  width={width - 24}
                  height="12"
                  rx="3"
                  fill={palette.sun}
                  opacity={row % 2 ? 0.22 : 0.4}
                />
              ))}
            </g>
          );
        })}
      </g>
      <rect y="560" width="800" height="40" fill={palette.near} opacity="0.95" />
      <Vignette />
    </>
  );
}

function Heritage({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={48} />
      <path d="M0 372 q160 -40 320 -10 q170 32 320 -14 l160 -14 V600 H0Z" fill={palette.far} opacity="0.38" />
      {[262, 538].map((x) => (
        <g key={x}>
          <rect x={x - 17} y="250" width="34" height="310" rx="10" fill={palette.mid} />
          <path d={`M${x - 24} 254 q24 -54 48 0Z`} fill={palette.accent} />
          <circle cx={x} cy="196" r="9" fill={palette.sun} />
        </g>
      ))}
      <path d="M400 168 q104 74 104 168 H296 q0 -94 104 -168Z" fill={palette.accent} />
      <path d="M400 150 q12 18 0 34 q-12 -16 0 -34Z" fill={palette.sun} />
      <rect x="292" y="330" width="216" height="230" rx="12" fill={palette.mid} />
      {range(3).map((index) => (
        <path
          key={index}
          d={`M${330 + index * 66} 560 v-96 q23 -34 46 0 v96Z`}
          fill={palette.near}
          opacity="0.82"
        />
      ))}
      <rect y="556" width="800" height="44" fill={palette.near} />
      <Vignette />
    </>
  );
}

function Mountain({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={46} />
      <path d="M-20 420 l190 -190 l150 150 l130 -120 l200 200 l170 -80 V600 H-20Z" fill={palette.far} opacity="0.5" />
      <path d="M-20 470 l170 -150 l140 130 l160 -110 l190 180 V600 H-20Z" fill={palette.mid} opacity="0.9" />
      <path d="M150 320 l44 40 l-28 12 l-30 -22Z" fill="#ffffff" opacity="0.82" />
      <path d="M470 340 l48 44 l-32 12 l-32 -24Z" fill="#ffffff" opacity="0.7" />
      <rect y="470" width="800" height="130" fill="url(#ground)" />
      {range(9).map((index) => {
        const x = 40 + index * 92 + jitter(index + 3, 22);
        return (
          <path
            key={index}
            d={`M${x} 556 l-22 -60 h12 l-12 -34 h10 l-10 -30 l22 -26 l22 26 h-10 l10 30 h-12 l12 34 h12Z`}
            fill={palette.near}
            opacity={0.85}
          />
        );
      })}
      <Vignette />
    </>
  );
}

function Desert({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={58} />
      <path d="M0 392 q180 -62 360 -12 q180 50 440 -22 V600 H0Z" fill={palette.far} opacity="0.62" />
      <path d="M0 458 q220 -54 420 -6 q200 48 380 -16 V600 H0Z" fill={palette.mid} opacity="0.9" />
      <path d="M0 528 q240 -40 460 4 q160 32 340 -8 V600 H0Z" fill={palette.near} />
      {range(3).map((index) => (
        <path
          key={index}
          d={`M${520 + index * 44} 512 q-8 -24 6 -34 q16 -10 24 6 q10 -18 22 -2 l6 30Z`}
          fill={palette.accent}
          opacity={0.7 - index * 0.16}
        />
      ))}
      <Vignette />
    </>
  );
}

function Air({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={44} />
      {range(6).map((index) => {
        const x = 40 + index * 138;
        const y = 150 + jitter(index + 2, 190);
        const scale = 0.7 + (index % 3) * 0.24;
        return (
          <g key={index} opacity={0.24 + (index % 3) * 0.1}>
            <ellipse cx={x} cy={y} rx={78 * scale} ry={26 * scale} fill="#ffffff" />
            <ellipse cx={x + 46 * scale} cy={y - 14 * scale} rx={52 * scale} ry={22 * scale} fill="#ffffff" />
          </g>
        );
      })}
      <path d="M140 470 q150 -34 300 -96" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.34" fill="none" strokeDasharray="2 22" />
      <g transform="translate(470 330) rotate(-16)">
        <path d="M0 0 l176 -26 q30 -4 30 12 q0 14 -28 20 L2 34 Z" fill={palette.near} />
        <path d="M54 6 l-46 -74 h30 l74 66Z" fill={palette.mid} />
        <path d="M60 22 l-40 66 h28 l66 -60Z" fill={palette.mid} opacity="0.86" />
        <circle cx="176" cy="-4" r="7" fill={palette.sun} />
      </g>
      <Vignette />
    </>
  );
}

function Rail({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={50} />
      <path d="M0 356 q180 -38 340 -6 q180 34 460 -18 V600 H0Z" fill={palette.far} opacity="0.45" />
      <rect y="410" width="800" height="190" fill="url(#ground)" />
      <path d="M300 410 L60 600 H190 L372 410Z" fill={palette.near} opacity="0.5" />
      <path d="M470 410 L740 600 H612 L410 410Z" fill={palette.near} opacity="0.5" />
      {range(7).map((index) => (
        <rect key={index} x={286 - index * 30} y={424 + index * 24} width={200 + index * 62} height="8" rx="4" fill={palette.mid} opacity="0.55" />
      ))}
      <g transform="translate(286 206)">
        <rect width="220" height="230" rx="34" fill={palette.mid} />
        <rect x="20" y="30" width="180" height="84" rx="18" fill={palette.sky} opacity="0.85" />
        <rect x="42" y="150" width="136" height="46" rx="14" fill={palette.accent} opacity="0.9" />
        <circle cx="62" cy="214" r="13" fill={palette.sun} />
        <circle cx="158" cy="214" r="13" fill={palette.sun} />
      </g>
      <Vignette />
    </>
  );
}

function Road({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={52} />
      <path d="M0 372 q170 -50 330 -12 q180 42 470 -22 V600 H0Z" fill={palette.far} opacity="0.48" />
      <rect y="414" width="800" height="186" fill="url(#ground)" />
      <path d="M330 414 L110 600 H700 L470 414Z" fill={palette.near} opacity="0.85" />
      {range(5).map((index) => (
        <rect key={index} x={392 - index * 5} y={440 + index * 32} width={16 + index * 5} height={18 + index * 4} rx="5" fill={palette.sun} opacity="0.55" />
      ))}
      <g transform="translate(262 236)">
        <rect width="276" height="176" rx="30" fill={palette.mid} />
        <rect x="22" y="26" width="232" height="66" rx="16" fill={palette.sky} opacity="0.88" />
        <rect x="24" y="112" width="86" height="34" rx="10" fill={palette.accent} opacity="0.86" />
        <circle cx="70" cy="180" r="20" fill={palette.near} />
        <circle cx="210" cy="180" r="20" fill={palette.near} />
      </g>
      <Vignette />
    </>
  );
}

function Lounge({ palette }: SceneProps) {
  return (
    <>
      <rect width="800" height="600" fill="url(#sky)" />
      {range(3).map((index) => (
        <path
          key={index}
          d={`M${90 + index * 232} 470 v-210 q86 -96 172 0 v210Z`}
          fill={palette.sky}
          opacity={0.5 - index * 0.08}
        />
      ))}
      <circle cx="642" cy="150" r="46" fill="url(#glow)" />
      <rect y="470" width="800" height="130" fill={palette.near} />
      <g transform="translate(168 300)">
        <rect x="-8" y="86" width="250" height="96" rx="28" fill={palette.mid} />
        <rect x="14" y="10" width="206" height="106" rx="30" fill={palette.accent} opacity="0.92" />
        <rect x="-26" y="104" width="44" height="72" rx="18" fill={palette.mid} />
        <rect x="216" y="104" width="44" height="72" rx="18" fill={palette.mid} />
      </g>
      <g transform="translate(540 344)">
        <rect x="-6" y="76" width="176" height="18" rx="9" fill={palette.mid} />
        <rect x="64" y="-28" width="14" height="104" rx="7" fill={palette.mid} />
        <path d="M18 -28 h106 l-28 -54 h-50Z" fill={palette.sun} opacity="0.92" />
      </g>
      <Vignette />
    </>
  );
}

function Shield({ palette }: SceneProps) {
  return (
    <>
      <rect width="800" height="600" fill="url(#sky)" />
      {range(3).map((index) => (
        <circle key={index} cx="400" cy="300" r={150 + index * 74} fill="none" stroke={palette.accent} strokeWidth="2" opacity={0.26 - index * 0.06} />
      ))}
      <path d="M400 128 l152 62 v128 q0 132 -152 194 q-152 -62 -152 -194 V190Z" fill={palette.mid} />
      <path d="M400 168 l112 46 v100 q0 100 -112 150 q-112 -50 -112 -150V214Z" fill={palette.accent} opacity="0.9" />
      <path d="M338 320 l44 46 l82 -100" stroke={palette.sun} strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Vignette />
    </>
  );
}

function Connect({ palette }: SceneProps) {
  return (
    <>
      <rect width="800" height="600" fill="url(#sky)" />
      {range(4).map((index) => (
        <path
          key={index}
          d={`M250 ${300 - index * 6} a${120 + index * 62} ${120 + index * 62} 0 0 1 ${300} 0`}
          fill="none"
          stroke={palette.accent}
          strokeWidth="8"
          strokeLinecap="round"
          opacity={0.42 - index * 0.09}
          transform={`translate(0 ${-index * 40})`}
        />
      ))}
      <rect x="318" y="228" width="164" height="286" rx="34" fill={palette.mid} />
      <rect x="338" y="256" width="124" height="216" rx="18" fill={palette.sky} opacity="0.94" />
      <circle cx="400" cy="492" r="11" fill={palette.sun} />
      {range(3).map((index) => (
        <rect key={index} x={358 + index * 30} y={300 + index * 26} width="20" height={92 - index * 26} rx="8" fill={palette.accent} opacity="0.78" />
      ))}
      <Vignette />
    </>
  );
}

function Document({ palette }: SceneProps) {
  return (
    <>
      <rect width="800" height="600" fill="url(#sky)" />
      <g transform="rotate(-8 400 300)">
        <rect x="236" y="150" width="330" height="330" rx="28" fill={palette.mid} />
        <rect x="266" y="184" width="270" height="262" rx="18" fill={palette.sky} opacity="0.95" />
        <circle cx="400" cy="272" r="48" fill="none" stroke={palette.accent} strokeWidth="10" />
        <path d="M352 272 h96 M400 224 v96" stroke={palette.accent} strokeWidth="6" opacity="0.72" />
        {range(4).map((index) => (
          <rect key={index} x="300" y={346 + index * 26} width={200 - index * 34} height="12" rx="6" fill={palette.near} opacity={0.5 - index * 0.07} />
        ))}
      </g>
      <g transform="rotate(14 580 420)">
        <circle cx="580" cy="420" r="62" fill="none" stroke={palette.accent} strokeWidth="9" opacity="0.8" />
        <circle cx="580" cy="420" r="44" fill="none" stroke={palette.sun} strokeWidth="5" opacity="0.72" />
      </g>
      <Vignette />
    </>
  );
}

function Market({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={44} />
      <rect y="404" width="800" height="196" fill="url(#ground)" />
      {range(4).map((index) => {
        const x = index * 208 - 30;
        return (
          <g key={index}>
            <rect x={x} y="300" width="190" height="34" rx="12" fill={palette.accent} opacity="0.94" />
            {range(5).map((stripe) => (
              <rect key={stripe} x={x + stripe * 38} y="300" width="19" height="34" fill={palette.sun} opacity="0.55" />
            ))}
            <rect x={x + 16} y="334" width="158" height="120" rx="12" fill={palette.mid} opacity="0.9" />
            <rect x={x + 8} y="330" width="8" height="128" rx="4" fill={palette.near} />
            <rect x={x + 174} y="330" width="8" height="128" rx="4" fill={palette.near} />
          </g>
        );
      })}
      {range(6).map((index) => (
        <g key={index}>
          <path d={`M${80 + index * 128} 150 v46`} stroke={palette.near} strokeWidth="3" opacity="0.5" />
          <circle cx={80 + index * 128} cy="216" r="22" fill={palette.sun} opacity="0.88" />
        </g>
      ))}
      <Vignette />
    </>
  );
}

function Forest({ palette }: SceneProps) {
  return (
    <>
      <Sky palette={palette} horizon={42} />
      <path d="M0 330 q140 -44 280 -6 q150 40 300 -10 q120 -30 220 12 V600 H0Z" fill={palette.far} opacity="0.44" />
      <rect y="360" width="800" height="240" fill="url(#ground)" />
      {range(14).map((index) => {
        const x = index * 60 - 20 + jitter(index + 5, 26);
        const height = 150 + jitter(index + 7, 120);
        return (
          <path
            key={index}
            d={`M${x} 560 l-34 0 l34 -${height} l34 ${height}Z`}
            fill={index % 2 ? palette.mid : palette.near}
            opacity={index % 3 === 0 ? 0.78 : 0.94}
          />
        );
      })}
      <path d="M0 452 q190 -22 380 4 q180 24 420 -10" stroke="#ffffff" strokeWidth="26" opacity="0.14" fill="none" strokeLinecap="round" />
      <Vignette />
    </>
  );
}

const scenes: Record<SceneKind, (props: SceneProps) => React.ReactElement> = {
  coast: Coast,
  city: City,
  heritage: Heritage,
  mountain: Mountain,
  desert: Desert,
  air: Air,
  rail: Rail,
  road: Road,
  lounge: Lounge,
  shield: Shield,
  connect: Connect,
  document: Document,
  market: Market,
  forest: Forest,
};

export type TravelSceneProps = {
  scene: SceneKind;
  palette?: keyof typeof scenePalettes;
  className?: string;
  /** Decorative by default; pass a label only when the scene carries information. */
  label?: string;
};

/**
 * Branded, project-owned illustration used where licensed photography does not exist.
 * Renders as inline SVG so it costs no extra request, never 404s and stays crisp on every breakpoint.
 */
export default function TravelScene({ scene, palette = "sea", className, label }: TravelSceneProps) {
  const tokens = scenePalettes[palette] ?? scenePalettes.sea;
  const Scene = scenes[scene] ?? Coast;
  const id = `${scene}-${palette}`;
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={tokens.skyFrom} />
          <stop offset="100%" stopColor={tokens.skyTo} />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tokens.mid} />
          <stop offset="100%" stopColor={tokens.near} />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0%" stopColor={tokens.sun} stopOpacity="0.85" />
          <stop offset="100%" stopColor={tokens.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vignette" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#0b1622" stopOpacity="0" />
          <stop offset="70%" stopColor="#0b1622" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0b1622" stopOpacity="0.32" />
        </linearGradient>
        <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="none" />
          <circle cx="1.5" cy="1.5" r="0.9" fill="#ffffff" />
          <circle cx="4.5" cy="4" r="0.7" fill="#0b1622" />
        </pattern>
      </defs>
      <g key={id}>
        <Scene palette={tokens} />
      </g>
    </svg>
  );
}
