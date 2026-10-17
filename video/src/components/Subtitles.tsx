/*
 * Subtitles in the lower safe area: Geist Medium, sand on ink and ink on sand,
 * no box. Each word brightens from 55% to 100% with a 4 px rise as it is
 * spoken. Words the big type already shows are never repeated here: the
 * caption carries the rest of the sentence, and the big type completes it.
 */
import { useCurrentFrame } from "remotion";
import { sandAmount } from "../lib/beats";
import { type Layout, clamp01, colours, easeOut, fonts, mix } from "../lib/theme";
import { FPS, timeline } from "../lib/timeline";

/**
 * Which of each line's spoken words (by index, end exclusive) the caption
 * shows; null when the big type carries the whole line.
 */
const CAPTION: Record<number, [number, number] | null> = {
  1: [0, 3], // "Every big idea" | big: "starts small."
  2: [0, 2], // "Whether that's" | big: "A loop. A sprite. One line of code."
  3: [0, 2], // "But then," | big: "it grows."
  4: [2, 7], // big: "Coral Coders" | "Live 1:1 coding lessons, online."
  5: null, // big: the ages and course names
  6: [0, 6], // "And for adults, we even have" | big: "Python. SQL. AI."
  7: null, // big: the whole line
  8: null,
  9: null,
};

export function Subtitles({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shown = timeline.lines
    .filter((l) => CAPTION[l.n])
    .map((l) => {
      const [from, to] = CAPTION[l.n]!;
      const words = l.words.slice(from, to);
      return { words, start: words[0].start, end: words[words.length - 1].end };
    });
  const current = shown.find((c) => t >= c.start - 0.2 && t < c.end + 0.4);
  if (!current) return null;

  const fadeIn = clamp01((t - (current.start - 0.2)) / 0.2);
  const fadeOut = clamp01((current.end + 0.4 - t) / 0.25);
  const colour = mix(colours.sand, colours.ink, sandAmount(t));

  return (
    <div
      style={{
        position: "absolute",
        left: layout.side,
        right: layout.side,
        bottom: layout.height - layout.subtitleBottom,
        textAlign: "center",
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 46,
        lineHeight: 1.3,
        letterSpacing: "-0.005em",
        color: colour,
        opacity: Math.min(fadeIn, fadeOut),
        textWrap: "balance",
      }}
    >
      {current.words.map((w, i) => {
        // Brightens over 4 frames, starting a frame before the word.
        const p = easeOut(clamp01((frame - (Math.round(w.start * FPS) - 1)) / 4));
        return (
          <span key={i}>
            <span style={{ display: "inline-block", opacity: 0.55 + 0.45 * p, transform: `translateY(${4 * (1 - p)}px)` }}>
              {w.text}
            </span>
            {i < current.words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
}
