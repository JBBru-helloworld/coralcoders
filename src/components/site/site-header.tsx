"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { cn } from "@/lib/utils";
import { courseForPath, navSections } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";
import { Wordmark } from "./wordmark";
import { useActiveSection, useScrolledPast } from "./use-scroll-state";

const sectionIds = navSections.map((section) => section.id);

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const course = courseForPath(pathname);
  const scrolled = useScrolledPast(24);
  const active = useActiveSection(sectionIds, isHome);
  const listRef = useRef<HTMLUListElement>(null);
  const indicator = useNavIndicator(listRef, active);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="-mx-1 rounded-md px-1 text-ink">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul ref={listRef} className="relative flex items-center gap-1">
            {navSections.map((section) => {
              const isActive = active === section.id;
              return (
                <li key={section.id}>
                  <Link
                    href={isHome ? `#${section.id}` : `/#${section.id}`}
                    aria-current={isActive ? "true" : undefined}
                    data-section={section.id}
                    className={cn(
                      "group/link relative block rounded-md px-3 py-2 text-small whitespace-nowrap transition-colors duration-(--duration-fast) ease-out",
                      isActive ? "text-ink" : "text-mist pointer-hover:text-ink",
                    )}
                  >
                    <span className={isActive ? undefined : "u-link"}>{section.label}</span>
                  </Link>
                </li>
              );
            })}
            <li aria-hidden="true" className="contents">
              <span
                className="nav-indicator"
                data-visible={indicator.visible}
                data-instant={indicator.instant}
                style={indicator.style}
              />
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton size="sm" course={course} className="hidden md:inline-flex" />
          <MobileMenu isHome={isHome} course={course} />
        </div>
      </div>
    </header>
  );
}

/**
 * Positions the single active-section line under the active link's text. It
 * slides (clip-path, spring) between links; appearing from nothing it fades
 * in at its place instead of sliding in from the edge.
 */
function useNavIndicator(listRef: React.RefObject<HTMLUListElement | null>, active: string | null) {
  const previous = useRef<string | null>(null);
  const [state, setState] = useState({ left: 0, right: 0, visible: false, instant: true });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = (instant: boolean) => {
      const text = active ? list.querySelector(`[data-section="${active}"] > span`) : null;
      if (!text) {
        setState((s) => ({ ...s, visible: false }));
        return;
      }
      const listRect = list.getBoundingClientRect();
      const rect = text.getBoundingClientRect();
      setState({
        left: rect.left - listRect.left,
        right: listRect.right - rect.right,
        visible: true,
        instant,
      });
    };
    measure(previous.current === null);
    previous.current = active;
    const observer = new ResizeObserver(() => measure(true));
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, active]);

  return {
    visible: state.visible,
    instant: state.instant,
    style: {
      "--nav-indicator-left": `${state.left}px`,
      "--nav-indicator-right": `${state.right}px`,
    } as React.CSSProperties,
  };
}
