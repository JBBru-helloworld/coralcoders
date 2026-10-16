/*
 * Responsive sweep (dev tooling only, never shipped). Serve out/ on QA_BASE,
 * then run `node scripts/qa/responsive.mts`. Full-page screenshots and a JSON
 * report go to docs/qa/responsive/ (gitignored).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const out = "docs/qa/responsive";
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
const viewports = [
  ...[360, 390, 430, 768, 1024, 1280, 1440].map((width) => ({ width, height: width < 768 ? 844 : 900 })),
  { width: 844, height: 390 },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report: Record<string, unknown> = {};
for (const viewport of viewports) {
  const mobile = viewport.width < 768 || viewport.height < 500;
  // Reduced motion: full-page captures show every block in its final state
  // (scroll-linked reveals would otherwise be captured mid-way).
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile, reducedMotion: "reduce" });
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: "networkidle" });
    // Scroll through so lazy images load and scroll-linked states settle.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 300));
    });
    const result = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !el.closest("[hidden], .sr-only, [aria-hidden=true]");
      };
      // Text that runs past its box or the viewport.
      const overflowing = [...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,li,a,button,dd,dt,span")]
        .filter(visible)
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const clipped = getComputedStyle(el).overflowX !== "visible" && el.scrollWidth > el.clientWidth + 1;
          return r.right > W + 1 || r.left < -1 || clipped;
        })
        .map((el) => `${el.tagName} "${el.textContent?.trim().slice(0, 40)}"`);
      // Headings whose last line holds a single word.
      const orphans = [...document.querySelectorAll<HTMLElement>("h1,h2,h3")]
        .filter(visible)
        .filter((h) => {
          const words = h.textContent?.trim().split(/\s+/) ?? [];
          if (words.length < 3) return false;
          const range = document.createRange();
          range.selectNodeContents(h);
          const lines = [...new Set([...range.getClientRects()].map((r) => Math.round(r.top)))];
          if (lines.length < 2) return false;
          const last = Math.max(...lines);
          const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
          let lastLineText = "";
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if ((n.parentElement as HTMLElement).closest(".sr-only")) continue;
            const text = n.textContent ?? "";
            for (let i = 0; i < text.length; i++) {
              const r = document.createRange();
              r.setStart(n, i);
              r.setEnd(n, i + 1);
              const rect = r.getClientRects()[0];
              if (rect && Math.abs(Math.round(rect.top) - last) < 4) lastLineText += text[i];
            }
          }
          return lastLineText.trim().split(/\s+/).length === 1;
        })
        .map((h) => `${h.tagName} "${h.textContent?.trim().slice(0, 50)}"`);
      const h1 = document.querySelector("h1");
      const hero = document.querySelector("[data-hero]");
      const coral = hero?.querySelector("canvas, img[src*=coral]")?.getBoundingClientRect();
      const codeCard = document.querySelector(".code-card, [data-code-card]")?.getBoundingClientRect();
      return {
        overflowX: document.documentElement.scrollWidth - W,
        overflowing,
        orphans,
        h1FontPx: h1 ? Math.round(parseFloat(getComputedStyle(h1).fontSize)) : null,
        coral: coral ? `${Math.round(coral.width)}x${Math.round(coral.height)}` : null,
        codeCard: codeCard ? `${Math.round(codeCard.left)}..${Math.round(codeCard.right)}` : null,
      };
    });
    const slug = `${viewport.width}x${viewport.height}${route === "/" ? "-home" : route.replace(/\/courses\/|\//g, "-").replace(/-+$/, "")}`;
    await page.screenshot({ path: `${out}/${slug}.png`, fullPage: true });
    report[slug] = result;
    const flags = result.overflowX || result.overflowing.length || result.orphans.length;
    console.log(flags ? "FLAG" : "ok  ", slug, JSON.stringify(result));
    await page.close();
  }
  await context.close();
}
await browser.close();
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
