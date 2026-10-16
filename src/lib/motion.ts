import type { Transition } from "motion/react";

/*
 * Motion presets for Motion (motion/react). These mirror the CSS tokens in
 * globals.css. Springs are critically damped by default (no overshoot);
 * bounce is reserved for interactions that carry momentum, like a flick.
 * Every preset settles in 300ms or under.
 */

export const duration = {
  instant: 0.1,
  fast: 0.16,
  base: 0.22,
  slow: 0.3,
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  press: [0.3, 0, 0.2, 1],
} as const;

/** Default UI spring: critically damped, no overshoot. */
export const spring: Transition = { type: "spring", bounce: 0, duration: 0.3 };

/** Slight bounce, only after a gesture with momentum (drag release, flick). */
export const springMomentum: Transition = {
  type: "spring",
  bounce: 0.2,
  duration: 0.3,
};

/** Standard eased fade or move for non-interactive reveals. */
export const easeOut: Transition = { duration: duration.base, ease: ease.out };
