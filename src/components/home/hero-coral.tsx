import { coralVariants } from "@/lib/coral";
import { cn } from "@/lib/utils";
import { CoralCanvas } from "./coral-canvas";

const { mobile, tablet, desktop } = coralVariants;
const tiles = [0, 1, 2, 3] as const;

/**
 * The particle coral in its ink panel. The settled coral is a build-time WebP
 * (scripts/build-coral.mts), shown first and kept for reduced motion; the
 * canvas animation mounts over it after load. The panel's aspect ratio is
 * fixed per breakpoint, so nothing shifts when either appears.
 *
 * The fallback is a 2x2 grid of tiles: each tile is smaller than the hero H1,
 * which keeps the H1 as the Largest Contentful Paint element.
 */
export function HeroCoral({ label, className }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={cn("coral-panel", className)}>
      <div className="coral-fallback">
        {tiles.map((tile) => (
          <picture key={tile}>
            <source
              media="(min-width: 1024px)"
              srcSet={`/coral/coral-desktop-${tile}.webp`}
              width={desktop.width}
              height={desktop.height}
            />
            <source
              media="(min-width: 768px)"
              srcSet={`/coral/coral-tablet-${tile}.webp`}
              width={tablet.width}
              height={tablet.height}
            />
            <img
              src={`/coral/coral-mobile-${tile}.webp`}
              width={mobile.width}
              height={mobile.height}
              alt=""
              decoding="async"
              fetchPriority="low"
            />
          </picture>
        ))}
      </div>
      <CoralCanvas />
    </div>
  );
}
