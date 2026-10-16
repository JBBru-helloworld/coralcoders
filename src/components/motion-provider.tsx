"use client";

import { MotionConfig } from "motion/react";

/** Makes every Motion animation honour prefers-reduced-motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
