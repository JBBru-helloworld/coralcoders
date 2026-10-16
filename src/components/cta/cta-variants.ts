import { cva, type VariantProps } from "class-variance-authority";

/*
 * Shared look for contact actions. Primary is coral with an ink label
 * (white on coral fails contrast). Quiet is an outlined pill that adapts to
 * ink sections through the scoped `dark:` variant.
 */
export const ctaVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out active:scale-[0.97] active:duration-(--duration-instant) [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-coral text-ink hover:bg-[color-mix(in_oklch,var(--coral),var(--ink)_10%)]",
        quiet:
          "border border-ink/15 text-ink hover:border-ink/30 hover:bg-ink/[0.04] dark:border-sand/20 dark:text-sand dark:hover:border-sand/40 dark:hover:bg-sand/[0.06]",
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
