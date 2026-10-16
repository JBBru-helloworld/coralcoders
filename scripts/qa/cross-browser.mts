/*
 * Cross-browser QA (dev tooling only, never shipped). Serve the static
 * export first, for example `python3 -m http.server 4173 -d out`, then run
 * `node scripts/qa/cross-browser.mts`. Screenshots and a JSON report go to
 * docs/qa/ (gitignored).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, firefox, webkit, type BrowserType, type Page } from "playwright";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const out = "docs/qa/cross-browser";
const pages = ["/", "/courses/scratch/"];
const widths = [390, 1440];
const engines: Record<string, BrowserType> = { webkit, firefox, chromium };
const only = process.argv[2];

/** Scroll the whole page so lazy images load and scroll-linked states settle at the end. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 300));
  });
}

async function checks(page: Page, path: string, width: number) {
  return page.evaluate(
    async ({ path, width }) => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const op = (el: Element | null) => (el ? Number(getComputedStyle(el).opacity) : null);
      const result: Record<string, unknown> = {
        scrollTimeline: CSS.supports("animation-timeline: view()"),
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
      await document.fonts.ready;
      result.fonts = [...document.fonts]
        .filter((f) => f.status === "loaded")
        .map((f) => `${f.family.replace(/['"]/g, "")} ${f.weight}`)
        .filter((v, i, a) => a.indexOf(v) === i);

      // Content parked mid-animation would show up here as low opacity.
      const minOpacity = (sel: string) => {
        const els = [...document.querySelectorAll(sel)];
        return els.length ? Math.min(...els.map((e) => op(e) ?? 1)) : null;
      };
      result.revealMinOpacity = minOpacity(".reveal");

      if (path === "/") {
        // Scroll each scroll-linked block into reading position, then read it.
        const statement = document.querySelector(".statement");
        statement?.scrollIntoView({ block: "start" });
        await sleep(400);
        result.statementWordsMinOpacity = minOpacity(".statement-word");
        const steps = document.querySelector(".steps");
        steps?.scrollIntoView({ block: "start" });
        await sleep(400);
        result.stepNumbersMinOpacity = minOpacity(".step-number");
        result.stepLines = [...document.querySelectorAll(".steps > li:not(:last-child)")].map(
          (li) => getComputedStyle(li, "::after").transform,
        );

        const canvas = document.querySelector("canvas");
        const tiles = [...document.querySelectorAll<HTMLImageElement>("[data-hero] img")];
        result.coral = {
          canvas: Boolean(canvas),
          fallbackTiles: tiles.length,
          fallbackLoaded: tiles.filter((i) => i.complete && i.naturalWidth > 0).length,
        };

        // Course tabs: switch to adults and check the panel and the pill.
        const tabs = document.querySelectorAll<HTMLElement>('[role="tab"]');
        tabs[1]?.click();
        await sleep(500);
        const panel = [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')].find(
          (p) => !p.hidden,
        );
        const fill = document.querySelector(".tab-indicator-fill")?.getBoundingClientRect();
        const active = tabs[1]?.getBoundingClientRect();
        result.tabs = {
          selected: tabs[1]?.getAttribute("aria-selected"),
          panel: panel?.getAttribute("aria-labelledby") ? panel.textContent?.slice(0, 40) : null,
          panelOpacity: op(panel ?? null),
          pillMatchesTab:
            fill && active ? Math.abs(fill.left - active.left) < 2 && Math.abs(fill.right - active.right) < 2 : null,
        };
      }

      // FAQ: open the first item.
      const trigger = document.querySelector<HTMLElement>(".faq-panel")?.parentElement?.querySelector("button");
      trigger?.click();
      await sleep(500);
      const faqPanel = document.querySelector<HTMLElement>(".faq-panel");
      result.faq = {
        expanded: trigger?.getAttribute("aria-expanded"),
        height: Math.round(faqPanel?.getBoundingClientRect().height ?? 0),
        answerOpacity: op(faqPanel?.querySelector("p") ?? null),
      };

      // Contact links are well formed.
      const hrefs = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map((a) => a.href);
      result.links = {
        whatsapp: hrefs.filter((h) => h.includes("wa.me")).every((h) => /^https:\/\/wa\.me\/\d+\?text=/.test(h)),
        tel: hrefs.filter((h) => h.startsWith("tel:")).every((h) => /^tel:\+\d+$/.test(h)),
        telCount: hrefs.filter((h) => h.startsWith("tel:")).length,
        mailto: hrefs.filter((h) => h.startsWith("mailto:")).every((h) => /^mailto:[^@\s]+@[^@\s]+\?subject=/.test(h)),
      };

      if (width < 768) {
        const bar = [...document.querySelectorAll<HTMLElement>("body > *")].find(
          (el) => getComputedStyle(el).position === "fixed" && el.textContent?.includes("Email"),
        );
        result.ctaBar = bar
          ? { paddingBottom: getComputedStyle(bar).paddingBottom, bottom: getComputedStyle(bar).bottom }
          : null;
      }
      return result;
    },
    { path, width },
  );
}

async function mobileMenu(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(600);
  const dialog = page.getByRole("dialog");
  const open = await dialog.isVisible();
  const links = await dialog.getByRole("link").count();
  const screenshot = await page.screenshot();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const closed = !(await dialog.isVisible().catch(() => false));
  const focus = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  return { result: { open, links, closedOnEscape: closed, focusReturnedTo: focus }, screenshot };
}

await mkdir(out, { recursive: true });
const report: Record<string, unknown> = {};
for (const [name, type] of Object.entries(engines)) {
  if (only && only !== name) continue;
  const browser = await type.launch();
  for (const width of widths) {
    const mobile = width < 768;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 900 },
      deviceScaleFactor: mobile ? 2 : 1,
      // Firefox has no mobile emulation; touch is enough there.
      ...(mobile && name !== "firefox" ? { isMobile: true } : {}),
      hasTouch: mobile,
    });
    for (const path of pages) {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.goto(base + path, { waitUntil: "networkidle" });
      await scrollThrough(page);
      const slug = `${name}-${width}-${path === "/" ? "home" : "scratch"}`;
      await page.screenshot({ path: `${out}/${slug}.png`, fullPage: true });
      const entry: Record<string, unknown> = await checks(page, path, width);
      if (mobile && path === "/") {
        const menu = await mobileMenu(page);
        entry.menu = menu.result;
        await writeFile(`${out}/${slug}-menu.png`, menu.screenshot);
      }
      entry.errors = errors;
      report[slug] = entry;
      console.log(slug, JSON.stringify(entry));
      await page.close();
    }
    await context.close();
  }
  await browser.close();
}
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
