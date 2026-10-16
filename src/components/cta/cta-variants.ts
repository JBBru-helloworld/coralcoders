import { cva, type VariantProps } from "class-variance-authority";

/*
 * Shared look for contact actions. Primary is coral with an ink label
 * (white on coral fails contrast). Quiet is an outlined pill that adapts to
 * ink sections through the scoped `dark:` variant.
 *
 * Motion: pressing scales to 0.97 at once (100ms) and releasing springs back
 * (--ease-spring). Hover cues only for fine pointers; touch gets the press.
 */
export const ctaVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,scale,filter] duration-(--duration-spring) ease-spring active:scale-[0.97] active:duration-(--duration-instant) active:ease-press [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // A gentle brightness lift on pointer-hover: no glow, no shine.
        primary: "bg-coral text-ink pointer-hover:brightness-[1.06]",
        quiet:
          "border border-ink/15 text-ink pointer-hover:border-ink/30 pointer-hover:bg-ink/[0.04] dark:border-sand/20 dark:text-sand dark:pointer-hover:border-sand/40 dark:pointer-hover:bg-sand/[0.06]",
      },
      size: {
        sm: "h-9 px-4 text-small [&_svg]:size-4",
        md: "h-11 px-5 text-[0.9375rem] [&_svg]:size-[1.05rem]",
        lg: "h-12 px-6 text-base [&_svg]:size-[1.15rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type CtaVariantProps = VariantProps<typeof ctaVariants>;
