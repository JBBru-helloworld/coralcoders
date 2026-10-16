/*
 * The hero's coral, grown by the same recursive turtle program shown in the
 * code card (src/content/home.ts). Runs at build time with a fixed seed, so
 * every build draws the same branch. Small angle and length jitter keeps it
 * organic rather than a perfect binary tree.
 */

export type CoralSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 0 for the trunk, increasing towards the tips. */
  level: number;
};

export type CoralTip = { x: number; y: number };

export type Coral = {
  segments: CoralSegment[];
  tips: CoralTip[];
  levels: number;
  viewBox: string;
};

type CoralOptions = {
  length?: number;
  depth?: number;
  /** Degrees turned at each fork, as in `left(25)` / `right(50)`. */
  angle?: number;
  ratio?: number;
  seed?: number;
  angleJitter?: number;
  lengthJitter?: number;
  padding?: number;
};

/** mulberry32: tiny deterministic PRNG. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function growCoral({
  length = 100,
  depth = 7,
  angle = 25,
  ratio = 0.7,
  seed = 20261016,
  angleJitter = 9,
  lengthJitter = 0.14,
  padding = 12,
}: CoralOptions = {}): Coral {
  const rand = random(seed);
  const jitter = (amount: number) => (rand() * 2 - 1) * amount;

  const segments: CoralSegment[] = [];
  const tips: CoralTip[] = [];
  // Turtle state. Heading in degrees: 90 points up; SVG y grows downwards.
  let x = 0;
  let y = 0;
  let heading = 90 + jitter(4);

  const forward = (distance: number, level: number) => {
    const rad = (heading * Math.PI) / 180;
    const nx = x + Math.cos(rad) * distance;
    const ny = y - Math.sin(rad) * distance;
    segments.push({ x1: x, y1: y, x2: nx, y2: ny, level });
    x = nx;
    y = ny;
  };
  const back = (distance: number) => {
    const rad = (heading * Math.PI) / 180;
    x -= Math.cos(rad) * distance;
    y += Math.sin(rad) * distance;
  };

  function coral(len: number, d: number) {
    if (d === 0) {
      tips.push({ x, y });
      return;
    }
    const level = depth - d;
    const actual = len * (1 + jitter(lengthJitter));
    const leftTurn = angle + jitter(angleJitter);
    const rightTurn = angle * 2 + jitter(angleJitter);
    forward(actual, level);
    heading += leftTurn; // left(25)
    coral(len * ratio, d - 1);
    heading -= rightTurn; // right(50)
    coral(len * ratio, d - 1);
    heading += rightTurn - leftTurn; // left(25), back to the original heading
    back(actual);
  }

  coral(length, depth);

  const xs = segments.flatMap((s) => [s.x1, s.x2]);
  const ys = segments.flatMap((s) => [s.y1, s.y2]);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const width = Math.max(...xs) + padding - minX;
  const height = Math.max(...ys) + padding - minY;
  const round = (n: number) => Math.round(n * 10) / 10;

  return {
    segments: segments.map((s) => ({
      x1: round(s.x1),
      y1: round(s.y1),
      x2: round(s.x2),
      y2: round(s.y2),
      level: s.level,
    })),
    tips: tips.map((t) => ({ x: round(t.x), y: round(t.y) })),
    levels: depth,
    viewBox: [minX, minY, width, height].map(round).join(" "),
  };
}
