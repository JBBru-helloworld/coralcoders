import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

/* Brand tokens (src/app/globals.css). */
export const colours = {
  sand: "#F7F2EC",
  ink: "#0B1426",
  coral: "#FF6B57",
  coralDeep: "#C2412F",
  lagoon: "#1FB5A8",
  mist: "#60697B",
  mistOnInk: "#AFB8C8",
} as const;

/* The site loads these three from Google Fonts through next/font. */
export const fonts = {
  serif: loadInstrumentSerif("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  sans: loadGeist("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily,
  mono: loadGeistMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

/** cubic-bezier(0.22, 1, 0.36, 1): the site's --ease-out. */
export function easeOut(x: number): number {
  return bezier(0.22, 1, 0.36, 1, x);
}

/** cubic-bezier(0.65, 0, 0.35, 1): the site's --ease-in-out. */
export function easeInOut(x: number): number {
  return bezier(0.65, 0, 0.35, 1, x);
}

/** cubic-bezier(0.3, 0, 0.2, 1): the site's --ease-press. */
export function easePress(x: number): number {
  return bezier(0.3, 0, 0.2, 1, x);
}

function bezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x;
    const dx = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
    if (Math.abs(dx) < 1e-6) break;
    t = Math.min(1, Math.max(0, t - cx / dx));
  }
  return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Mix two #RRGGBB colours; amount 0 gives `a`. */
export function mix(a: string, b: string, amount: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const [r, g, bl] = pa.map((v, i) => Math.round(v + (pb[i] - v) * amount));
  return `rgb(${r}, ${g}, ${bl})`;
}

export type Format = "9x16" | "4x5";

/**
 * Per-format layout. 9:16 keeps text and key visuals inside Instagram's Reel
 * safe zone (y 260 to 1500, 72 px sides); 4:5 is a re-layout for the feed.
 */
export type Layout = {
  width: number;
  height: number;
  side: number;
  safeTop: number;
  safeBottom: number;
  /** Vertical centre for the big type. */
  cy: number;
  /** Multiplier for vertical spacing in stacked layouts. */
  vs: number;
  /** Multiplier for type sizes. */
  ts: number;
  /** The hero coral: reference-unit scale and where its base sits. */
  coral: { scale: number; baseY: number };
  /** The small end-card coral. */
  endCoral: { scale: number; baseY: number };
  /** Subtitle block's bottom edge. */
  subtitleBottom: number;
};

export const layouts: Record<Format, Layout> = {
  "9x16": {
    width: 1080,
    height: 1920,
    side: 72,
    safeTop: 260,
    safeBottom: 1500,
    cy: 860,
    vs: 1,
    ts: 1,
    coral: { scale: 2.2, baseY: 1210 },
    // Lockup centred in the Reel safe zone (centre 880), a touch above true centre.
    endCoral: { scale: 0.95, baseY: 764 },
    subtitleBottom: 1490,
  },
  "4x5": {
    width: 1080,
    height: 1350,
    side: 72,
    safeTop: 72,
    safeBottom: 1278,
    cy: 600,
    vs: 0.72,
    ts: 0.84,
    coral: { scale: 1.75, baseY: 930 },
    // Lockup (coral top to "today to sign up.") centred, a touch above true centre.
    endCoral: { scale: 0.62, baseY: 545 },
    subtitleBottom: 1268,
  },
};
