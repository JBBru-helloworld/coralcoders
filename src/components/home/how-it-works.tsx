import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { hero, howItWorks } from "@/content/home";
import { pricingNote } from "@/lib/site";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-(--nav-height) border-t border-mist-line bg-sand-raised"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <h2 id="how-it-works-heading" className="text-h1">
          {howItWorks.heading}
        </h2>

        {/* A thin line joins the steps: horizontal on desktop, vertical on mobile. */}
        <ol className="steps mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-10">
          {howItWorks.steps.map((step, index) => (
            <li
              key={step.title}
              className="relative flex gap-6 md:flex-col md:gap-8"
              style={{ "--step": index } as React.CSSProperties}
            >
              <span
                aria-hidden="true"
                className="step-number relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border border-mist-line bg-sand-raised font-heading text-[2rem] leading-none text-coral-deep"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-2.5 pt-2 md:pt-0">
                <h3 className="font-sans text-lead font-medium">{step.title}</h3>
                <p className="max-w-[40ch] text-mist">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-col gap-8 border-t border-mist-line pt-10 md:mt-24 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[52ch] flex-col gap-2 text-mist">
            <p>{pricingNote}</p>
            <p>{howItWorks.requirements}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButton size="lg" label={hero.primaryCta} />
            <EmailButton size="lg" label={hero.secondaryCta} />
          </div>
        </div>
      </div>
    </section>
  );
}
