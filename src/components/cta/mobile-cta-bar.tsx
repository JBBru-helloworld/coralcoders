"use client";

import { usePathname } from "next/navigation";
import { useNavState } from "@/components/site/nav-state";
import { usePastHero } from "@/components/site/use-scroll-state";
import { cn } from "@/lib/utils";
import { EmailButton } from "./email-button";
import { WhatsAppButton } from "./whatsapp-button";

/**
 * Slim contact bar fixed to the bottom on mobile. Appears once the hero has
 * scrolled away and hides while the mobile menu is open. The body reserves
 * matching bottom padding on mobile so the footer is never covered.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const pastHero = usePastHero(pathname);
  const { menuOpen } = useNavState();
  const visible = pastHero && !menuOpen;

  return (
    <div
      data-visible={visible}
      inert={!visible}
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-mist-line bg-sand px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden",
        "transition-[translate,opacity] duration-(--duration-base) ease-out",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-md gap-2">
        <WhatsAppButton size="md" className="flex-1" />
        <EmailButton size="md" label="Email" />
      </div>
    </div>
  );
}
