/*
 * The site's wordmark (src/components/site/wordmark.tsx: mark 30 px, serif
 * 26 px, 10 px gap) and its primary CTA (src/components/cta/cta-variants.ts:
 * coral pill, ink Geist Medium label, MessageCircle icon), re-created at
 * video scale from the same proportions and tokens.
 */
import { Img, spring, staticFile, useCurrentFrame } from "remotion";
import { colours, easePress, fonts } from "../lib/theme";
import { FPS, frames } from "../lib/timeline";

const MARK = { width: 603, height: 512 };

export function Wordmark({ height, colour = colours.sand }: { height: number; colour?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: height / 3 }}>
      <Img
        src={staticFile("brand/logo-mark-512.png")}
        style={{ width: (MARK.width / MARK.height) * height, height, flexShrink: 0 }}
      />
      <span
        style={{
          fontFamily: fonts.serif,
          fontSize: height * (26 / 30),
          lineHeight: 1,
          letterSpacing: "-0.01em",
          color: colour,
          whiteSpace: "nowrap",
        }}
      >
        Coral Coders
      </span>
    </div>
  );
}

/** "Book a free lesson", pressed once at `pressAt` seconds: 0.97 in 100 ms, then a damped spring back. */
export function BookButton({ pressAt, scale = 2.5 }: { pressAt: number; scale?: number }) {
  const frame = useCurrentFrame();
  const down = frames(pressAt);
  const downFrames = Math.max(1, Math.round(0.1 * FPS));
  let s = 1;
  if (frame >= down && frame < down + downFrames) {
    s = 1 - 0.03 * easePress((frame - down) / downFrames);
  } else if (frame >= down + downFrames) {
    // Damping close to critical: settles without a visible bounce.
    s = 0.97 + 0.03 * spring({ frame: frame - down - downFrames, fps: FPS, config: { damping: 24, stiffness: 180, mass: 1 } });
  }
  const icon = 18.4 * scale; // size-[1.15rem]
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8 * scale,
        height: 48 * scale,
        padding: `0 ${24 * scale}px`,
        borderRadius: 9999,
        background: colours.coral,
        color: colours.ink,
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 16 * scale,
        whiteSpace: "nowrap",
        transform: `scale(${s})`,
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
      </svg>
      Book a free lesson
    </div>
  );
}
