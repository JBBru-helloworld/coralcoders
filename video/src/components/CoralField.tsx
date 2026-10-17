/*
 * The site's particle coral (src/lib/coral.ts, desktop variant: seed 3, 9,000
 * particles), drawn on a canvas at the full output resolution with additive
 * blending, as on the site.
 *
 * Remotion renders frames in any order, so every particle's position is a pure
 * function of the frame: seeded extras are computed once at module load, and
 * nothing carries over between frames. The dot sprites are a cache only.
 *
 * hero: drifts in loose (line 1), gathers (line 2), assembles base first on
 *       "it grows" in about 1.6 s with a slow push-in (line 3), settles and
 *       dims (line 4), fades with the cross-fade to sand.
 * end:  returns small at the top for the end card and holds perfectly still.
 */
import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { beats } from "../lib/beats";
import { coralPalette, coralVariants, generateCoral, seededRandom } from "../lib/coral";
import { type Layout, clamp01, easeInOut, easeOut } from "../lib/theme";
import { FPS, line } from "../lib/timeline";

const REF = coralVariants.desktop;
const REF_CX = (REF.box.left + REF.box.right) / 2;
const P = generateCoral("desktop");
const N = P.count;

/* Seeded extras per particle: scatter, drift, gathering cloud, timing. */
const X = (() => {
  const rand = seededRandom(9_2026);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const e = {
    sx: new Float32Array(N),
    sy: new Float32Array(N),
    vx: new Float32Array(N),
    vy: new Float32Array(N),
    cx: new Float32Array(N),
    cy: new Float32Array(N),
    appear: new Float32Array(N),
    jitter: new Float32Array(N),
    ex: new Float32Array(N),
    ey: new Float32Array(N),
    lead: new Uint8Array(N),
  };
  for (let i = 0; i < N; i++) {
    e.sx[i] = rand();
    e.sy[i] = rand();
    e.vx[i] = rand() * 2 - 1;
    e.vy[i] = rand() * 2 - 1;
    e.cx[i] = gauss();
    e.cy[i] = gauss();
    e.appear[i] = rand();
    e.jitter[i] = rand();
    const angle = rand() * Math.PI * 2;
    const distance = 0.15 + rand() * 0.35;
    e.ex[i] = Math.cos(angle) * distance;
    e.ey[i] = Math.sin(angle) * distance;
    // A few hundred particles open the film; the rest join while it gathers.
    e.lead[i] = i % 20 === 0 ? 1 : 0;
  }
  return e;
})();

/* Pre-rendered dots at their real pixel size (as the site does). */
const SPRITE_STEP = 0.25;
const sprites = new Map<string, HTMLCanvasElement>();
function sprite(colour: number, step: number): HTMLCanvasElement {
  const key = `${colour}:${step}`;
  let s = sprites.get(key);
  if (!s) {
    const radius = Math.max(step, 1) * SPRITE_STEP;
    const size = Math.ceil(radius * 2 + 2);
    s = document.createElement("canvas");
    s.width = s.height = size;
    const ctx = s.getContext("2d")!;
    const [r, g, b] = coralPalette[colour];
    ctx.fillStyle = `rgb(${r} ${g} ${b})`;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    sprites.set(key, s);
  }
  return s;
}

const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

