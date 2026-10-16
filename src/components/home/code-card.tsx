import { cn } from "@/lib/utils";

type TokenKind = "keyword" | "function" | "number" | "punctuation" | "plain";

const keywords = new Set(["import", "def", "if", "return", "for", "in"]);
const functions = new Set(["coral", "grow", "scatter", "sample"]);

const tokenClass: Record<TokenKind, string> = {
  keyword: "text-coral",
  function: "text-lagoon",
  number: "text-sand",
  punctuation: "text-mist-on-ink",
  plain: "text-sand/90",
};

/** Minimal Python tokeniser: enough to colour the hero snippet at build time. */
function tokenise(line: string): { kind: TokenKind; text: string }[] {
  const tokens: { kind: TokenKind; text: string }[] = [];
  for (const match of line.matchAll(/(\s+)|([A-Za-z_]\w*)|(\d+(?:\.\d+)?)|(\S)/g)) {
    const [text, space, word, number] = match;
    let kind: TokenKind = "punctuation";
    if (space) kind = "plain";
    else if (word) kind = keywords.has(word) ? "keyword" : functions.has(word) ? "function" : "plain";
    else if (number) kind = "number";
    tokens.push({ kind, text });
  }
  return tokens;
}

/**
 * Editor-style card with real, selectable code. Each line is its own block so
 * no single text block outweighs the hero heading as the LCP element. Long
 * lines wrap with a hanging indent instead of scrolling sideways.
 */
export function CodeCard({
  code,
  filename,
  className,
}: {
  code: string;
  filename: string;
  className?: string;
}) {
  const lines = code.split("\n");
  return (
    <figure
      className={cn(
        "dark overflow-hidden rounded-2xl bg-ink-raised shadow-[0_24px_48px_-24px_oklch(0.193_0.039_263.1/0.55)] ring-1 ring-sand/12",
        className,
      )}
    >
      <figcaption className="border-b border-sand/10 px-5 py-3 font-mono text-label tracking-normal text-mist-on-ink">
        {filename}
      </figcaption>
      <pre className="px-4 py-4 font-mono text-[0.71875rem] leading-[1.7] sm:px-5 sm:text-[0.8125rem] lg:text-[0.75rem]">
        <code>
          {lines.map((line, index) => {
            const indent = line.length - line.trimStart().length;
            return (
              <span
                key={index}
                className="block whitespace-pre-wrap"
                style={{ paddingLeft: `${indent + 4}ch`, textIndent: "-4ch" }}
              >
                {line.trim().length === 0
                  ? " "
                  : tokenise(line.trimStart()).map((token, i) => (
                      <span key={i} className={tokenClass[token.kind]}>
                        {token.text}
                      </span>
                    ))}
              </span>
            );
          })}
        </code>
      </pre>
    </figure>
  );
}
