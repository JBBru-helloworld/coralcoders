import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { ContactSection } from "@/components/home/contact-section";
import { JsonLd } from "@/components/json-ld";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { TrustLine } from "@/components/site/trust-line";
import { coursePageHeadings, getCourseContent, lessonFormat } from "@/content/courses";
import { hero } from "@/content/home";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, courseSchema, faqPageSchema } from "@/lib/schema";
import { type Course, coursePath, courses, getCourse, pricingNote } from "@/lib/site";

export const dynamicParams = false;

type CoursePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return pageMetadata({
    title: course.metaTitle,
    description: course.metaDescription,
    path: coursePath(course),
    image: {
      path: `${coursePath(course)}og.png`,
      alt: `${course.title} lessons with Coral Coders, ${course.ageLabel.toLowerCase()}`,
    },
  });
}

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const splitGrid = "grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20";

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const content = getCourseContent(slug);
  const related = content.related.map(getCourse).filter((c): c is Course => Boolean(c));
  const isKids = course.audience === "kids";
  const lessonPoints = [
    lessonFormat.length,
    lessonFormat.times,
    lessonFormat.rescheduling,
    ...(isKids ? [lessonFormat.progress] : []),
    content.setup,
    pricingNote,
  ];

  return (
    <>
      <JsonLd
        data={[
          courseSchema(course, content),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/#courses" },
            { name: course.title, path: coursePath(course) },
          ]),
          faqPageSchema(content.faq, coursePath(course)),
        ]}
      />

      {/* 1. Breadcrumb, matching the BreadcrumbList schema. */}
      <nav aria-label="Breadcrumb" className={`${wrap} pt-8`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-mist">
          <li>
            <Link href="/" className="rounded-sm transition-colors duration-(--duration-fast) hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/#courses"
              className="rounded-sm transition-colors duration-(--duration-fast) hover:text-ink"
            >
              Courses
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {course.title}
          </li>
        </ol>
      </nav>

      {/* 2. Hero. */}
      <section
        data-hero
        aria-labelledby="course-heading"
        className={`${wrap} grid gap-8 pt-10 pb-20 md:pt-14 md:pb-28 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16`}
      >
        <div className="flex flex-col gap-7">
          <h1 id="course-heading" className="max-w-[20ch] text-h1">
            {content.h1}
          </h1>
          <p className="max-w-[58ch] text-lead text-mist">{content.intro}</p>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButton size="lg" course={course} label={hero.primaryCta} />
            <EmailButton size="lg" course={course} label={hero.secondaryCta} />
          </div>
          <TrustLine />
        </div>
        <p
          aria-hidden="true"
          className="order-first font-heading text-[clamp(4.5rem,3rem+6vw,9.5rem)] leading-[0.8] tracking-[-0.03em] text-coral-deep lg:order-none lg:pt-2 lg:text-right"
        >
          {course.marker}
        </p>
      </section>

      {/* 3. What you will learn. */}
      <section aria-labelledby="learn-heading" className="border-t border-mist-line">
        <div className={`${wrap} ${splitGrid} py-20 md:py-28`}>
          <h2 id="learn-heading" className="reveal text-h2">
            {coursePageHeadings.learn}
          </h2>
          <ul className="reveal grid gap-x-12 sm:grid-cols-2">
            {content.learn.map((item) => (
              <li key={item} className="border-t border-mist-line py-4 text-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. What learners build: the most persuasive section, given room on ink. */}
      <section aria-labelledby="build-heading" className="dark bg-background text-foreground">
        <div className={`${wrap} py-24 md:py-32`}>
          <h2 id="build-heading" className="reveal text-h1 text-sand">
            {coursePageHeadings.build[course.audience]}
          </h2>
          <ol className="mt-12 border-b border-sand/10 md:mt-16">
            {content.build.map((project, index) => (
              <li
                key={project}
                className="reveal grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-t border-sand/10 py-7 sm:grid-cols-[5rem_1fr] md:py-9"
              >
                <span aria-hidden="true" className="font-heading text-h2 leading-none text-coral">
                  {index + 1}
                </span>
                <p className="max-w-[30ch] font-heading text-h3 text-sand">{project}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5 and 6. Who it is for, and how lessons work. */}
      <section aria-label="Who it is for and how lessons work" className="bg-sand-raised">
        <div className={`${wrap} grid gap-16 py-20 md:py-28 lg:grid-cols-2 lg:gap-20`}>
          <div className="reveal flex flex-col gap-5">
            <h2 className="text-h2">{coursePageHeadings.whoFor}</h2>
            <p className="max-w-[48ch] text-lead text-mist">{content.whoFor}</p>
          </div>
          <div className="reveal flex flex-col gap-5">
            <h2 className="text-h2">{coursePageHeadings.lessons}</h2>
            <ul className="border-t border-mist-line">
              {lessonPoints.map((point) => (
                <li key={point} className="border-b border-mist-line py-4 text-mist">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Where it leads. */}
      <section aria-labelledby="next-heading" className="border-t border-mist-line">
        <div className={`${wrap} ${splitGrid} py-20 md:py-28`}>
          <h2 id="next-heading" className="reveal text-h2">
            {coursePageHeadings.next}
          </h2>
          <div className="reveal flex flex-col gap-8">
            <p className="max-w-[52ch] text-lead text-mist">{content.next}</p>
            <ul className="border-t border-mist-line">
              {related.map((item) => (
                <li key={item.slug} className="border-b border-mist-line">
                  <Link
                    href={coursePath(item)}
                    className="group flex items-center justify-between gap-6 rounded-sm py-5 transition-colors duration-(--duration-fast) hover:text-coral-deep"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-heading text-h3">{item.title} lessons</span>
                      <span className="text-small text-mist">{item.ageLabel}</span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-coral-deep transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Course FAQ. */}
      <section aria-labelledby="course-faq-heading" className="border-t border-mist-line bg-sand-raised">
        <div className={`${wrap} ${splitGrid} py-20 md:py-28`}>
          <h2 id="course-faq-heading" className="reveal text-h2">
            {coursePageHeadings.faq}
          </h2>
          <FaqAccordion items={content.faq} className="reveal" />
        </div>
      </section>

      {/* 9. Closing call to action: the homepage contact pattern, compact. */}
      <ContactSection id="book" course={course} compact />
    </>
  );
}
