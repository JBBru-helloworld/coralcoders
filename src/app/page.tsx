import Link from "next/link";
import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { JsonLd } from "@/components/json-ld";
import { SectionShell } from "@/components/site/section-shell";
import { pageMetadata } from "@/lib/metadata";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import {
  coursePath,
  courses,
  description,
  homeTitle,
  pricingNote,
  tagline,
} from "@/lib/site";

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

      {/* Hero: placeholder layout until Phase 3. */}
      <section
        data-hero
        aria-labelledby="hero-heading"
        className="mx-auto flex min-h-[calc(88svh-var(--nav-height))] w-full max-w-6xl flex-col justify-center gap-7 px-5 py-20 sm:px-8"
      >
        <h1 id="hero-heading" className="max-w-[14ch] text-display">
          {tagline}
        </h1>
        <p className="max-w-[56ch] text-lead text-mist">{description}</p>
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton size="lg" />
          <EmailButton size="lg" />
        </div>
      </section>

      <SectionShell id="why-code" title="Why code" note={placeholder} />

      <SectionShell id="courses" title="Courses" note={placeholder}>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.slug}>
              <Link
                href={coursePath(course)}
                className="rounded-sm text-link underline decoration-current/30 underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-current"
              >
                {course.title}
              </Link>{" "}
              <span className="text-small text-mist">{course.ageLabel}</span>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell id="how-it-works" title="How it works" note={placeholder} />

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
