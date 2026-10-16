import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { contactSection } from "@/content/home";
import {
  type Course,
  contact,
  emailSubjectFor,
  mailtoLink,
  whatsappLink,
  whatsappMessageFor,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const detailLink =
  "rounded-sm text-sand underline decoration-sand/25 underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-sand/70";

type ContactSectionProps = {
  /** "contact" on the homepage (the mobile CTA bar hides while it is in view). */
  id?: string;
  /** On course pages: the course-specific WhatsApp message and email subject. */
  course?: Course;
  /** Tighter spacing, no coral echo: the course page closing section. */
  compact?: boolean;
};

/** Closing call to action on a raised ink tone, so it reads apart from the footer. */
export function ContactSection({ id = "contact", course, compact = false }: ContactSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="dark relative scroll-mt-(--nav-height) overflow-hidden border-b border-sand/10 bg-ink-raised text-sand"
    >
      {/* The one quiet echo of the hero coral: a small static image, decorative. */}
      {!compact && (
        // eslint-disable-next-line @next/next/no-img-element -- static export, decorative
        <img
          src="/coral/coral-echo.webp"
          width={360}
          height={270}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="contact-echo pointer-events-none absolute right-[4%] bottom-0 hidden w-[26rem] max-w-[40%] md:block"
        />
      )}

      <div
        className={cn(
          "relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 sm:px-8",
          compact ? "py-20 md:py-24" : "py-24 md:py-32",
        )}
      >
        <h2 id={headingId} className={cn("reveal text-sand", compact ? "text-h2" : "text-h1")}>
          {contactSection.heading}
        </h2>
        <p className="reveal max-w-[48ch] text-lead text-mist-on-ink">{contactSection.body}</p>
        <div className="reveal flex flex-wrap gap-3">
          <WhatsAppButton size="lg" course={course} label={contactSection.primaryCta} />
          <EmailButton size="lg" course={course} label={contactSection.secondaryCta} />
        </div>
        <dl className="reveal grid gap-x-10 gap-y-3 text-small sm:grid-cols-[auto_auto] sm:justify-start">
          <div className="flex flex-col gap-0.5">
            <dt className="text-mist-on-ink">WhatsApp</dt>
            <dd>
              <a
                href={whatsappLink(whatsappMessageFor(course))}
                target="_blank" rel="noopener noreferrer" className={detailLink}>
                {contact.whatsappDisplay}
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-mist-on-ink">Email</dt>
            <dd>
              <a href={mailtoLink(emailSubjectFor(course))} className={`${detailLink} break-all`}>
                {contact.email}
              </a>
            </dd>
          </div>
        </dl>
        <p className="reveal text-small text-mist-on-ink">{contactSection.details}</p>
      </div>
    </section>
  );
}
