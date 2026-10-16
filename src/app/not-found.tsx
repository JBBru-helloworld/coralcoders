import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { ctaVariants } from "@/components/cta/cta-variants";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page could not be found. Head back to the Coral Coders homepage or message us.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="mx-auto flex min-h-[70dvh] w-full max-w-6xl flex-col justify-center gap-6 px-5 py-24 sm:px-8"
    >
      <h1 id="not-found-heading" className="max-w-[7.36em] text-h1">
        This page has drifted off the reef
      </h1>
      <p className="max-w-[34.48em] text-lead text-mist">
        The link may be old or mistyped. Head back to the homepage, or message us
        and we will point you in the right direction.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={ctaVariants({ variant: "quiet", size: "lg" })}>
          Back to the homepage
        </Link>
        <WhatsAppButton size="lg" label="Message us" />
      </div>
    </section>
  );
}
