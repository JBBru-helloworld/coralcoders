/*
 * Accessibility audit (dev tooling only, never shipped). Serve out/ on
 * QA_BASE first, then run `node scripts/qa/a11y.mts [chromium|webkit|firefox]`.
 * Runs axe plus structural checks on every route and writes
 * docs/qa/a11y/report.json (gitignored).
 */
import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox, webkit, type Page } from "playwright";

const base = process.env.QA_BASE ?? "http://localhost:4173";
const out = "docs/qa/a11y";
const routes = [
  "/",
  "/courses/scratch/",
  "/courses/python-for-kids/",
  "/courses/ai-machine-learning-for-teens/",
  "/courses/python-for-adults/",
  "/courses/sql/",
  "/courses/ai-and-prompt-engineering/",
  "/privacy/",
  "/404.html",
];
const engine = { chromium, webkit, firefox }[process.argv[2] ?? "chromium"] ?? chromium;

/** Headings, landmarks, images, new-tab links, lang and title. */
function structure(page: Page) {
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && !el.closest("[hidden]");
    };
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible);
    const levels = headings.map((h) => Number(h.tagName[1]));
    const skips = levels
      .map((l, i) => (i > 0 && l > levels[i - 1] + 1 ? `${headings[i - 1].tagName}->${headings[i].tagName} "${headings[i].textContent?.trim()}"` : null))
      .filter(Boolean);
    const navs = [...document.querySelectorAll("nav")];
    const newTab = [...document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')];
    const images = [...document.querySelectorAll("img")];
    return {
      lang: document.documentElement.lang,
      title: document.title,
      h1: headings.filter((h) => h.tagName === "H1").map((h) => h.textContent?.trim()),
      headingSkips: skips,
      landmarks: {
        header: document.querySelectorAll("body > header, body header.site-header, [role=banner]").length,
        main: document.querySelectorAll("main").length,
        footer: document.querySelectorAll("footer").length,
        navs: navs.map((n) => n.getAttribute("aria-label") ?? "(unlabelled)"),
      },
      imagesMissingAlt: images.filter((i) => !i.hasAttribute("alt")).map((i) => i.src),
      images: images.map((i) => `${i.alt === "" ? "(decorative)" : i.alt.slice(0, 50)} <- ${i.src.split("/").pop()}`),
      newTabWithoutNotice: newTab
        .filter((a) => !/new tab/i.test(a.textContent ?? "") && !/new tab/i.test(a.getAttribute("aria-label") ?? ""))
        .map((a) => a.href),
    };
  });
}

/** Tab through the page: every stop must show a focus indicator. */
async function keyboard(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  const stops: string[] = [];
  const noRing: string[] = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const ring =
        (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) ||
        (s.boxShadow !== "none" && s.boxShadow !== "") ||
        el.matches(":focus-visible") === false;
      const label = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
      return { key: `${el.tagName.toLowerCase()}:${label}`, ring };
    });
    if (!info) continue;
    if (stops.includes(info.key) && stops.indexOf(info.key) === 0) break;
    if (!stops.includes(info.key)) stops.push(info.key);
    if (!info.ring) noRing.push(info.key);
  }
  return { stops: stops.length, noRing };
}

/** Interactive elements under 44 by 44 CSS px at phone width (inline text links listed separately). */
function tapTargets(page: Page) {
  return page.evaluate(() => {
    const small: string[] = [];
    const inline: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("a[href], button, [role=tab]")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || el.closest("[hidden], [inert], [aria-hidden=true]")) continue;
      if (el.classList.contains("sr-only") || getComputedStyle(el).position === "absolute" && r.width <= 1) continue;
      if (r.width >= 44 && r.height >= 44) continue;
      const label = `${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40)} (${Math.round(r.width)}x${Math.round(r.height)})`;
      const inText = getComputedStyle(el).display === "inline" && el.parentElement?.tagName === "P";
      (inText ? inline : small).push(label);
    }
    return { small: [...new Set(small)], inlineTextLinks: [...new Set(inline)] };
  });
}

function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

await mkdir(out, { recursive: true });
const browser = await engine.launch();
const report: Record<string, unknown> = {};
for (const route of routes) {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await desktopContext.newPage();
  await desktop.goto(base + route, { waitUntil: "networkidle" });
  const axe = await new AxeBuilder({ page: desktop }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  const entry: Record<string, unknown> = {
    axeViolations: axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(" | ")}`),
    axeIncomplete: axe.incomplete.map((v) => `${v.id}: ${v.nodes.length}`),
    ...(await structure(desktop)),
    keyboard: await keyboard(desktop),
  };

  // 200% browser zoom at 1440 px wide is a 720 px CSS viewport.
  await desktop.setViewportSize({ width: 720, height: 450 });
  await desktop.waitForTimeout(200);
  entry.zoom200Overflow = await overflow(desktop);
  // Text-only zoom: raise the browser's default font size to 200%, as the
  // browser setting does (rem-based breakpoints follow it). Chromium only.
  await desktop.setViewportSize({ width: 1440, height: 900 });
  if (engine === chromium) {
    const cdp = await desktopContext.newCDPSession(desktop);
    await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
    await desktop.reload({ waitUntil: "networkidle" });
    entry.textZoom200Overflow = await overflow(desktop);
  }
  await desktop.screenshot({ path: `${out}/textzoom${route.replace(/\W+/g, "-")}.png`, fullPage: false });
  await desktopContext.close();

  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const phone = await phoneContext.newPage();
  await phone.goto(base + route, { waitUntil: "networkidle" });
  entry.tapTargets = await tapTargets(phone);
  const phoneAxe = await new AxeBuilder({ page: phone }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  entry.axePhoneViolations = phoneAxe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(" | ")}`);
  await phoneContext.close();

  report[route] = entry;
  console.log(route, JSON.stringify(entry, null, 1));
}
await browser.close();
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
