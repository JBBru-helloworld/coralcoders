/*
 * JSON-LD validator against the schema.org vocabulary (dev tooling only).
 * Run `node scripts/qa/schema.mts` after a build. Checks that every @type is
 * a schema.org class and every property exists and applies to its type (or a
 * parent type). The vocabulary is cached in docs/qa/ (gitignored).
 */
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";

const vocabFile = "docs/qa/schemaorg-current-https.jsonld";
if (!existsSync(vocabFile)) {
  await mkdir("docs/qa", { recursive: true });
  const res = await fetch("https://schema.org/version/latest/schemaorg-current-https.jsonld");
  await writeFile(vocabFile, await res.text());
}
type VocabNode = { "@id": string; "@type": string | string[]; [k: string]: unknown };
const graph = (JSON.parse(readFileSync(vocabFile, "utf8"))["@graph"] as VocabNode[]);
const id = (v: unknown) => (typeof v === "object" && v ? (v as { "@id": string })["@id"] : String(v)).replace("schema:", "");
const list = (v: unknown) => (Array.isArray(v) ? v : v === undefined ? [] : [v]).map(id);

const parents = new Map<string, string[]>();
const domains = new Map<string, string[]>();
for (const node of graph) {
  const types = list(node["@type"]);
  const name = id(node["@id"]);
  if (types.includes("rdfs:Class")) parents.set(name, list(node["rdfs:subClassOf"]));
  if (types.includes("rdf:Property")) domains.set(name, list(node["schema:domainIncludes"]));
}
const ancestors = (type: string, seen = new Set<string>()): Set<string> => {
  if (seen.has(type)) return seen;
  seen.add(type);
  for (const p of parents.get(type) ?? []) ancestors(p, seen);
  return seen;
};

const pages = [
  "index.html",
  "courses/scratch/index.html",
  "courses/python-for-kids/index.html",
  "courses/ai-machine-learning-for-teens/index.html",
  "courses/python-for-adults/index.html",
  "courses/sql/index.html",
  "courses/ai-and-prompt-engineering/index.html",
  "privacy/index.html",
];
let problems = 0;
for (const page of pages) {
  const html = readFileSync(`out/${page}`, "utf8");
  const found: string[] = [];
  const issues: string[] = [];
  const check = (node: unknown, where: string) => {
    if (Array.isArray(node)) return node.forEach((n, i) => check(n, `${where}[${i}]`));
    if (typeof node !== "object" || node === null) return;
    const obj = node as Record<string, unknown>;
    const types = obj["@type"] ? list(obj["@type"]) : [];
    for (const t of types) if (!parents.has(t)) issues.push(`${where}: unknown type ${t}`);
    if (types.length) found.push(types.join("+"));
    const lineage = new Set(types.flatMap((t) => [...ancestors(t)]));
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("@")) {
        if (key === "@graph") check(value, `${where}.@graph`);
        continue;
      }
      if (!domains.has(key)) issues.push(`${where}: unknown property ${key}`);
      else if (types.length && !domains.get(key)!.some((d) => lineage.has(d)))
        issues.push(`${where}: ${key} does not apply to ${types.join("+")}`);
      check(value, `${where}.${key}`);
    }
  };
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) check(JSON.parse(json), "ld");
  problems += issues.length;
  console.log(page, `types: ${[...new Set(found)].join(", ") || "(none)"}`, issues.length ? `\n  ${issues.join("\n  ")}` : "OK");
}
process.exitCode = problems ? 1 : 0;
