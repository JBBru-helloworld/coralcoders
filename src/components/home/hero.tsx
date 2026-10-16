import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { coralProgram, hero } from "@/content/home";
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
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small text-mist">
            {hero.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-lagoon-deep" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual relative mx-auto w-full max-w-md lg:max-w-none">
          <HeroCoral
            label={hero.coralLabel}
            className="relative ml-auto block h-auto w-[82%] sm:w-[72%] lg:w-[88%]"
          />
          <CodeCard
            code={coralProgram}
            filename="coral.py"
            className="relative -mt-[38%] mr-auto w-full max-w-[22rem] sm:-mt-[30%] lg:-mt-[34%]"
          />
        </div>
      </div>
    </section>
  );
}
