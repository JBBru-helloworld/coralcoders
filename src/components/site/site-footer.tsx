import Link from "next/link";
import { FooterContactLinks } from "./footer-contact-links";
import { Wordmark } from "./wordmark";
import {
  contact,
  coursePath,
  courses,
  footerDescription,
  lessonLanguageNote,
  navSections,
  pricingNote,
  privacyPath,
  siteName,
} from "@/lib/site";

// Phones get 44px-tall rows (tap targets); the hover underline sits on the
// inner text span (u-link) so it stays under the words.
const linkClass =
  "group/link inline-flex items-center rounded-sm text-mist-on-ink transition-colors duration-(--duration-fast) ease-out max-md:min-h-11 max-md:min-w-11 pointer-hover:text-sand";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer dark">
      <div className="mx-auto w-full max-w-6xl px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
          <div className="flex max-w-xs flex-col gap-4">
            <Link href="/" className="-mx-1 self-start rounded-md px-1 text-sand">
              <Wordmark size="lg" />
            </Link>
            <p className="text-small text-mist-on-ink">{footerDescription}</p>
          </div>

          <nav aria-label="Footer" className="contents">
            <FooterColumn title="Explore">
              {navSections.map((section) => (
                <li key={section.id}>
                  <Link href={`/#${section.id}`} className={linkClass}>
                    <span className="u-link">{section.label}</span>
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Courses">
              {courses.map((course) => (
                <li key={course.slug}>
                  <Link href={coursePath(course)} className={linkClass}>
                    <span className="u-link">{course.title}</span>
                  </Link>
                </li>
              ))}
            </FooterColumn>
          </nav>

          <FooterColumn title="Contact">
            <FooterContactLinks linkClass={linkClass} />
            <li>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <span className="sr-only">Instagram </span>
                <span className="u-link">{contact.instagramHandle}</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-16 flex flex-col gap-1.5 border-t border-sand/10 pt-8 text-small text-mist-on-ink">
          <p>{pricingNote}</p>
          <p>{lessonLanguageNote}</p>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-label tracking-normal text-mist-on-ink/80 sm:flex-row sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-4">
            <span>
              © {year} {siteName}.
            </span>
            <Link href={privacyPath} className={linkClass}>
              <span className="u-link">Privacy notice</span>
            </Link>
          </p>
          <p>
            Some UI components by{" "}
            <a
              href="https://skiper-ui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline decoration-sand/25 underline-offset-[3px] transition-colors duration-(--duration-fast) pointer-hover:text-sand pointer-hover:decoration-sand/60"
            >
              Skiper UI
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-sans text-small font-medium text-sand">{title}</h2>
      <ul className="flex flex-col text-small md:gap-2.5">{children}</ul>
    </div>
  );
}
