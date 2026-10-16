/*
 * Content source of truth. Every component and all SEO metadata read from
 * here so the business name, email and phone are identical everywhere.
 */

export type Audience = "kids" | "adults";

export type Course = {
  slug: string;
  title: string;
  /** Page title before the " | Coral Coders" suffix. Keep under ~45 chars. */
  metaTitle: string;
  audience: Audience;
  ageLabel: string;
  /** Youngest suggested age, used for schema.org typicalAgeRange. */
  minAge: number;
  shortDescription: string;
};

export type Tutor = {
  name: string;
  role: string;
  bio: string;
  credentials: string[];
  photo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
};

export const siteName = "Coral Coders";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://coralcoders.com"
).replace(/\/+$/, "");

/**
 * Absolute URL for a site path. Page paths get the trailing slash the export
 * uses; a hash ("/#courses") is kept after it.
 */
export function absoluteUrl(path: string = "/"): string {
  const [pathname, hash] = path.split("#");
  const withLead = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withSlash = withLead.endsWith("/") ? withLead : `${withLead}/`;
  return `${siteUrl}${withSlash}${hash ? `#${hash}` : ""}`;
}

export const homeTitle = "Coral Coders | Online Coding Classes for Kids and Adults";

export const tagline = "Coding lessons for curious minds";

export const description =
  "Online 1:1 coding lessons in Scratch, Python and AI for kids and adults in Mauritius and South Africa. Your first lesson is free.";

export const footerDescription =
  "Online 1:1 coding lessons for children and adults across Mauritius and South Africa.";

export const lessonLanguageNote = "All lessons are taught in English, online.";

/*
 * Locale. The site is English only. A French homepage may be added later;
 * if so, add `alternates.languages` (hreflang en-GB / fr-MU) in layout.tsx.
 */
export const locale = "en-GB";

export const areaServed = ["MU", "ZA"] as const;

export const countryNames: Record<(typeof areaServed)[number], string> = {
  MU: "Mauritius",
  ZA: "South Africa",
};

export const contact = {
  email: "coralcoderz@gmail.com",
  whatsappE164: "+23054792689",
  whatsappDisplay: "+230 5479 2689",
  instagramHandle: "@coralcoders",
  instagramUrl: "https://instagram.com/coralcoders",
} as const;

/** Homepage sections, in page order. `inNav` sections appear in the header. */
export const sections = [
  { id: "why-code", label: "Why code", inNav: true },
  { id: "courses", label: "Courses", inNav: true },
  { id: "how-it-works", label: "How it works", inNav: true },
  { id: "tutor", label: "Tutor", inNav: true },
  { id: "faq", label: "FAQ", inNav: true },
  { id: "contact", label: "Contact", inNav: false },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const navSections = sections.filter((section) => section.inNav);

export const defaultWhatsappMessage =
  "Hi Coral Coders! I'd like to book a free lesson. Learner's age: __ , Course: __";

export function whatsappMessageFor(course?: Course): string {
  if (!course) return defaultWhatsappMessage;
  return course.audience === "adults"
    ? `Hi Coral Coders! I'd like to book a free ${course.title} lesson for myself.`
    : `Hi Coral Coders! I'd like to book a free ${course.title} lesson. Learner's age: __`;
}

export function whatsappLink(message: string = defaultWhatsappMessage): string {
  const number = contact.whatsappE164.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const defaultEmailSubject = "Free lesson enquiry";

export function emailSubjectFor(course?: Course): string {
  return course ? `${defaultEmailSubject}: ${course.title}` : defaultEmailSubject;
}

export function mailtoLink(
  subject: string = defaultEmailSubject,
  body?: string,
): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${contact.email}?${params.join("&")}`;
}

// TODO(phase-3): shortDescription copy for every course.
export const courses: Course[] = [
  {
    slug: "scratch",
    title: "Scratch",
    metaTitle: "Scratch Coding Lessons for Kids",
    audience: "kids",
    ageLabel: "Ages 6+",
    minAge: 6,
    shortDescription: "",
  },
  {
    slug: "python-for-kids",
    title: "Python for Kids",
    metaTitle: "Python Lessons for Kids",
    audience: "kids",
    ageLabel: "Ages 9+",
    minAge: 9,
    shortDescription: "",
  },
  {
    slug: "ai-machine-learning-for-teens",
    title: "AI and Machine Learning",
    metaTitle: "AI and Machine Learning for Teens",
    audience: "kids",
    ageLabel: "Ages 12+",
    minAge: 12,
    shortDescription: "",
  },
  {
    slug: "python-for-adults",
    title: "Python for Adults",
    metaTitle: "Python Lessons for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    minAge: 18,
    shortDescription: "",
  },
  {
    slug: "sql",
    title: "SQL",
    metaTitle: "SQL Lessons for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    minAge: 18,
    shortDescription: "",
  },
  {
    slug: "ai-and-prompt-engineering",
    title: "Machine Learning, Prompt Engineering and AI",
    metaTitle: "AI and Prompt Engineering for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    minAge: 18,
    shortDescription: "",
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function coursePath(course: Course): string {
  return `/courses/${course.slug}/`;
}

/** Meta description for a course page. Uses the Phase 3 copy once it exists. */
export function courseDescription(course: Course): string {
  if (course.shortDescription) return course.shortDescription;
  const who =
    course.audience === "kids"
      ? `children, ${course.ageLabel.toLowerCase()},`
      : "adults and students";
  return `Online 1:1 ${course.title} lessons for ${who} in Mauritius and South Africa. Your first lesson is free.`;
}

export const pricingNote =
  "Enquire for custom pricing that suits your schedule or your child's.";

// TODO(phase-4): tutor details and photo (public/images/tutor/joshua-bonham.jpg).
export const tutor: Tutor = {
  name: "",
  role: "",
  bio: "",
  credentials: [],
  photo: null,
};
