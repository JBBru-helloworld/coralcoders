import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { coralProgram, hero } from "@/content/home";
import { TrustLine } from "@/components/site/trust-line";
import { CodeCard } from "./code-card";
import { HeroCoral } from "./hero-coral";

export function Hero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pt-12 pb-20 sm:px-8 md:pt-16 lg:min-h-[calc(92svh-var(--nav-height))] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24">
        <div className="flex flex-col gap-7">
          <h1 id="hero-heading" className="text-display lg:max-w-[13ch]">
            {hero.heading}
          </h1>
          <p className="max-w-[52ch] text-lead text-mist">{hero.subheading}</p>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButton size="lg" label={hero.primaryCta} />
            <EmailButton size="lg" label={hero.secondaryCta} />
          </div>
          <TrustLine />
        </div>

        {/* Mobile and tablet: panel, then the code card below it. Desktop: the
            card overlaps the panel's bottom-left corner, outside its edge. */}
        <div className="relative mx-auto w-full max-w-[40rem] lg:mr-0 lg:max-w-none lg:pb-10 lg:pl-12">
          <HeroCoral label={hero.coralLabel} />
          <CodeCard
            code={coralProgram}
            filename="coral.py"
            className="relative mt-4 w-full lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:w-[min(28.75rem,100%)]"
          />
        </div>
      </div>
    </section>
  );
}
