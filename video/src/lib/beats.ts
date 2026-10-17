/*
 * Moments shared by more than one layer, all derived from the voice.
 */
import { clamp01, easeInOut } from "./theme";
import { line, word } from "./timeline";

export const beats = {
  /** The coral assembles from here, on "it" of "it grows". */
  growAt: word(3, "it").start - 0.08,
  /** Ink to sand, in the pause before line 5. */
  toSand: { from: line(5).start - 0.5, to: line(5).start - 0.05 },
  /** Sand back to ink, in the long pause before line 8. */
  toInk: { from: line(8).start - 0.95, to: line(8).start - 0.25 },
  /** The button press, just after "free". */
  press: word(8, "free").end + 0.12,
  /** The small end-card coral starts gathering just before line 9. */
  endCoralAt: line(9).start - 0.35,
};

/** 0 on ink, 1 on sand. */
export function sandAmount(t: number): number {
  const into = easeInOut(clamp01((t - beats.toSand.from) / (beats.toSand.to - beats.toSand.from)));
  const back = easeInOut(clamp01((t - beats.toInk.from) / (beats.toInk.to - beats.toInk.from)));
  return into * (1 - back);
}
