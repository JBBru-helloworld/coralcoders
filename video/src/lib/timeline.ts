/*
 * Every time in the advert comes from timeline.json (written by
 * scripts/voiceover.py from the owner's recordings). Scenes never hard-code a
 * time: they ask for a line or a spoken word and work relative to it.
 */
import data from "../timeline.json";

export type Word = { text: string; start: number; end: number };
export type Line = {
  n: number;
  file: string;
  start: number;
  end: number;
  subtitle: string;
  kinetic: string;
  words: Word[];
};

export const timeline = data as { fps: number; voiceEnd: number; durationInFrames: number; lines: Line[] };
export const FPS = timeline.fps;

export function line(n: number): Line {
  return timeline.lines[n - 1];
}

/** A spoken word of line `n`, by its subtitle text; `nth` picks a repeat. */
export function word(n: number, text: string, nth = 0): Word {
  const found = line(n).words.filter((w) => w.text.replace(/[.,:;!?]+$/, "") === text);
  if (!found[nth]) throw new Error(`No word "${text}" (#${nth}) in line ${n}`);
  return found[nth];
}

/** Seconds to the nearest frame. */
export const frames = (seconds: number) => Math.round(seconds * FPS);

/**
 * Entrances start this many frames before their word, so the word is about
 * half visible on the frame it is spoken (the ease-out is steep at the start).
 */
export const LEAD = 2;