function drawHero(ctx: CanvasRenderingContext2D, t: number, layout: Layout) {
  const { width: W, height: H } = layout;
  const S = layout.coral.scale;
  const cx = W / 2;
  const baseY = layout.coral.baseY;
  const topY = baseY - (REF.box.base - REF.box.top) * S;

  const lineTwo = line(2).start;
  const grow = beats.growAt;
  const gather = 0.55 * easeInOut(clamp01((t - lineTwo + 0.2) / (grow - lineTwo + 0.2)));
  // A quarter-bright on frame 0, so the first frame is never empty.
  const leadIn = 0.25 + 0.75 * smooth(t / 1.8);
  const swayIn = smooth((t - grow - 1.6) / 2);
  const swayPhase = (t * Math.PI * 2) / 7;
  const push = 1 + 0.04 * easeInOut(clamp01((t - grow) / (line(5).start - grow)));
  const dim = 1 - 0.55 * easeInOut(clamp01((t - line(4).start + 0.35) / 0.9));
  const fade = 1 - easeInOut(clamp01((t - beats.toSand.from) / (beats.toSand.to - beats.toSand.from)));
  if (fade <= 0) return;

  // Slow push-in about the coral's centre.
  const pivotY = (baseY + topY) / 2;
  ctx.setTransform(push, 0, 0, push, cx * (1 - push), pivotY * (1 - push));
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < N; i++) {
    const homeX = cx + (P.x[i] - REF_CX) * S;
    const homeY = baseY + (P.y[i] - REF.box.base) * S;

    // Loose, drifting scatter across the frame.
    const sx = X.sx[i] * W + X.vx[i] * 16 * t;
    const sy = H * (0.1 + 0.8 * X.sy[i]) + X.vy[i] * 11 * t;
    // A loose cloud around the coral that the scatter gathers towards.
    const gx = homeX + X.cx[i] * 150 * S;
    const gy = homeY + X.cy[i] * 170 * S;
    const preX = sx + (gx - sx) * gather;
    const preY = sy + (gy - sy) * gather;

    let preAlpha: number;
    if (X.lead[i]) {
      preAlpha = P.alpha[i] * 1.3 * leadIn;
    } else {
      const appear = lineTwo - 0.2 + X.appear[i] * (grow - lineTwo);
      preAlpha = P.alpha[i] * 0.6 * smooth((t - appear) / 0.9);
    }

    // Assemble base first, as on the site: 0.5 s stagger by depth, 1 s each.
    const e = easeOut(clamp01((t - grow - P.depth[i] * 0.5 - X.jitter[i] * 0.1) / 1.0));
    let x = preX + (homeX - preX) * e;
    const y = preY + (homeY - preY) * e;
    x += Math.sin(swayPhase + (i % 4) * 0.9) * 3.2 * S * P.lift[i] * swayIn;

    const alpha = (preAlpha + (P.alpha[i] - preAlpha) * e) * dim * fade;
    if (alpha <= 0.002) continue;
    plot(ctx, i, x, y, alpha, S);
  }
}

function drawEnd(ctx: CanvasRenderingContext2D, t: number, layout: Layout) {
  const S = layout.endCoral.scale;
  const cx = layout.width / 2;
  const baseY = layout.endCoral.baseY;
  const span = (REF.box.right - REF.box.left) * S;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < N; i++) {
    const e = easeOut(clamp01((t - beats.endCoralAt - P.depth[i] * 0.35 - X.jitter[i] * 0.1) / 1.1));
    if (e <= 0) continue;
    const homeX = cx + (P.x[i] - REF_CX) * S;
    const homeY = baseY + (P.y[i] - REF.box.base) * S;
    const x = homeX + X.ex[i] * span * (1 - e);
    const y = homeY + X.ey[i] * span * (1 - e);
    plot(ctx, i, x, y, P.alpha[i] * e, S);
  }
}

function plot(ctx: CanvasRenderingContext2D, i: number, x: number, y: number, alpha: number, scale: number) {
  const s = sprite(P.colour[i], Math.max(1, Math.round((P.r[i] * scale) / SPRITE_STEP)));
  const half = s.width / 2;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(s, x - half, y - half);
}

export function CoralField({ layout, mode, glow = 0 }: { layout: Layout; mode: "hero" | "end"; glow?: number }) {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = frame / FPS;
    if (mode === "hero") drawHero(ctx, t, layout);
    else drawEnd(ctx, t, layout);
  }, [frame, layout, mode]);

  return (
    <canvas
      ref={ref}
      width={layout.width}
      height={layout.height}
      style={{
        position: "absolute",
        inset: 0,
        width: layout.width,
        height: layout.height,
        filter: glow ? `blur(${glow}px)` : undefined,
        opacity: glow ? 0.55 : 1,
      }}
    />
  );
}
