/*
 * Hero coral sharpness (dev tooling only, never shipped). Serve out/ on
 * QA_BASE, then run `node scripts/qa/coral-sharpness.mts [label]`.
 *
 * At 1440x900 and DPR 1, 2 and 3, captures the same upper-branch crop of the
 * coral panel at four moments: the WebP fallback alone, mid-intro, 1 s after
 * the intro ends and 10 s into the idle sway. Scores each crop by the
 * variance of a 3x3 Laplacian over its luminance (higher is sharper) and
 * saves the crops to docs/qa/coral/ (gitignored).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, type Page } from "playwright";
import sharp from "sharp";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const label = process.argv[2] ?? "run";
const out = "docs/qa/coral";
const dprs = (process.env.DPRS ?? "1,2,3").split(",").map(Number);
// Isolation options: QS appends a query string (e.g. engine test flags);
// HIDE_FALLBACK=1 removes the WebP fallback outright instead of fading it.
const qs = process.env.QS ? `&${process.env.QS}` : "";

/** Variance of the Laplacian of the luminance. */
async function sharpness(png: Buffer) {
  const { data, info } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = data[i - width] + data[i + width] + data[i - 1] + data[i + 1] - 4 * data[i];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

/** An upper-branch region of the panel, in CSS px. */
async function cropBox(page: Page) {
  return page.evaluate(() => {
    const r = document.querySelector(".coral-panel")!.getBoundingClientRect();
    return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.12, width: r.width * 0.4, height: r.height * 0.22 };
  });
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const rows: string[] = [];
for (const dpr of dprs) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr });
  // Record when the engine reveals the canvas, without touching the engine.
  await context.addInitScript(() => {
    new MutationObserver(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(".coral-canvas");
      const w = window as unknown as { __coralStart?: number };
      if (canvas && canvas.style.opacity === "1" && w.__coralStart === undefined) w.__coralStart = performance.now();
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  // Fallback reference: with reduced motion the canvas never mounts, so the
  // static WebP is all that shows. Same crop, same DPR, settled for 2 s.
  const shots: [string, Buffer][] = [];
  {
    const still = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr, reducedMotion: "reduce" });
    const stillPage = await still.newPage();
    await stillPage.goto(`${base}/?sharp=${label}-${dpr}-still`, { waitUntil: "networkidle" });
    await stillPage.waitForTimeout(2000);
    shots.push(["fallback", await stillPage.screenshot({ clip: await cropBox(stillPage) })]);
    await still.close();
  }
  if (process.env.HIDE_FALLBACK)
    await page.addInitScript(() =>
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = ".coral-fallback{display:none!important}";
        document.head.append(style);
      }),
    );
  await page.goto(`${base}/?sharp=${label}-${dpr}${qs}`, { waitUntil: "load" });
  const clip = await cropBox(page);

  const at = async (moment: string, secondsAfterStart: number) => {
    await page.waitForFunction(
      (s) => {
        const w = window as unknown as { __coralStart?: number };
        return w.__coralStart !== undefined && performance.now() - w.__coralStart >= s * 1000;
      },
      secondsAfterStart,
      { timeout: 30000, polling: 16 },
    );
    shots.push([moment, await page.screenshot({ clip })]);
  };
  await at("mid-intro", 0.8); // intro runs ~1.6 s
  await at("intro+1s", 2.6);
  await at("idle+10s", 11.6);

  const scores: Record<string, number> = {};
  for (const [moment, png] of shots) {
    scores[moment] = await sharpness(png);
    await writeFile(`${out}/${label}-dpr${dpr}-${moment}.png`, png);
  }
  const state = await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>(".coral-canvas");
    const f = document.querySelector<HTMLElement>(".coral-fallback");
    return c
      ? `canvas ${c.width}x${c.height} for ${Math.round(c.clientWidth * devicePixelRatio)}x${Math.round(c.clientHeight * devicePixelRatio)} device px, fallback opacity ${getComputedStyle(f!).opacity}`
      : "no canvas";
  });
  const ref = scores.fallback;
  rows.push(
    `DPR ${dpr}: ` +
      Object.entries(scores)
        .map(([m, s]) => `${m} ${s.toFixed(0)}${ref ? ` (${((s / ref) * 100).toFixed(0)}%)` : ""}`)
        .join(" | ") +
      ` || ${state}${errors.length ? ` || errors: ${errors.join("; ")}` : ""}`,
  );
  await context.close();
}
await browser.close();
console.log(`[${label}]`);
for (const row of rows) console.log(row);
