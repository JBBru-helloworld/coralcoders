/*
 * Renders the settled particle coral to WebP fallbacks (one per panel
 * variant, at 2x) in public/coral/. Runs before `next dev` and `next build`.
 *
 * Each fallback is split into a 2x2 grid of tiles. Every tile is smaller
 * than the hero H1 on screen, so the H1 stays the Largest Contentful Paint
 * element (one full-panel image would take it over once loaded).
 *
 * Particles are splatted additively onto ink, the same maths as the canvas
 * engine's `globalCompositeOperation = "lighter"`, so the fallback and the
 * settled canvas match.
 */
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import {
  type CoralVariantName,
  coralInk,
  coralPalette,
  coralVariants,
  generateCoral,
} from "../src/lib/coral.ts";

const SCALE = 2;
const outDir = join(import.meta.dirname, "..", "public", "coral");

async function render(name: CoralVariantName) {
  const variant = coralVariants[name];
  const width = variant.width * SCALE;
  const height = variant.height * SCALE;
  const pixels = new Float32Array(width * height * 3);
  for (let p = 0; p < width * height; p++) pixels.set(coralInk, p * 3);

  const particles = generateCoral(name);
  for (let i = 0; i < particles.count; i++) {
    const cx = particles.x[i] * SCALE;
    const cy = particles.y[i] * SCALE;
    const r = particles.r[i] * SCALE;
    const alpha = particles.alpha[i];
    const [red, green, blue] = coralPalette[particles.colour[i]];
    const x0 = Math.max(0, Math.floor(cx - r - 1));
    const x1 = Math.min(width - 1, Math.ceil(cx + r + 1));
    const y0 = Math.max(0, Math.floor(cy - r - 1));
    const y1 = Math.min(height - 1, Math.ceil(cy + r + 1));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        // Anti-aliased disc coverage, one pixel of edge falloff.
        const coverage = Math.min(1, Math.max(0, r + 0.5 - Math.hypot(x + 0.5 - cx, y + 0.5 - cy)));
        if (coverage === 0) continue;
        const k = coverage * alpha;
        const index = (y * width + x) * 3;
        pixels[index] += red * k;
        pixels[index + 1] += green * k;
        pixels[index + 2] += blue * k;
      }
    }
  }

  const bytes = Buffer.alloc(width * height * 3);
  for (let p = 0; p < bytes.length; p++) bytes[p] = Math.min(255, Math.round(pixels[p]));
  const image = sharp(bytes, { raw: { width, height, channels: 3 } });
  let total = 0;
  for (let tile = 0; tile < 4; tile++) {
    const info = await image
      .clone()
      .extract({ left: (tile % 2) * (width / 2), top: Math.floor(tile / 2) * (height / 2), width: width / 2, height: height / 2 })
      .webp({ quality: 80, effort: 6 })
      .toFile(join(outDir, `coral-${name}-${tile}.webp`));
    total += info.size;
  }
  console.log(`coral: ${name} ${width}x${height}, ${particles.count} particles, 4 tiles, ${(total / 1024).toFixed(1)} KB`);
}

/**
 * A small, faint copy of the mobile coral on black for the closing section.
 * Shown with mix-blend-mode: screen, so the black drops out on any ink tone.
 */
async function renderEcho() {
  const { width, height } = coralVariants.mobile;
  const pixels = new Float32Array(width * height * 3);
  const particles = generateCoral("mobile");
  for (let i = 0; i < particles.count; i++) {
    const x = Math.round(particles.x[i]);
    const y = Math.round(particles.y[i]);
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const [red, green, blue] = coralPalette[particles.colour[i]];
    const k = particles.alpha[i] * Math.min(1, particles.r[i]);
    const index = (y * width + x) * 3;
    pixels[index] += red * k;
    pixels[index + 1] += green * k;
    pixels[index + 2] += blue * k;
  }
  const bytes = Buffer.alloc(width * height * 3);
  for (let p = 0; p < bytes.length; p++) bytes[p] = Math.min(255, Math.round(pixels[p]));
  const info = await sharp(bytes, { raw: { width, height, channels: 3 } })
    .webp({ quality: 75, effort: 6 })
    .toFile(join(outDir, "coral-echo.webp"));
  console.log(`coral: echo ${width}x${height}, ${(info.size / 1024).toFixed(1)} KB`);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await Promise.all([...(Object.keys(coralVariants) as CoralVariantName[]).map(render), renderEcho()]);
