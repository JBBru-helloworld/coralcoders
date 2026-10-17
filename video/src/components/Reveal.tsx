import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { clamp01, easeInOut, easeOut } from "../lib/theme";
import { FPS, LEAD, frames } from "../lib/timeline";

type Props = {
  /** Second the element lands on (a spoken word's start). */
  at: number;
  /** Entrance length in seconds. */
  dur?: number;
  /** Rise in px. */
  rise?: number;
  /** Starting blur in px (blur-to-sharp); 0 for a plain fade. */
  blur?: number;
  /** Second by which it has faded out (omit to stay). */
  out?: number;
  outDur?: number;
  inline?: boolean;
  style?: CSSProperties;
  children: ReactNode;
};

/** Entrance progress 0 to 1 for something landing at `at` seconds. */
export function useEntrance(at: number, dur = 0.55): number {
  const frame = useCurrentFrame();
  return easeOut(clamp01((frame - (frames(at) - LEAD)) / (dur * FPS)));
}

/** Exit progress 0 to 1 for something gone by `out` seconds. */
export function useExit(out: number | undefined, outDur = 0.35): number {
  const frame = useCurrentFrame();
  if (out === undefined) return 0;
  return easeInOut(clamp01((frame - frames(out - outDur)) / (outDur * FPS)));
}

/** A short rise with a fade and optional blur-to-sharp: the advert's one entrance. */
export function Reveal({ at, dur = 0.55, rise = 18, blur = 0, out, outDur, inline = true, style, children }: Props) {
  const p = useEntrance(at, dur);
  const q = useExit(out, outDur);
  return (
    <span
      style={{
        display: inline ? "inline-block" : "block",
        opacity: p * (1 - q),
        transform: `translateY(${(1 - p) * rise}px)`,
        filter: blur ? `blur(${(1 - p) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
