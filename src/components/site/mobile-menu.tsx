"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type Course, contact, navSections, siteName } from "@/lib/site";
import { Wordmark } from "./wordmark";
import { prefersReducedMotion, useNavState } from "./nav-state";

export function MobileMenu({ isHome, course }: { isHome: boolean; course?: Course }) {
  const { menuOpen, setMenuOpen } = useNavState();
  const router = useRouter();
  // Section to scroll to once the sheet has closed and the scroll lock is released.
  const pendingSection = useRef<string | null>(null);

  function goToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    pendingSection.current = id;
    setMenuOpen(false);
  }

  function handleOpenChangeComplete(open: boolean) {
    const id = pendingSection.current;
    if (open || !id) return;
    pendingSection.current = null;
    if (!isHome) {
      router.push(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    history.pushState(null, "", `#${id}`);
  }

  return (
    <Sheet
      open={menuOpen}
      onOpenChange={setMenuOpen}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      <SheetTrigger
        aria-label="Open menu"
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-(--duration-fast) hover:bg-ink/[0.05] lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 bg-sand p-0 data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:sm:max-w-md"
      >
        <div className="flex h-(--nav-height) items-center justify-between px-5">
          <SheetTitle aria-label={siteName} className="font-normal text-ink">
            <Wordmark />
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <SheetClose
            aria-label="Close menu"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-(--duration-fast) hover:bg-ink/[0.05]"
          >
            <X className="size-5" aria-hidden="true" />
          </SheetClose>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pt-6">
          <ul className="flex flex-col">
            {navSections.map((section) => (
              <li key={section.id}>
                <a
                  href={isHome ? `#${section.id}` : `/#${section.id}`}
                  onClick={(event) => goToSection(event, section.id)}
                  className="block rounded-md py-2.5 font-heading text-h2 text-ink transition-colors duration-(--duration-fast) hover:text-coral-deep"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-mist-line px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <WhatsAppButton size="lg" course={course} className="w-full" />
          <EmailButton
            size="lg"
            course={course}
            className="w-full"
            label={`Email ${contact.email}`}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
