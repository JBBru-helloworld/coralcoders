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
  brand,
  contact,
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
  person: `${siteUrl}/#joshua-bonham`,
  logo: `${siteUrl}/#logo`,
  course: (course: Course) => `${absoluteUrl(coursePath(course))}#course`,
} as const;

const ref = (id: string): Ref => ({ "@id": id });

/** Absolute URL for a file in /public (no trailing slash). */
const fileUrl = (path: string) => `${siteUrl}${path}`;

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
    areaServed,
    knowsLanguage: "en",
    logo: {
      "@type": "ImageObject",
      "@id": ids.logo,
      url: fileUrl(brand.logoPng.src),
      contentUrl: fileUrl(brand.logoPng.src),
      width: brand.logoPng.width,
      height: brand.logoPng.height,
      caption: siteName,
    },
    image: ref(ids.logo),
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
    founder: ref(ids.person),
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

export type CourseSchemaInput = {
  h1: string;
  intro: string;
  learn: readonly string[];
  whoFor: string;
};

/** First sentence, for short fields such as coursePrerequisites. */
const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;

export function courseSchema(course: Course, content: CourseSchemaInput): JsonLdNode {
  return {
    "@type": "Course",
    "@id": ids.course(course),
    name: content.h1,
    description: content.intro,
    url: absoluteUrl(coursePath(course)),
    provider: ref(ids.organization),
    inLanguage: "en",
    educationalLevel: "Beginner",
    teaches: content.learn,
    coursePrerequisites: firstSentence(content.whoFor),
    ...(course.audience === "kids" && { typicalAgeRange: `${course.minAge}-` }),
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType:
        course.audience === "kids" ? `Children, ${course.ageLabel.toLowerCase()}` : course.ageLabel,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT1H",
      inLanguage: "en",
      instructor: ref(ids.person),
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

export type FaqItem = { question: string; answer: string };

export function faqPageSchema(items: readonly FaqItem[], path = "/"): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function personSchema(person: Tutor = tutor): JsonLdNode {
  return {
    "@type": "Person",
    "@id": ids.person,
    name: person.name,
    jobTitle: "Founder and Lead Tutor",
    description: person.bio[0],
    image: fileUrl(person.photo.src),
    worksFor: ref(ids.organization),
    alumniOf: ["Sunway University", "Lancaster University"].map((name) => ({
      "@type": "CollegeOrUniversity",
      name,
    })),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Oracle Cloud Infrastructure 2025 Certified Generative AI Professional",
      credentialCategory: "certification",
      recognizedBy: { "@type": "Organization", name: "Oracle" },
    },
    knowsAbout: [
      "Scratch",
      "Python",
      "SQL",
      "Machine learning",
      "Artificial intelligence",
      "Prompt engineering",
    ],
    sameAs: person.links.map((link) => link.href),
  };
}
