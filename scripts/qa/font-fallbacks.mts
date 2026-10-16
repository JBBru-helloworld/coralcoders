/*
 * Font fallback tuner (dev tooling only, never shipped). Serve out/ on
 * QA_BASE, then run `node scripts/qa/font-fallbacks.mts [sans] [serif]`.
 * Measures every heading, paragraph and list item on every page at 360 to
 * 1440px with the web fonts, then again with the fonts blocked and the
 * fallback size-adjust values given (default: the shipped ones), and counts
 * the elements whose height changes (a rewrap, so a layout shift on swap).
 * Ascent and descent are scaled to keep next/font's vertical metrics.
 * Narrow the scope with SCOPE="[data-hero] h1, [data-hero] p".
 */
import { chromium, type Page } from "playwright";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const scope = process.env.SCOPE ?? "main h1, main h2, main h3, main p, main li";
const sans = Number(process.argv[2] ?? 102.75);
const serif = Number(process.argv[3] ?? 83.5);
const routes = [
  "/",
  "/courses/scratch/",
  "/courses/python-for-kids/",
  "/courses/ai-machine-learning-for-teens/",
  "/courses/python-for-adults/",
  "/courses/sql/",
  "/courses/ai-and-prompt-engineering/",
  "/privacy/",
];
const widths = [360, 390, 430, 768, 1024, 1280, 1440];
const measure = (page: Page) =>
  page.evaluate(
    (sel) => [...document.querySelectorAll(sel)].map((e) => Math.round(e.getBoundingClientRect().height)),
    scope,
  );

// next/font's generated metrics for Arial and Times New Roman, at its own size-adjust.
const face = (family: string, local: string, size: number, ascent: number, descent: number, nextSize: number) =>
  `@font-face{font-family:"${family}";src:local("${local}");size-adjust:${size}%;` +
  `ascent-override:${((ascent * nextSize) / size).toFixed(2)}%;descent-override:${((descent * nextSize) / size).toFixed(2)}%;line-gap-override:0%}`;

const browser = await chromium.launch();
const web: Record<string, number[]> = {};
const webPage = await browser.newPage();
for (const route of routes) {
  await webPage.goto(base + route, { waitUntil: "networkidle" });
  await webPage.evaluate(() => document.fonts.ready);
  for (const width of widths) {
    await webPage.setViewportSize({ width, height: 900 });
    await webPage.waitForTimeout(50);
    web[route + width] = await measure(webPage);
  }
}

const page = await browser.newPage();
await page.route(/\.woff2$/, (r) => r.abort());
const rewraps: string[] = [];
for (const route of routes) {
  await page.goto(base + route, { waitUntil: "load" });
  await page.addStyleTag({
    content:
      face("QA Sans", "Arial", sans, 95.94, 28.16, 104.76) +
      face("QA Serif", "Times New Roman", serif, 117.94, 36.93, 83.94) +
      `html{--font-geist-sans:"QA Sans",sans-serif !important;--font-instrument-serif:"QA Serif",serif !important}`,
  });
  await page.waitForTimeout(100);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(30);
    (await measure(page)).forEach((h, i) => {
      const expected = web[route + width][i];
      if (Math.abs(h - expected) > 2) rewraps.push(`${route} @${width}px element ${i}: ${expected}px -> fallback ${h}px`);
    });
  }
}
await browser.close();
console.log(`sans ${sans}%, serif ${serif}%: ${rewraps.length} rewraps`);
for (const line of rewraps) console.log(`  ${line}`);
