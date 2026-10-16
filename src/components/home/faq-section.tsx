"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { faqSection } from "@/content/home";

/**
 * Collapsed answers stay in the HTML (hiddenUntilFound), so search engines
 * read every answer and find-in-page can open them. The FAQPage JSON-LD is
 * built from the same faqSection data.
 */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-(--nav-height) border-t border-mist-line bg-sand-raised"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <h2 id="faq-heading" className="reveal max-w-[12ch] text-h1">
          {faqSection.heading}
        </h2>

        <AccordionPrimitive.Root hiddenUntilFound className="reveal border-t border-mist-line">
          {faqSection.items.map((item) => (
            <AccordionPrimitive.Item
              key={item.question}
              value={item.question}
              className="border-b border-mist-line"
            >
              <AccordionPrimitive.Header className="m-0">
                <AccordionPrimitive.Trigger className="group flex w-full items-start justify-between gap-6 rounded-md py-5 text-left text-lead font-medium text-ink transition-colors duration-(--duration-fast) hover:text-coral-deep">
                  {item.question}
                  <ChevronDown
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-mist transition-transform duration-(--duration-base) ease-out group-aria-expanded:rotate-180"
                  />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Panel className="faq-panel overflow-hidden">
                <p className="max-w-[60ch] pr-10 pb-6 text-mist">{item.answer}</p>
              </AccordionPrimitive.Panel>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  );
}
