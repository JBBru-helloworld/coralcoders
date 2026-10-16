import { privacy } from "@/content/privacy";
import { pageMetadata } from "@/lib/metadata";
import { contact, privacyPath } from "@/lib/site";

export const metadata = pageMetadata({
  title: privacy.title,
  description: privacy.metaDescription,
  path: privacyPath,
});

// Static export: the build date is the date the notice was last published.
const lastUpdated = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function PrivacyPage() {
  return (
    <article
      aria-labelledby="privacy-heading"
      className="mx-auto w-full max-w-6xl px-5 pt-16 pb-24 sm:px-8 md:pt-24 md:pb-32"
    >
      <header className="flex flex-col gap-4">
        <h1 id="privacy-heading" className="text-h1">
          {privacy.title}
        </h1>
        <p className="text-small text-mist">
          <em>Last updated: {lastUpdated}</em>
        </p>
      </header>

      <div className="mt-12 flex max-w-[41.11em] flex-col gap-10 md:mt-16">
        {privacy.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-h3">{section.heading}</h2>
            <p className="text-mist">
              {section.body}
              {"withEmail" in section && (
                <>
                  {" "}
                  Email{" "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-sm text-link underline decoration-current/30 underline-offset-4 transition-colors duration-(--duration-fast) pointer-hover:decoration-current"
                  >
                    {contact.email}
                  </a>
                  .
                </>
              )}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
