"use client";

import { useEffect, useRef } from "react";

/**
 * Mounts the animated coral canvas into its parent panel once the page has
 * loaded and the browser is idle. The engine is a separate chunk loaded with
 * a dynamic import. With reduced motion, nothing mounts and the static image
 * stays.
 */
export function CoralCanvas() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panel = anchor.current?.parentElement;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let stop: (() => void) | undefined;
    let idle = 0;

    const start = () => {
      const run = () =>
        import("./coral-engine").then(({ startCoral }) => {
          if (!cancelled) stop = startCoral(panel, panel.querySelector<HTMLElement>(".coral-fallback"));
        });
      idle =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(run, { timeout: 1500 })
          : window.setTimeout(run, 200);
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      stop?.();
    };
  }, []);

  return <span ref={anchor} hidden />;
}
