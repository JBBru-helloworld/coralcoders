import { JsonLd } from "@/components/json-ld";
import { ContactSection } from "@/components/home/contact-section";
import { CoursesSection } from "@/components/home/courses-section";
import { FaqSection } from "@/components/home/faq-section";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { TutorSection } from "@/components/home/tutor-section";
import { WhyCode } from "@/components/home/why-code";
import { faqSection } from "@/content/home";
import { pageMetadata } from "@/lib/metadata";
import { faqPageSchema, organizationSchema, personSchema, websiteSchema } from "@/lib/schema";
import { description, homeTitle } from "@/lib/site";

export const metadata = pageMetadata({
  title: homeTitle,
  description,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <>
      <JsonLd
        data={[organizationSchema(), websiteSchema(), personSchema(), faqPageSchema(faqSection.items)]}
      />

      <Hero />
      <WhyCode />
      <CoursesSection />
      <HowItWorks />
      <TutorSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
