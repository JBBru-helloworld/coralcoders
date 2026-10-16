"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/schema";
import { cn } from "@/lib/utils";

/**
 * Collapsed answers stay in the HTML (hiddenUntilFound), so search engines
 * read every answer and find-in-page can open them. Pages build their
 * FAQPage JSON-LD from the same items.
 */
export function FaqAccordion({ items, className }: { items: readonly FaqItem[]; className?: string }) {
  return (
    <AccordionPrimitive.Root hiddenUntilFound className={cn("border-t border-mist-line", className)}>
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.question} value={item.question} className="border-b border-mist-line">
          <AccordionPrimitive.Header className="m-0">
            <AccordionPrimitive.Trigger className="group flex w-full items-start justify-between gap-6 rounded-md py-5 text-left text-lead font-medium text-ink transition-colors duration-(--duration-fast) pointer-hover:text-coral-deep">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-mist transition-[rotate] duration-(--duration-spring) ease-spring group-aria-expanded:rotate-180"
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Panel className="faq-panel overflow-hidden">
            <p className="max-w-[39.78em] pr-10 pb-6 text-mist">{item.answer}</p>
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
