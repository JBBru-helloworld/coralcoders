"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { cn } from "@/lib/utils";
import { navSections, siteName } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";
import { useActiveSection, useScrolledPast } from "./use-scroll-state";

const sectionIds = navSections.map((section) => section.id);

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrolled = useScrolledPast(24);
  const active = useActiveSection(sectionIds, isHome);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="-mx-1 rounded-md px-1 font-heading text-[1.625rem] leading-none tracking-[-0.01em] text-ink"
        >
          {siteName}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navSections.map((section) => {
              const isActive = active === section.id;
              return (
                <li key={section.id}>
                  <Link
                    href={isHome ? `#${section.id}` : `/#${section.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "nav-link relative block rounded-md px-3 py-2 text-small transition-colors duration-(--duration-fast) ease-out",
                      isActive ? "text-ink" : "text-mist hover:text-ink",
                    )}
                  >
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton size="sm" className="hidden md:inline-flex" />
          <MobileMenu isHome={isHome} />
        </div>
      </div>
    </header>
  );
}
