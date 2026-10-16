import { JsonLd } from "@/components/json-ld";
import { CoursesSection } from "@/components/home/courses-section";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyCode } from "@/components/home/why-code";
import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { SectionShell } from "@/components/site/section-shell";
import { pageMetadata } from "@/lib/metadata";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { description, homeTitle, pricingNote } from "@/lib/site";

export const metadata = pageMetadata({
  title: homeTitle,
  description,
  path: "/",
  absoluteTitle: true,
});

const placeholder = "Placeholder. Copy for this section arrives in a later phase.";

export default function Home() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      <Hero />
      <WhyCode />
      <CoursesSection />
      <HowItWorks />

      {/* Phase 4 sections. */}
      <SectionShell id="tutor" title="Your tutor" note={placeholder} tone="ink" />

      <SectionShell id="faq" title="Questions and answers" note={placeholder} />

      <SectionShell
        id="contact"
        title="Book a free lesson"
        note={pricingNote}
        className="border-t border-mist-line"
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton size="lg" />
          <EmailButton size="lg" />
        </div>
      </SectionShell>
    </>
  );
}
