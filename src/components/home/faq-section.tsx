import { FaqAccordion } from "@/components/site/faq-accordion";
import { faqSection } from "@/content/home";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-(--nav-height) border-t border-mist-line bg-sand-raised"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <h2 id="faq-heading" className="max-w-[12ch] text-h1">
          {faqSection.heading}
        </h2>
        <FaqAccordion items={faqSection.items} className="reveal" />
      </div>
    </section>
  );
}
