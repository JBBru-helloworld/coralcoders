/*
 * Content and SEO proofread of the static export (dev tooling only, never
 * shipped). Reads out/ directly: `node scripts/qa/proofread.mts`.
 * Scans every page's text (including collapsed FAQ answers and hidden tab
 * panels), metadata and JSON-LD, and checks internal links resolve.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const out = "out";
const pages = [
  "index.html",
  "courses/scratch/index.html",
  "courses/python-for-kids/index.html",
  "courses/ai-machine-learning-for-teens/index.html",
  "courses/python-for-adults/index.html",
  "courses/sql/index.html",
  "courses/ai-and-prompt-engineering/index.html",
  "privacy/index.html",
  "404.html",
];

// US spellings (and UK forms the brief rules out), as whole words.
const usSpellings = [
  "color", "colors", "colored", "colorful", "center", "centers", "centered", "favorite", "favorites", "behavior",
  "behaviors", "organize", "organized", "organization", "organizations", "recognize", "recognized", "realize",
  "realized", "specialize", "specializing", "specialized", "customize", "customized", "optimize", "optimized",
  "analyze", "analyzed", "analyzing", "summarize", "prioritize", "personalize", "personalized", "memorize",
  "practicing", "enroll", "enrollment", "catalog", "math", "mom", "moms", "gray", "traveling", "modeling",
  "labeled", "canceled", "license", "defense", "fulfill", "skeptical", "aging", "judgment", "program's",
  "programs", "programmes", "theater", "meter", "liter", "jewelry", "cozy", "toward", "learned",
];

const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
const attr = (html: string, re: RegExp) => html.match(re)?.[1] ?? null;

const titles = new Map<string, string>();
const descriptions = new Map<string, string>();
const report: Record<string, unknown> = {};
for (const page of pages) {
  const html = readFileSync(path.join(out, page), "utf8");
  const body = text(html.replace(/^[\s\S]*?<body[^>]*>/, ""));
  const issues: string[] = [];

  if (/—/.test(body)) issues.push(`em dash: ${body.match(/.{0,30}—.{0,30}/)?.[0]}`);
  const words = body.toLowerCase().match(/[a-z']+/g) ?? [];
  const us = [...new Set(words.filter((w) => usSpellings.includes(w)))];
  if (us.length) issues.push(`US spelling: ${us.join(", ")}`);
  const doubled = body.match(/\b(\w+)\s+\1\b/gi)?.filter((m) => !/^(\d+)\s+\1$/.test(m));
  if (doubled?.length) issues.push(`repeated word: ${doubled.join(", ")}`);
  const brand = body.match(/coral\s*coders?|coralcoderz?/gi)?.filter((m) => m !== "Coral Coders" && m.toLowerCase() !== "coralcoderz");
  if (brand?.length) issues.push(`brand spelling: ${[...new Set(brand)].join(", ")}`);
  // Visible double spaces inside text nodes (HTML collapses them, but they signal copy slips).
  const rawText = html.replace(/<script[\s\S]*?<\/script>/g, "").match(/>[^<]*\S {2,}\S[^<]*</g);
  if (rawText?.length) issues.push(`double space: ${rawText.slice(0, 3).join(" | ")}`);

  const title = attr(html, /<title>([^<]*)<\/title>/);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const ogImage = attr(html, /<meta property="og:image" content="([^"]*)"/);
  const ogTitle = attr(html, /<meta property="og:title" content="([^"]*)"/);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  for (const [label, value, map] of [["title", title, titles], ["description", description, descriptions]] as const) {
    if (!value) issues.push(`missing ${label}`);
    else if (map.has(value)) issues.push(`duplicate ${label} with ${map.get(value)}`);
    else map.set(value, page);
  }
  for (const t of [title, description, ogTitle]) if (t && /—/.test(t)) issues.push(`em dash in metadata: ${t}`);
  if (page !== "404.html" && !canonical) issues.push("missing canonical");
  if (ogImage) {
    const file = path.join(out, new URL(ogImage).pathname);
    if (!existsSync(file)) issues.push(`og:image file missing: ${file}`);
  } else issues.push("missing og:image");

  // JSON-LD: parse every block and check the essentials of each type.
  const schema: string[] = [];
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(json);
      const nodes = (Array.isArray(data) ? data : data["@graph"] ?? [data]).flatMap((n: Record<string, unknown>) =>
        Array.isArray(n["@graph"]) ? (n["@graph"] as Record<string, unknown>[]) : [n],
      );
      for (const node of nodes) {
        const type = String(node["@type"]);
        schema.push(type);
        const need: Record<string, string[]> = {
          Organization: ["name", "url"],
          EducationalOrganization: ["name", "url"],
          LocalBusiness: ["name", "url"],
          WebSite: ["name", "url"],
          WebPage: ["name", "url"],
          Person: ["name"],
          Course: ["name", "description", "provider"],
          FAQPage: ["mainEntity"],
          BreadcrumbList: ["itemListElement"],
        };
        for (const key of need[type] ?? []) if (node[key] === undefined) issues.push(`${type} missing ${key}`);
        if (type === "Course" && !node.hasCourseInstance) issues.push("Course missing hasCourseInstance (Google rich result)");
        if (type === "Course" && !node.offers) issues.push("Course missing offers (Google rich result)");
        if (type === "FAQPage") {
          const items = node.mainEntity as { name?: string; acceptedAnswer?: { text?: string } }[];
          for (const q of items) {
            if (!q.name || !q.acceptedAnswer?.text) issues.push("FAQ item missing name or answer");
            else if (!body.includes(q.acceptedAnswer.text.slice(0, 40))) issues.push(`FAQ answer not visible on page: ${q.name}`);
          }
        }
        const s = JSON.stringify(node);
        if (/—/.test(s)) issues.push(`em dash in ${type} JSON-LD`);
        for (const url of s.match(/https?:\/\/[^"]+/g) ?? []) {
          if (url.startsWith("https://coralcoders.com")) {
            const p = new URL(url).pathname;
            const local = path.join(out, p.endsWith("/") ? `${p}index.html` : p);
            if (!existsSync(local) && !p.includes("#")) issues.push(`JSON-LD URL not in build: ${url}`);
          }
        }
      }
    } catch (error) {
      issues.push(`invalid JSON-LD: ${(error as Error).message}`);
    }
  }

  // Internal links resolve to a built file.
  const internal = [...new Set([...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]))].filter((h) => !h.startsWith("/_next"));
  for (const href of internal) {
    const local = path.join(out, href.endsWith("/") ? `${href}index.html` : href);
    if (!existsSync(local)) issues.push(`broken internal link: ${href}`);
  }
  const external = [...new Set([...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&")))].filter(
    (h) => !h.startsWith("https://coralcoders.com"),
  );

  report[page] = { title, description, canonical, ogUrl, ogImage, robots, schema, issues, external };
}
console.log(JSON.stringify(report, null, 1));
