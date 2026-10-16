import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EmailButton } from "@/components/cta/email-button";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, courseSchema } from "@/lib/schema";
import {
  courseDescription,
  coursePath,
  courses,
  getCourse,
  pricingNote,
} from "@/lib/site";

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
    description: courseDescription(course),
    path: coursePath(course),
    image: {
      path: `${coursePath(course)}og.png`,
      alt: `${course.title} lessons with Coral Coders, ${course.ageLabel.toLowerCase()}`,
    },
  });
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <>
      <JsonLd
        data={[
          courseSchema(course),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/#courses" },
            { name: course.title, path: coursePath(course) },
          ]),
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 pt-8 sm:px-8">
        <Link
          href="/#courses"
          className="-mx-1 inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-small text-mist transition-colors duration-(--duration-fast) hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all courses
        </Link>
      </div>

      {/* Hero: placeholder layout until Phase 3. */}
      <section
        data-hero
        aria-labelledby="course-heading"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-14 pb-20 sm:px-8 md:pt-20 md:pb-28"
      >
        <div className="flex flex-col gap-4">
          <h1 id="course-heading" className="max-w-[18ch] text-h1">
            {course.title}
          </h1>
          <p className="text-small font-medium text-coral-deep">{course.ageLabel}</p>
        </div>
        <p className="max-w-[56ch] text-lead text-mist">{courseDescription(course)}</p>
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton size="lg" course={course} />
          <EmailButton size="lg" course={course} />
        </div>
      </section>

      <section
        aria-label="Course details"
        className="mx-auto min-h-[60vh] w-full max-w-6xl border-t border-mist-line px-5 py-20 sm:px-8"
      >
        <p className="max-w-[60ch] text-muted-foreground">
          Placeholder. The course outline, lesson format and outcomes arrive in a later
          phase.
        </p>
        <p className="mt-6 max-w-[60ch] text-small text-mist">{pricingNote}</p>
      </section>
    </>
  );
}
