import { growCoral } from "@/lib/coral";
import { cn } from "@/lib/utils";

const coral = growCoral();

/** Stroke width in viewBox units, tapering from trunk to tips. */
function strokeWidth(level: number) {
  return Math.max(1.4, 7.5 * Math.pow(0.74, level));
}

/** Coral at the trunk fading to coral-deep at the tips. */
function strokeColour(level: number) {
  const towardsTip = Math.round((level / (coral.levels - 1)) * 100);
  return `color-mix(in oklch, var(--coral-deep) ${towardsTip}%, var(--coral))`;
}

/**
 * Static SVG rendered at build time. The draw-in is pure CSS (see
 * `.coral-segment` in globals.css): each depth level starts after the one
 * before it, trunk first. Reduced motion shows the finished drawing.
 */
export function HeroCoral({ label, className }: { label: string; className?: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={coral.viewBox}
      className={cn("coral-drawing overflow-visible", className)}
      fill="none"
      strokeLinecap="round"
    >
      {coral.segments.map((segment, index) => (
        <path
          key={index}
          className="coral-segment"
          d={`M${segment.x1} ${segment.y1}L${segment.x2} ${segment.y2}`}
          pathLength={1}
          stroke={strokeColour(segment.level)}
          strokeWidth={strokeWidth(segment.level)}
          style={{ "--level": segment.level } as React.CSSProperties}
        />
      ))}
      {coral.tips.map((tip, index) => (
        <circle
          key={index}
          className="coral-tip"
          cx={tip.x}
          cy={tip.y}
          r={1.9}
          fill="var(--coral-deep)"
        />
      ))}
    </svg>
  );
}
