// Copied verbatim from src/lib/coral.ts (the site), so the advert grows the
// same seeded coral. Keep in sync if the site's coral changes.
/*
 * Particle coral for the hero. A staghorn/sea-fan skeleton of curved, thick,
 * finger-like branches, filled with thousands of glowing particles.
 *
 * Deterministic (fixed seeds) and dependency-free: the build script
 * (scripts/build-coral.ts) renders the static WebP fallback from it, and the
 * canvas engine (src/components/home/coral-engine.ts) animates the same
 * particles, so the fallback and the settled canvas are identical.
 *
 * Mirrors the program in the hero code card:
 *   tip = grow(x, y, angle, length=width * 5)
 *   scatter(dots, along=(x, y, tip), spread=width)
 *   for turn in random.sample([-35, -10, 15, 40], k=2): coral(...)
 */

export type Point = { x: number; y: number };

export type CoralBranch = {
  /** Quadratic Bézier: start, control, end (coral space, up is -y). */
  p0: Point;
  p1: Point;
  p2: Point;
  /** Width at start and end. */
  w0: number;
  w1: number;
  /** 0 for the base, increasing towards the tips. */
  depth: number;
};

export type CoralVariantName = "mobile" | "tablet" | "desktop";

type CoralVariant = {
  /** Reference panel size in CSS pixels; the panel keeps this aspect ratio. */
  width: number;
  height: number;
  count: number;
  /** Where the coral sits inside the panel (reference units). */
  box: { left: number; right: number; top: number; base: number };
};

/** Panel variants, chosen by viewport width (same breakpoints as the CSS). */
export const coralVariants: Record<CoralVariantName, CoralVariant> = {
  // 4:3, full width under the hero text.
  mobile: { width: 360, height: 270, count: 3500, box: { left: 30, right: 330, top: 22, base: 258 } },
  tablet: { width: 640, height: 480, count: 6000, box: { left: 80, right: 560, top: 40, base: 458 } },
  // 4:5. The code card overlaps the bottom of the panel, so the coral sits
  // above it and its base tucks just behind the card's top edge.
  desktop: { width: 480, height: 600, count: 9000, box: { left: 34, right: 446, top: 34, base: 366 } },
};

export function coralVariantFor(viewportWidth: number): CoralVariantName {
  if (viewportWidth >= 1024) return "desktop";
  if (viewportWidth >= 768) return "tablet";
  return "mobile";
}

/** coral, coral-deep, warm highlight (coral towards sand), lagoon. RGB 0-255. */
export const coralPalette: readonly [number, number, number][] = [
  [255, 107, 87],
  [194, 65, 47],
  [251, 175, 162],
  [31, 181, 168],
];
const paletteWeights = [0.7, 0.18, 0.07, 0.05];

/** Panel background, #0B1426. */
export const coralInk: readonly [number, number, number] = [11, 20, 38];

const SKELETON_SEED = 3;
const TURNS = [-35, -10, 15, 40];
/** Wider turns where the base fans out into its first branches. */
const BASE_TURNS = [-52, -18, 14, 47];
const MAX_DEPTH = 4;

