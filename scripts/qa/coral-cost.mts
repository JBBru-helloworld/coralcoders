/*
 * Hero coral idle cost (dev tooling only, never shipped). Serve out/ on
 * QA_BASE, then run `node scripts/qa/coral-cost.mts`. With 4x CPU throttling,
 * times every requestAnimationFrame callback during the idle current (from
 * 4 s after the canvas starts), checks the coral still moves, and checks the
 * loop stops when the panel is scrolled off-screen.
 */
import { chromium } from "playwright";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const cases = [
  { name: "phone 390 DPR3", viewport: { width: 390, height: 844 }, dpr: 3, mobile: true },
  { name: "desktop 1440 DPR2", viewport: { width: 1440, height: 900 }, dpr: 2, mobile: false },
];
const browser = await chromium.launch();
for (const c of cases) {
  const context = await browser.newContext({ viewport: c.viewport, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile });
  await context.addInitScript(() => {
    const w = window as unknown as { __raf: number[]; __rafCount: number };
    w.__raf = [];
    w.__rafCount = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) =>
      raf((t) => {
        const t0 = performance.now();
        cb(t);
        w.__rafCount++;
        if (document.querySelector<HTMLCanvasElement>(".coral-canvas")?.style.opacity === "1") w.__raf.push(performance.now() - t0);
      });
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(`${base}/?cost=1`, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>(".coral-canvas")?.style.opacity === "1", null, { timeout: 30000 });
  await page.waitForTimeout(4000); // past the intro and most of the fade-in
  await page.evaluate(() => ((window as unknown as { __raf: number[] }).__raf = []));
  const frameA = await page.locator(".coral-panel").screenshot();
  await page.waitForTimeout(5000);
  const frameB = await page.locator(".coral-panel").screenshot();
  const times = await page.evaluate(() => (window as unknown as { __raf: number[] }).__raf.slice().sort((a, b) => a - b));
  const pct = (q: number) => times[Math.min(times.length - 1, Math.floor(q * times.length))].toFixed(2);
  const backing = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".coral-canvas")!;
    return `${canvas.width}x${canvas.height}`;
  });
  // Off-screen: scroll the hero away and count callbacks for 2 s.
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
  const state = await page.evaluate(() => document.querySelector<HTMLCanvasElement>(".coral-canvas")!.dataset.state);
  await page.waitForTimeout(2000);
  const after = await page.evaluate(() => (window as unknown as { __rafCount: number }).__rafCount);
  console.log(
    c.name.padEnd(18),
    `backing ${backing}, ${times.length} callbacks in 5 s, median ${pct(0.5)} ms, p95 ${pct(0.95)} ms, max ${pct(1)} ms,`,
    `moving: ${Buffer.compare(frameA, frameB) !== 0},`,
    `off-screen: state ${state}, ${after - before} callbacks in 2 s`,
    errors.length ? `errors: ${errors.join("; ")}` : "no errors",
  );
  await context.close();
}
await browser.close();
