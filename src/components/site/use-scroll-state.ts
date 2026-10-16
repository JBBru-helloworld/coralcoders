"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { SectionId } from "@/lib/site";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * The homepage section crossing the upper-middle of the viewport, or null
 * when none is (for example while the hero is in view).
 */
export function useActiveSection(ids: readonly SectionId[], enabled: boolean) {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids, enabled]);

  return enabled ? active : null;
}

/** True when the element marked `data-hero` has scrolled out of view. */
export function usePastHero(pathname: string): boolean {
  // Keyed by pathname so a stale value from the previous page never shows.
  const [state, setState] = useState({ pathname, pastHero: false });

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setState({
        pathname,
        pastHero: !entry.isIntersecting && entry.boundingClientRect.top < 0,
      }),
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  return state.pathname === pathname && state.pastHero;
}

/** True while the element with this id is at least partly on screen. */
export function useElementInView(id: string, pathname: string): boolean {
  const [state, setState] = useState({ pathname, inView: false });

  useEffect(() => {
    const element = document.getElementById(id);
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setState({ pathname, inView: entry.isIntersecting }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [id, pathname]);

  return state.pathname === pathname && state.inView;
}
