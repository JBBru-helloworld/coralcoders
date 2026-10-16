"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adultCoursesHash, coursesSection } from "@/content/home";
import { prefersReducedMotion } from "@/components/site/nav-state";
import { type Audience, type Course, coursePath, courses } from "@/lib/site";

const groups: Audience[] = ["kids", "adults"];

/**
 * Both panels stay in the HTML (keepMounted), so every course is visible to
 * search engines; switching only hides one. The `#adult-courses` hash selects
 * adults and scrolls to the section. No element carries that id, so the
 * browser's own anchor jump never competes with ours.
 */
export function CoursesSection() {
  const [group, setGroup] = useState<Audience>("kids");

  useEffect(() => {
    const hash = `#${adultCoursesHash}`;
    function showAdults() {
      setGroup("adults");
      requestAnimationFrame(() =>
        document.getElementById("courses")?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        }),
      );
    }
    // Clicks on any `#adult-courses` link, including repeat clicks when the
    // hash is already set (which fire no hashchange).
    function onClick(event: MouseEvent) {
      const link = (event.target as Element).closest?.(`a[href="${hash}"]`);
      if (!link) return;
      event.preventDefault();
      if (window.location.hash !== hash) history.pushState(null, "", hash);
      showAdults();
    }
    function onHashChange() {
      if (window.location.hash === hash) showAdults();
    }
    onHashChange();
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <section
      id="courses"
      aria-labelledby="courses-heading"
      className="scroll-mt-(--nav-height)"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <div className="reveal flex max-w-xl flex-col gap-5">
          <h2 id="courses-heading" className="text-h1">
            {coursesSection.heading}
          </h2>
          <p className="text-lead text-mist">{coursesSection.intro}</p>
        </div>

        <Tabs
          value={group}
          onValueChange={(value) => setGroup(value as Audience)}
          className="mt-12 gap-0 md:mt-16"
        >
          <TabsList
            activateOnFocus
            aria-label="Course groups"
            className="h-auto rounded-full border border-mist-line bg-sand-raised p-1 group-data-horizontal/tabs:h-auto"
          >
            {groups.map((audience) => (
              <TabsTrigger
                key={audience}
                value={audience}
                className="h-10 rounded-full px-5 text-small text-mist transition-colors duration-(--duration-fast) ease-out hover:not-data-active:text-ink data-active:bg-ink data-active:text-sand data-active:shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {coursesSection.groups[audience].label}
              </TabsTrigger>
            ))}
          </TabsList>

          {groups.map((audience) => (
            <TabsContent
              key={audience}
              value={audience}
              keepMounted
              className="mt-8 text-base data-hidden:hidden"
            >
              <ul className="border-t border-mist-line">
                {courses
                  .filter((course) => course.audience === audience)
                  .map((course) => (
                    <CourseRow key={course.slug} course={course} />
                  ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

function CourseRow({ course }: { course: Course }) {
  return (
    <li className="grid gap-x-10 gap-y-4 border-b border-mist-line py-10 md:grid-cols-[9rem_1fr_auto] md:items-start md:py-12">
      <p
        aria-hidden="true"
        className="font-heading text-[clamp(3.5rem,2.6rem+3.5vw,5.5rem)] leading-[0.85] tracking-[-0.02em] text-coral-deep"
      >
        {course.marker}
      </p>
      <div className="flex max-w-[58ch] flex-col gap-3">
        <h3 className="text-h3">
          {course.shortTitle}
          <span className="sr-only">{`, ${course.ageLabel.toLowerCase()}`}</span>
        </h3>
        <p className="text-mist">{course.shortDescription}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:flex-col md:items-end md:pt-1">
        <WhatsAppButton
          variant="quiet"
          size="sm"
          course={course}
          label={coursesSection.book}
        />
        <Link
          href={coursePath(course)}
          className="group inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-link underline decoration-current/30 underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-current"
        >
          {coursesSection.learnMore}
          <span className="sr-only"> about {course.title} lessons</span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </li>
  );
}
