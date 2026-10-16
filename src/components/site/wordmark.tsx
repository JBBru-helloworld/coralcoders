import { cn } from "@/lib/utils";
import { brand, siteName } from "@/lib/site";

const sizes = {
  // Mark height in px, and the matching serif wordmark size.
  sm: { mark: 30, text: "text-[1.625rem]" },
  lg: { mark: 40, text: "text-[2rem]" },
} as const;

/**
 * The coral mark beside the serif "Coral Coders" wordmark. The logo is a mark
 * only, so the visible text carries the accessible name; the image is
 * decorative (empty alt).
 */
export function Wordmark({ size = "sm", className }: { size?: keyof typeof sizes; className?: string }) {
  const { mark, text } = sizes[size];
  const width = Math.round((brand.mark.width / brand.mark.height) * mark);
  return (
    <span className={cn("inline-flex items-center gap-2.5 whitespace-nowrap", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized */}
      <img
        src={brand.mark.src}
        srcSet={brand.mark.srcSet}
        width={width}
        height={mark}
        alt=""
        decoding="async"
        className="shrink-0"
        style={{ width, height: mark }}
      />
      <span className={cn("font-heading leading-none tracking-[-0.01em]", text)}>{siteName}</span>
    </span>
  );
}
