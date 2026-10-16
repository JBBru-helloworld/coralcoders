import { ArrowUpRight } from "lucide-react";
import { tutorSection } from "@/content/home";
import { tutor } from "@/lib/site";

export function TutorSection() {
  const { photo } = tutor;
  return (
    <section
      id="tutor"
      aria-labelledby="tutor-heading"
      className="scroll-mt-(--nav-height) border-t border-mist-line"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="reveal mx-auto w-full max-w-md lg:sticky lg:top-[calc(var(--nav-height)+2rem)] lg:mx-0 lg:max-w-none lg:self-start">
          <div className="overflow-hidden rounded-[1.75rem] bg-sand-sunk ring-1 ring-ink/5">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized responsive image */}
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="(min-width: 1024px) 26rem, (min-width: 640px) 28rem, calc(100vw - 2.5rem)"
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="block aspect-[3/4] h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col gap-6">
            <h2 id="tutor-heading" className="text-h1">
              {tutorSection.heading}
            </h2>
            <div className="flex flex-col gap-1">
              <p className="font-heading text-h3">{tutor.name}</p>
              <p className="text-small font-medium text-coral-deep">{tutor.role}</p>
            </div>
            <div className="flex max-w-[38.45em] flex-col gap-4 text-lead text-mist">
              {tutor.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <dl className="reveal mt-12 border-t border-mist-line">
            {tutor.credentials.map((item) => (
              <div
                key={item.label}
                className="grid gap-1 border-b border-mist-line py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-6"
              >
                <dt className="text-small font-semibold text-ink">{item.label}</dt>
                <dd className="text-small text-mist">{item.detail}</dd>
              </div>
            ))}
          </dl>

          <ul className="reveal mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {tutor.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-1 rounded-sm text-small font-medium text-link max-md:min-h-11"
                >
                  <span className="u-link">{link.label}</span>
                  <ArrowUpRight aria-hidden="true" className="nudge size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
