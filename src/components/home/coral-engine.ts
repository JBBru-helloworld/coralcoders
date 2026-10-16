/*
 * Canvas renderer for the hero's particle coral. Loaded with a dynamic import
 * after the page has loaded, so none of this is in the main bundle.
 *
 * - Draws the same particles as the WebP fallback (src/lib/coral.ts) with
 *   additive blending, so the settled canvas matches the image.
 * - Intro (~1.6s, once): every particle eases in from a scatter, base first.
 * - Idle: the settled particles are baked into a few layers, one per phase
 *   group. A slow current shears each layer (the base stays put, the tips
 *   drift a few pixels), so an idle frame is a handful of drawImage calls.
 *   The current fades in after the intro: the settled frame is the fallback.
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
  let sprites: HTMLCanvasElement[][] = []; // [colour][radius step]
  let spriteIndex = new Uint8Array(0);
  let layers: HTMLCanvasElement[] | null = null;
  let scale = 1; // device px per reference unit

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

  function resize() {
    const next = coralVariantFor(window.innerWidth);
    if (next !== variant) {
      variant = next;
      particles = generateCoral(next);
      scatter();
    }
    const rect = panel.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    scale = (rect.width / coralVariants[variant].width) * dpr;

    let maxStep = 1;
    spriteIndex = new Uint8Array(particles.count);
    for (let i = 0; i < particles.count; i++) {
      spriteIndex[i] = Math.max(1, Math.round((particles.r[i] * scale) / SPRITE_STEP));
      maxStep = Math.max(maxStep, spriteIndex[i]);
    }
    sprites = coralPalette.map((colour) =>
      Array.from({ length: maxStep + 1 }, (_, step) => makeSprite(colour, Math.max(step, 1) * SPRITE_STEP)),
    );
    layers = null;
    draw();
  }

  /** One particle at (x, y) reference units, additive. */
  function plot(target: CanvasRenderingContext2D, i: number, x: number, y: number, alpha: number) {
    const sprite = sprites[particles.colour[i]][spriteIndex[i]];
    const half = sprite.width / 2;
    target.globalAlpha = alpha;
    target.drawImage(sprite, x * scale - half, y * scale - half);
  }

  /** Bake the settled particles into one transparent layer per phase group. */
  function bakeLayers(): HTMLCanvasElement[] {
    const baked = Array.from({ length: PHASE_GROUPS }, () => {
      const layer = document.createElement("canvas");
      layer.width = canvas.width;
      layer.height = canvas.height;
      return layer;
    });
    const contexts = baked.map((layer) => {
      const layerCtx = layer.getContext("2d")!;
      layerCtx.globalCompositeOperation = "lighter";
      return layerCtx;
    });
    const p = particles;
    for (let i = 0; i < p.count; i++) {
      plot(contexts[i % PHASE_GROUPS], i, p.x[i], p.y[i], p.alpha[i]);
    }
    return baked;
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
      plot(ctx, i, p.x[i] + scatterX[i] * (1 - e), p.y[i] + scatterY[i] * (1 - e), p.alpha[i] * (0.12 + 0.88 * e));
    }
  }

  function drawIdle() {
    layers ??= bakeLayers();
    const { box } = coralVariants[variant];
    const base = box.base * scale;
    const height = (box.base - box.top) * scale;
    const fade = Math.min(1, Math.max(0, (elapsed - INTRO_TOTAL) / SWAY_FADE_IN));
    const amount = SWAY * scale * fade * fade * (3 - 2 * fade);
    const sway = elapsed * SWAY_SPEED;
    ctx.globalAlpha = 1;
    layers.forEach((layer, group) => {
      // Shear: x moves in proportion to height above the base.
      const shear = (Math.sin(sway + group * 0.9) * amount) / height;
      ctx.setTransform(1, 0, -shear, 1, shear * base, 0);
      ctx.drawImage(layer, 0, 0);
    });
  }

  function draw() {
    clear();
    if (elapsed < INTRO_TOTAL) drawIntro();
    else drawIdle();
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
      if (fallback) fallback.style.opacity = "0";
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
  const resizeObserver = new ResizeObserver(() => resize());

  scatter();
  resize();
  intersection.observe(panel);
  resizeObserver.observe(panel);
  document.addEventListener("visibilitychange", onVisibility);
  onVisibility();

  return () => {
    cancelAnimationFrame(frame);
    intersection.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.remove();
    if (fallback) fallback.style.opacity = "";
  };
}
