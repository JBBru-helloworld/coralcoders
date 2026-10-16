import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { contactSection } from "@/content/home";
import { contact, mailtoLink, whatsappLink } from "@/lib/site";

const detailLink =
  "rounded-sm text-sand underline decoration-sand/25 underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-sand/70";

/** Closing call to action on a raised ink tone, so it reads apart from the footer. */
export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="dark relative scroll-mt-(--nav-height) overflow-hidden border-b border-sand/10 bg-ink-raised text-sand"
    >
      {/* The one quiet echo of the hero coral: a small static image, decorative. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, decorative */}
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

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-24 sm:px-8 md:py-32">
        <h2 id="contact-heading" className="reveal text-h1 text-sand">
          {contactSection.heading}
        </h2>
        <p className="reveal max-w-[48ch] text-lead text-mist-on-ink">{contactSection.body}</p>
        <div className="reveal flex flex-wrap gap-3">
          <WhatsAppButton size="lg" label={contactSection.primaryCta} />
          <EmailButton size="lg" label={contactSection.secondaryCta} />
        </div>
        <dl className="reveal grid gap-x-10 gap-y-3 text-small sm:grid-cols-[auto_auto] sm:justify-start">
          <div className="flex flex-col gap-0.5">
            <dt className="text-mist-on-ink">WhatsApp</dt>
            <dd>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={detailLink}>
                {contact.whatsappDisplay}
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-mist-on-ink">Email</dt>
            <dd>
              <a href={mailtoLink()} className={`${detailLink} break-all`}>
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
