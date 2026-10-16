import Link from "next/link";
import {
  contact,
  coursePath,
  courses,
  footerDescription,
  lessonLanguageNote,
  mailtoLink,
  navSections,
  pricingNote,
  siteName,
  whatsappLink,
} from "@/lib/site";

const linkClass =
  "rounded-sm text-mist-on-ink transition-colors duration-(--duration-fast) ease-out hover:text-sand";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark">
      <div className="mx-auto w-full max-w-6xl px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] md:gap-10">
          <div className="flex max-w-xs flex-col gap-4">
            <Link
              href="/"
              className="-mx-1 self-start rounded-md px-1 font-heading text-[2rem] leading-none tracking-[-0.01em] text-sand"
            >
              {siteName}
            </Link>
            <p className="text-small text-mist-on-ink">{footerDescription}</p>
          </div>

          <nav aria-label="Footer" className="contents">
            <FooterColumn title="Explore">
              {navSections.map((section) => (
                <li key={section.id}>
                  <Link href={`/#${section.id}`} className={linkClass}>
                    {section.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Courses">
              {courses.map((course) => (
                <li key={course.slug}>
                  <Link href={coursePath(course)} className={linkClass}>
                    {course.title}
                  </Link>
                </li>
              ))}
            </FooterColumn>
          </nav>

          <FooterColumn title="Contact">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <span className="sr-only">WhatsApp </span>
                {contact.whatsappDisplay}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={mailtoLink()} className={`${linkClass} break-all`}>
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <span className="sr-only">Instagram </span>
                {contact.instagramHandle}
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
          <p>
            © {year} {siteName}.
          </p>
          <p>
            Some UI components by{" "}
            <a
              href="https://skiper-ui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline decoration-sand/25 underline-offset-[3px] transition-colors duration-(--duration-fast) hover:text-sand hover:decoration-sand/60"
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
      <ul className="flex flex-col gap-2.5 text-small">{children}</ul>
    </div>
  );
}
