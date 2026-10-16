/*
 * Cold-load lab metrics (dev tooling only, never shipped). Serve out/ on
 * QA_BASE, then run `node scripts/qa/perf.mts [runs] [route...]`.
 * Every run uses a fresh browser context (empty cache) with Lighthouse's
 * mobile throttling applied through CDP: 150 ms RTT, 1.6 Mbps down,
 * 750 Kbps up, 4x CPU. Prints the median FCP, LCP, CLS and TBT per route.
 */
import { chromium } from "playwright";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const runs = Number(process.argv[2] ?? 5);
const routes = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/courses/scratch/"];
const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const browser = await chromium.launch();
for (const route of routes) {
  const samples: { fcp: number; lcp: number; cls: number; tbt: number }[] = [];
  for (let i = 0; i < runs; i++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(`${base}${route}?run=${i}`, { waitUntil: "load" });
    await page.waitForTimeout(4000);
    samples.push(
      await page.evaluate(() => {
        const take = (type: string) => {
          const po = new PerformanceObserver(() => {});
          po.observe({ type, buffered: true });
          const entries = po.takeRecords();
          po.disconnect();
          return entries as (PerformanceEntry & { value?: number })[];
        };
        const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
        const lcp = take("largest-contentful-paint").at(-1)?.startTime ?? 0;
        // No input happens during these runs, so every shift counts. (Playwright's
        // mobile emulation marks shifts as hadRecentInput, which would hide them.)
        const cls = take("layout-shift").reduce((s, e) => s + (e.value ?? 0), 0);
        const tbt = take("longtask").filter((t) => t.startTime > fcp).reduce((s, t) => s + Math.max(0, t.duration - 50), 0);
        return { fcp, lcp, cls, tbt };
      }),
    );
    await context.close();
  }
  console.log(
    route,
    JSON.stringify({
      fcp: Math.round(median(samples.map((s) => s.fcp))),
      lcp: Math.round(median(samples.map((s) => s.lcp))),
      cls: Math.max(...samples.map((s) => s.cls)).toFixed(3),
      tbt: Math.round(median(samples.map((s) => s.tbt))),
      lcpRuns: samples.map((s) => Math.round(s.lcp)),
    }),
  );
}
await browser.close();