/** mulberry32: tiny deterministic PRNG. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const UP = -90;

/** Grow the branch skeleton in coral space, base at (0, 0). */
export function growCoralSkeleton(seed = SKELETON_SEED): CoralBranch[] {
  const rand = seededRandom(seed);
  const jitter = (amount: number) => (rand() * 2 - 1) * amount;
  const branches: CoralBranch[] = [];

  function coral(x: number, y: number, angle: number, width: number, level: number) {
    if (level >= MAX_DEPTH) return;
    // The base is a short, thick stub; branches are about width * 5 long.
    const length = width * (level === 0 ? 1.2 : 5) * (0.85 + rand() * 0.3);
    // Bend each branch gently towards vertical, as coral reaches upwards.
    const endAngle = angle + (UP - angle) * (0.14 + rand() * 0.12) + jitter(5);
    const p1 = {
      x: x + Math.cos(rad(angle)) * length * 0.55,
      y: y + Math.sin(rad(angle)) * length * 0.55,
    };
    const p2 = {
      x: p1.x + Math.cos(rad(endAngle)) * length * 0.5,
      y: p1.y + Math.sin(rad(endAngle)) * length * 0.5,
    };
    const w1 = width * 0.9;
    branches.push({ p0: { x, y }, p1, p2, w0: width, w1, depth: level });

    // Two children, sometimes three; three from the base for a fan shape.
    const children = level === 0 ? 3 : level >= 2 && rand() < 0.2 ? 3 : 2;
    const turns = [...(level === 0 ? BASE_TURNS : TURNS)];
    for (let i = 0; i < children; i++) {
      const turn = turns.splice(Math.floor(rand() * turns.length), 1)[0];
      let childAngle = endAngle + turn + jitter(7);
      childAngle += (UP - childAngle) * 0.05;
      childAngle = Math.max(-162, Math.min(-18, childAngle));
      coral(p2.x, p2.y, childAngle, w1 * (0.72 + rand() * 0.08), level + 1);
    }
  }

  coral(0, 0, UP + jitter(3), 15, 0);
  return branches;
}

/** Particles as parallel typed arrays (fast to animate). */
export type CoralParticles = {
  count: number;
  /** Home position, reference units of the variant's panel. */
  x: Float32Array;
  y: Float32Array;
  /** Radius in reference CSS pixels (0.5 to 1.6). */
  r: Float32Array;
  alpha: Float32Array;
  phase: Float32Array;
  /** 0 at the base, 1 at the top: scales the idle sway. */
  lift: Float32Array;
  /** Branch depth, 0 to 1: staggers the intro, base first. */
  depth: Float32Array;
  colour: Uint8Array;
};

function bezier(b: CoralBranch, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * b.p0.x + 2 * u * t * b.p1.x + t * t * b.p2.x,
    y: u * u * b.p0.y + 2 * u * t * b.p1.y + t * t * b.p2.y,
  };
}

