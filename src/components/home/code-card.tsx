import { cn } from "@/lib/utils";

type TokenKind = "keyword" | "function" | "number" | "punctuation" | "plain";

const keywords = new Set(["def", "if", "return"]);
const functions = new Set(["coral", "forward", "left", "right", "back"]);

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
 * no single text block outweighs the hero heading as the LCP element.
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
        "dark overflow-hidden rounded-2xl bg-ink shadow-[0_24px_48px_-24px_oklch(0.193_0.039_263.1/0.55)] ring-1 ring-ink/10",
        className,
      )}
    >
      <figcaption className="border-b border-sand/10 px-5 py-3 font-mono text-label tracking-normal text-mist-on-ink">
        {filename}
      </figcaption>
      <pre className="code-lines overflow-x-auto px-5 py-4 font-mono text-[0.8125rem] leading-[1.7] sm:text-[0.875rem]">
        <code>
          {lines.map((line, index) => (
            <span key={index} className="code-line block whitespace-pre">
              {line.length === 0
                ? " "
                : tokenise(line).map((token, i) => (
                    <span key={i} className={tokenClass[token.kind]}>
                      {token.text}
                    </span>
                  ))}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
