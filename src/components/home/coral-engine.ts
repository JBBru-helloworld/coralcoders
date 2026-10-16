/*
 * Canvas renderer for the hero's particle coral. Loaded with a dynamic import
 * after the page has loaded, so none of this is in the main bundle.
 *
 * - Draws the same particles as the WebP fallback (src/lib/coral.ts) with
 *   additive blending, so the settled canvas matches the image.
 * - Intro (~1.6s, once): every particle eases in from a scatter, base first.
 * - Idle: the settled particles are baked, at full device resolution, into
 *   horizontal bands per phase group. A slow current moves each band
 *   sideways in proportion to its height (the base stays put, the tips drift
 *   a few pixels), so an idle frame is a few dozen drawImage calls.
 *   Bands move in whole device pixels and are never scaled or sheared: any
 *   fractional transform makes drawImage resample the bitmap, which is what
 *   blurred the idle coral before (Phase 7b). The current fades in after the
 *   intro: the settled frame is the fallback.
 * - Two resolutions. The intro (moving, 1.6s) draws every particle each
 *   frame, so it renders at up to 2x to stay inside the frame budget on
 *   phones. The idle bands are baked at the full device-pixel ratio (up to
 *   3x) in small slices during idle time, while the last intro frame stays on
 *   screen; the canvas then switches to that resolution. Its backing store
 *   matches the panel's device-pixel box, so the browser shows it 1:1.
 * - Stops requesting frames when off-screen or the tab is hidden.
 */
import {
  type CoralParticles,
  type CoralVariantName,
  coralInk,
  coralPalette,
  coralVariantFor,
  coralVariants,
  generateCoral,
} from "@/lib/coral";

const INTRO_STAGGER = 0.5; // seconds between the base and the tips starting
const INTRO_DURATION = 1.0; // seconds each particle takes to settle
const INTRO_TOTAL = INTRO_STAGGER + 0.1 + INTRO_DURATION;
const IDLE_FRAME = 1000 / 30;
const SWAY = 3.2; // reference px at the top of the coral
const SWAY_SPEED = (Math.PI * 2) / 7; // one slow cycle every ~7s
const SWAY_FADE_IN = 2; // seconds after the intro
const PHASE_GROUPS = 4;
const BANDS = 10; // horizontal bands per phase group for the idle current
const INTRO_DPR = 2; // cap while every particle is drawn each frame
const MAX_DPR = 3; // cap for the baked idle bands
const BAKE_SLICE = 6; // ms of baking per idle slice
const SPRITE_STEP = 0.25; // device px between pre-rendered dot sizes

/** cubic-bezier(0.22, 1, 0.36, 1): the --ease-out token. */
function easeOut(x: number): number {
  const [x1, y1, x2, y2] = [0.22, 1, 0.36, 1];
  let t = x;
  for (let i = 0; i < 6; i++) {
    const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x;
    const dx = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
    if (Math.abs(dx) < 1e-6) break;
    t = Math.min(1, Math.max(0, t - cx / dx));
  }
  return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
}

/**
 * A dot pre-rendered at its real device-pixel size, drawn unscaled.
 * Shrinking one large sprite instead would undersample it and dim it.
 */
function makeSprite([r, g, b]: readonly [number, number, number], radius: number) {
  const size = Math.ceil(radius * 2 + 2);
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d")!;
  ctx.fillStyle = `rgb(${r} ${g} ${b})`;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  return sprite;
}

type Sprites = HTMLCanvasElement[][]; // [colour][radius step]

/** A resolution to draw at: backing size, device px per unit, dot sprites. */
type Raster = { width: number; height: number; scale: number; sprites: Sprites; spriteIndex: Uint8Array };

/** Baked idle bands: a bitmap, its device-px origin and its share of the current. */
type Band = { bitmap: HTMLCanvasElement; x: number; y: number; group: number; lift: number };

