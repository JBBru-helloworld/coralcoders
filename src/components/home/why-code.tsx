import { ArrowRight } from "lucide-react";
import { adultCoursesHash, whyCode } from "@/content/home";

export function WhyCode() {
  return (
    <section
      id="why-code"
      aria-labelledby="why-code-heading"
      className="dark scroll-mt-(--nav-height) bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <div className="reveal grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-12">
          <h2 id="why-code-heading" className="text-h3 text-mist-on-ink md:pt-3">
            {whyCode.heading}
          </h2>
          <p className="max-w-[22ch] font-heading text-h1 text-sand">{whyCode.statement}</p>
        </div>

        <ol className="mt-16 grid gap-x-16 gap-y-12 md:mt-24 md:grid-cols-2">
          {whyCode.points.map((point, index) => (
            <li key={point.title} className="reveal grid grid-cols-[2.5rem_1fr] gap-x-4">
              <span
                aria-hidden="true"
                className="font-heading text-h3 leading-none text-coral"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-2.5">
                <h3 className="font-sans text-lead font-medium text-sand">{point.title}</h3>
                <p className="max-w-[54ch] text-mist-on-ink">{point.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="reveal mt-16 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-sand/10 pt-8 text-lead text-mist-on-ink md:mt-24">
          {whyCode.adultsPrompt}{" "}
          <a
            href={`#${adultCoursesHash}`}
            className="group inline-flex items-center gap-1.5 rounded-sm font-medium text-coral underline decoration-coral/40 underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-coral"
          >
            {whyCode.adultsLink}
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5"
            />
          </a>
        </p>
      </div>
    </section>
  );
}