function tangent(b: CoralBranch, t: number): Point {
  const dx = 2 * (1 - t) * (b.p1.x - b.p0.x) + 2 * t * (b.p2.x - b.p1.x);
  const dy = 2 * (1 - t) * (b.p1.y - b.p0.y) + 2 * t * (b.p2.y - b.p1.y);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function generateCoral(
  variantName: CoralVariantName,
  skeletonSeed: number = SKELETON_SEED,
): CoralParticles {
  const variant = coralVariants[variantName];
  const seedOffset = { mobile: 1, tablet: 2, desktop: 3 }[variantName];
  const rand = seededRandom(SKELETON_SEED + seedOffset * 7919);
  const gauss = () => {
    // Box-Muller.
    const u = 1 - rand();
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pickColour = () => {
    let roll = rand();
    for (let i = 0; i < paletteWeights.length; i++) {
      roll -= paletteWeights[i];
      if (roll <= 0) return i;
    }
    return 0;
  };

  // Fit the skeleton into the variant's box: base at the bottom centre.
  const branches = growCoralSkeleton(skeletonSeed);
  let minX = Infinity, maxX = -Infinity, minY = Infinity;
  for (const b of branches) {
    for (const p of [b.p0, b.p1, b.p2]) {
      minX = Math.min(minX, p.x - b.w0 / 2);
      maxX = Math.max(maxX, p.x + b.w0 / 2);
      minY = Math.min(minY, p.y - b.w0 / 2);
    }
  }
  const { box } = variant;
  const scale = Math.min((box.right - box.left) / (maxX - minX), (box.base - box.top) / -minY);
  const offsetX = (box.left + box.right) / 2 - ((minX + maxX) / 2) * scale;
  const toPanel = (p: Point): Point => ({ x: offsetX + p.x * scale, y: box.base + p.y * scale });
  const topY = box.base + minY * scale;
  const liftOf = (y: number) => Math.min(1, Math.max(0, (box.base - y) / (box.base - topY)));

  const count = variant.count;
  const out: CoralParticles = {
    count,
    x: new Float32Array(count),
    y: new Float32Array(count),
    r: new Float32Array(count),
    alpha: new Float32Array(count),
    phase: new Float32Array(count),
    lift: new Float32Array(count),
    depth: new Float32Array(count),
    colour: new Uint8Array(count),
  };
  let i = 0;
  const push = (p: Point, depth: number, alpha: number, radius: number) => {
    out.x[i] = p.x;
    out.y[i] = p.y;
    out.r[i] = radius;
    out.alpha[i] = alpha;
    out.phase[i] = rand() * Math.PI * 2;
    out.lift[i] = liftOf(p.y);
    out.depth[i] = depth / (MAX_DEPTH - 1);
    out.colour[i] = pickColour();
    i++;
  };
  const radius = () => 0.5 + 1.1 * Math.pow(rand(), 3);

  const strays = Math.round(count * 0.04);
  const glow = Math.round(count * 0.02);
  const body = count - strays - glow;

  // Branch particles, shared out by branch area (length x mean width).
  const areas = branches.map((b) => {
    const length = Math.hypot(b.p1.x - b.p0.x, b.p1.y - b.p0.y) + Math.hypot(b.p2.x - b.p1.x, b.p2.y - b.p1.y);
    return length * ((b.w0 + b.w1) / 2);
  });
  const totalArea = areas.reduce((sum, a) => sum + a, 0);
  let remaining = body;
  branches.forEach((b, index) => {
    const n = index === branches.length - 1 ? remaining : Math.round((body * areas[index]) / totalArea);
    remaining -= n;
    const capShare = (b.w1 * 0.5) / (areas[index] / ((b.w0 + b.w1) / 2) + b.w1 * 0.5);
    for (let k = 0; k < n; k++) {
      let point: Point;
      let dir: Point;
      let width: number;
      let spreadScale = 1;
      if (rand() < capShare) {
        // Rounded, blunt tip: a half-disc beyond the end of the branch.
        const u = rand();
        dir = tangent(b, 1);
        point = { x: b.p2.x + dir.x * u * b.w1 * 0.5, y: b.p2.y + dir.y * u * b.w1 * 0.5 };
        width = b.w1;
        spreadScale = Math.sqrt(1 - u * u);
      } else {
        const t = rand();
        dir = tangent(b, t);
        point = bezier(b, t);
        width = b.w0 + (b.w1 - b.w0) * t;
      }
      // Gaussian across the branch: dense core, soft sparse edges.
      const offset = gauss() * width * 0.3 * spreadScale;
      push(
        toPanel({ x: point.x - dir.y * offset, y: point.y + dir.x * offset }),
        b.depth,
        0.26 + rand() * 0.44,
        radius(),
      );
    }
  });

  // Stray particles drifting loosely around the coral.
  for (let k = 0; k < strays; k++) {
    const b = branches[Math.floor(rand() * branches.length)];
    const p = toPanel(bezier(b, rand()));
    const spread = 14 + b.w0 * scale * 1.6;
    push({ x: p.x + gauss() * spread, y: p.y + gauss() * spread }, b.depth, 0.18 + rand() * 0.27, 0.5 + rand() * 0.6);
  }

  // A faint concentrated glow at the base.
  const baseX = offsetX;
  const spreadX = (box.right - box.left) * 0.07;
  for (let k = 0; k < glow; k++) {
    push(
      { x: baseX + gauss() * spreadX, y: box.base - Math.abs(gauss()) * spreadX * 0.6 },
      0,
      0.12 + rand() * 0.2,
      0.6 + rand() * 0.9,
    );
  }

  return out;
}