export function startCoral(panel: HTMLElement, fallback: HTMLElement | null): () => void {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "coral-canvas";
  panel.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const ink = `rgb(${coralInk.join(" ")})`;

  let variant: CoralVariantName = coralVariantFor(window.innerWidth);
  let particles: CoralParticles = generateCoral(variant);
  let scatterX = new Float32Array(0);
  let scatterY = new Float32Array(0);
  let delay = new Float32Array(0);
  let live: Raster | null = null; // what the canvas is currently sized for
  let bands: Band[] | null = null;
  let baking = 0; // id of the bake in progress, 0 when none
  let bakeTimer = 0;
  let deviceSize: { width: number; height: number } | null = null;

  let elapsed = 0; // seconds of animation time (excludes paused time)
  let lastNow: number | null = null;
  let lastDraw = 0;
  let frame = 0;
  let visible = false;
  let started = false;

  function scatter() {
    const { width, height } = coralVariants[variant];
    scatterX = new Float32Array(particles.count);
    scatterY = new Float32Array(particles.count);
    delay = new Float32Array(particles.count);
    for (let i = 0; i < particles.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = (0.12 + Math.random() * 0.35) * Math.max(width, height);
      scatterX[i] = Math.cos(angle) * distance;
      scatterY[i] = Math.sin(angle) * distance;
      delay[i] = particles.depth[i] * INTRO_STAGGER + Math.random() * 0.1;
    }
  }

  /**
   * The panel's device-pixel box, capped at `maxDpr`. devicePixelContentBoxSize
   * (exact, so the canvas shows 1:1) is trusted only when it agrees with the
   * CSS box times the DPR: emulated DPRs report CSS pixels there.
   */
  function raster(maxDpr: number): Raster {
    const rect = panel.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const cap = Math.min(1, maxDpr / dpr);
    const exact =
      deviceSize !== null &&
      Math.abs(deviceSize.width - rect.width * dpr) <= 1 &&
      Math.abs(deviceSize.height - rect.height * dpr) <= 1;
    const width = Math.round((exact ? deviceSize!.width : rect.width * dpr) * cap);
    const height = Math.round((exact ? deviceSize!.height : rect.height * dpr) * cap);
    const scale = width / coralVariants[variant].width;

    let maxStep = 1;
    const spriteIndex = new Uint8Array(particles.count);
    for (let i = 0; i < particles.count; i++) {
      spriteIndex[i] = Math.max(1, Math.round((particles.r[i] * scale) / SPRITE_STEP));
      maxStep = Math.max(maxStep, spriteIndex[i]);
    }
    const sprites = coralPalette.map((colour) =>
      Array.from({ length: maxStep + 1 }, (_, step) => makeSprite(colour, Math.max(step, 1) * SPRITE_STEP)),
    );
    return { width, height, scale, sprites, spriteIndex };
  }

  function apply(next: Raster) {
    live = next;
    canvas.width = next.width;
    canvas.height = next.height;
  }

  function resize() {
    const next = coralVariantFor(window.innerWidth);
    if (next !== variant) {
      variant = next;
      particles = generateCoral(next);
      scatter();
    }
    cancelBake();
    bands = null;
    if (elapsed < INTRO_TOTAL) {
      apply(raster(INTRO_DPR));
    } else {
      // A resize after the intro (rare): rebake at once, nothing to hold on screen.
      const idle = raster(MAX_DPR);
      apply(idle);
      const bake = bakeBands(idle);
      while (!bake.next().done);
      bands = bake.result;
    }
    draw();
  }

  /** One particle at (x, y) reference units, additive. */
  function plot(target: CanvasRenderingContext2D, r: Raster, i: number, x: number, y: number, alpha: number) {
    const sprite = r.sprites[particles.colour[i]][r.spriteIndex[i]];
    const half = sprite.width / 2;
    target.globalAlpha = alpha;
    target.drawImage(sprite, x * r.scale - half, y * r.scale - half);
  }

  /**
   * Bake the settled particles into bands: one transparent bitmap per phase
   * group and height band, cropped to its particles, with a whole-pixel
   * origin so it can be copied back without resampling. `lift` is the band's
   * height above the base (0 to 1), which scales its share of the current.
   * A generator, so the work can be spread over idle slices.
   */
  function bakeBands(r: Raster) {
    const job = { result: null as Band[] | null, next: () => step.next() };
    const step = (function* () {
      const p = particles;
      const { box } = coralVariants[variant];
      const span = box.base - box.top;
      const key = new Uint16Array(p.count);
      const bounds = new Map<number, { x0: number; y0: number; x1: number; y1: number }>();
      for (let i = 0; i < p.count; i++) {
        const lift = Math.min(1, Math.max(0, (box.base - p.y[i]) / span));
        const k = (i % PHASE_GROUPS) * BANDS + Math.min(BANDS - 1, Math.floor(lift * BANDS));
        key[i] = k;
        const half = r.sprites[p.colour[i]][r.spriteIndex[i]].width / 2;
        const x = p.x[i] * r.scale;
        const y = p.y[i] * r.scale;
        const b = bounds.get(k) ?? { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
        b.x0 = Math.min(b.x0, x - half);
        b.y0 = Math.min(b.y0, y - half);
        b.x1 = Math.max(b.x1, x + half);
        b.y1 = Math.max(b.y1, y + half);
        bounds.set(k, b);
      }
      const baked = new Map<number, { bitmap: HTMLCanvasElement; ctx: CanvasRenderingContext2D; x: number; y: number }>();
      for (const [k, b] of bounds) {
        const bitmap = document.createElement("canvas");
        const x = Math.floor(b.x0);
        const y = Math.floor(b.y0);
        bitmap.width = Math.ceil(b.x1) - x + 1;
        bitmap.height = Math.ceil(b.y1) - y + 1;
        const bandCtx = bitmap.getContext("2d")!;
        bandCtx.globalCompositeOperation = "lighter";
        // Draw in panel coordinates; the whole-pixel origin keeps positions exact.
        bandCtx.translate(-x, -y);
        baked.set(k, { bitmap, ctx: bandCtx, x, y });
      }
      yield;
      for (let i = 0; i < p.count; i++) {
        plot(baked.get(key[i])!.ctx, r, i, p.x[i], p.y[i], p.alpha[i]);
        if (i % 250 === 249) yield;
      }
      job.result = [...baked].map(([k, { bitmap, x, y }]) => ({
        bitmap,
        x,
        y,
        group: Math.floor(k / BANDS),
        lift: ((k % BANDS) + 0.5) / BANDS,
      }));
    })();
    return job;
  }

  /** Bake the idle bands at full resolution in idle-time slices, then switch to them. */
  function startBake() {
    if (baking) return;
    const id = (baking = Math.random() + 1);
    const idle = raster(MAX_DPR);
    const bake = bakeBands(idle);
    const slice = () => {
      bakeTimer = 0;
      if (baking !== id) return;
      const until = performance.now() + BAKE_SLICE;
      while (performance.now() < until) {
        if (bake.next().done) {
          baking = 0;
          apply(idle);
          bands = bake.result;
          draw();
          return;
        }
      }
      bakeTimer = window.setTimeout(slice, 0);
    };
    bakeTimer = window.setTimeout(slice, 0);
  }

  function cancelBake() {
    baking = 0;
    window.clearTimeout(bakeTimer);
  }

  function clear() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
  }

  function drawIntro() {
    const p = particles;
    for (let i = 0; i < p.count; i++) {
      const progress = Math.min(1, Math.max(0, (elapsed - delay[i]) / INTRO_DURATION));
      const e = easeOut(progress);
      plot(ctx, live!, i, p.x[i] + scatterX[i] * (1 - e), p.y[i] + scatterY[i] * (1 - e), p.alpha[i] * (0.12 + 0.88 * e));
    }
  }

  function drawIdle() {
    const fade = Math.min(1, Math.max(0, (elapsed - INTRO_TOTAL) / SWAY_FADE_IN));
    const amount = SWAY * live!.scale * fade * fade * (3 - 2 * fade);
    const sway = elapsed * SWAY_SPEED;
    const drift = Array.from({ length: PHASE_GROUPS }, (_, group) => Math.sin(sway + group * 0.9) * amount);
    ctx.globalAlpha = 1;
    for (const band of bands!) {
      // Whole device pixels only: an exact copy, never a resample.
      ctx.drawImage(band.bitmap, band.x + Math.round(drift[band.group] * band.lift), band.y);
    }
  }

  function draw() {
    if (elapsed < INTRO_TOTAL) {
      clear();
      drawIntro();
    } else if (bands) {
      clear();
      drawIdle();
    } else {
      // The intro has settled: its last frame stays on screen (the current is
      // still fading in from zero) while the crisp bands bake.
      startBake();
    }
  }

  function tick(now: number) {
    frame = 0;
    if (!visible) return;
    if (lastNow !== null) elapsed += Math.min(0.1, (now - lastNow) / 1000);
    lastNow = now;
    // Every frame during the intro; 30fps for the slow idle current.
    if (elapsed < INTRO_TOTAL || now - lastDraw >= IDLE_FRAME) {
      lastDraw = now;
      draw();
    }
    if (!started) {
      started = true;
      canvas.style.opacity = "1";
      if (fallback) {
        fallback.style.opacity = "0";
        // Once faded, take the fallback out of rendering entirely.
        fallback.addEventListener("transitionend", () => (fallback.style.visibility = "hidden"), { once: true });
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function setRunning(running: boolean) {
    visible = running;
    canvas.dataset.state = running ? "running" : "paused";
    if (running && !frame) {
      lastNow = null;
      frame = requestAnimationFrame(tick);
    } else if (!running && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  let inView = true;
  const onVisibility = () => setRunning(inView && document.visibilityState === "visible");
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    onVisibility();
  });
  const resizeObserver = new ResizeObserver(([entry]) => {
    const box = entry.devicePixelContentBoxSize?.[0];
    deviceSize = box ? { width: box.inlineSize, height: box.blockSize } : null;
    resize();
  });

  scatter();
  resize();
  intersection.observe(panel);
  try {
    resizeObserver.observe(panel, { box: "device-pixel-content-box" });
  } catch {
    resizeObserver.observe(panel); // Safari: falls back to the rounded CSS box
  }
  document.addEventListener("visibilitychange", onVisibility);
  onVisibility();

  return () => {
    cancelAnimationFrame(frame);
    cancelBake();
    intersection.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.remove();
    if (fallback) {
      fallback.style.opacity = "";
      fallback.style.visibility = "";
    }
  };
}
