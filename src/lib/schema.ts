/*
 * schema.org builders. Entities use stable `@id`s so they link together
 * across pages: the organisation is defined once on the homepage and
 * referenced by id everywhere else. No street address: the business is online.
 */
import {
  type Course,
  type Tutor,
  absoluteUrl,
  areaServed,
  contact,
  countryNames,
  coursePath,
  courses,
  description,
  locale,
  siteName,
  siteUrl,
  tutor,
} from "./site";

export type JsonLdNode = { "@type": string; [key: string]: unknown };

type Ref = { "@id": string };

export const ids = {
  organization: `${siteUrl}/#organization`,
  website: `${siteUrl}/#website`,
  founder: `${siteUrl}/#founder`,
  course: (course: Course) => `${absoluteUrl(coursePath(course))}#course`,
} as const;

const ref = (id: string): Ref => ({ "@id": id });

export function organizationSchema(): JsonLdNode {
  return {
    "@type": "EducationalOrganization",
    "@id": ids.organization,
    name: siteName,
    url: absoluteUrl("/"),
    description,
    email: contact.email,
    telephone: contact.whatsappE164,
    sameAs: [contact.instagramUrl],
    areaServed: areaServed.map((code) => ({
      "@type": "Country",
      name: countryNames[code],
    })),
    knowsLanguage: "en",
    // Every course, referenced by the @id its course page defines in full.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Online coding courses",
      itemListElement: courses.map((course) => ({
        "@type": "Course",
        "@id": ids.course(course),
        name: course.title,
        url: absoluteUrl(coursePath(course)),
        description: course.shortDescription,
        provider: ref(ids.organization),
      })),
    },
    // Placeholder until Phase 4 fills in the tutor; personSchema() then
    // describes the same @id in full.
    founder: { "@type": "Person", "@id": ids.founder, ...(tutor.name && { name: tutor.name }) },
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: absoluteUrl("/"),
    name: siteName,
    inLanguage: locale,
    publisher: ref(ids.organization),
  };
}

export function courseSchema(course: Course): JsonLdNode {
  return {
    "@type": "Course",
    "@id": ids.course(course),
    name: course.title,
    description: course.shortDescription,
    url: absoluteUrl(coursePath(course)),
    provider: ref(ids.organization),
    inLanguage: "en",
    typicalAgeRange: `${course.minAge}-`,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType:
        course.audience === "kids" ? `Children, ${course.ageLabel.toLowerCase()}` : course.ageLabel,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: "en",
      instructor: ref(ids.founder),
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/* Phase 4 hooks: not rendered yet. Add them to the homepage graph once the
 * tutor details and FAQ copy exist. */

export type FaqItem = { question: string; answer: string };

export function faqPageSchema(items: FaqItem[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function personSchema(person: Tutor): JsonLdNode {
  return {
    "@type": "Person",
    "@id": ids.founder,
    name: person.name,
    jobTitle: person.role,
    description: person.bio,
    worksFor: ref(ids.organization),
    ...(person.photo && { image: `${siteUrl}${person.photo.src}` }),
  };
}
