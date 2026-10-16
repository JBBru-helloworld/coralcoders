/*
 * Content source of truth. Every component and all SEO metadata read from
 * here so the business name, email and phone are identical everywhere.
 */

export type Audience = "kids" | "adults";

export type Course = {
  slug: string;
  /** Full name, unique across the site (footer, course page, messages). */
  title: string;
  /** Name inside its audience group on the homepage, e.g. "Python". */
  shortTitle: string;
  /** Large serif label on the homepage: the age for kids, a monogram for adults. */
  marker: string;
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

export const courses: Course[] = [
  {
    slug: "scratch",
    title: "Scratch",
    shortTitle: "Scratch",
    marker: "6+",
    metaTitle: "Scratch Coding Lessons for Kids",
    audience: "kids",
    ageLabel: "Ages 6+",
    minAge: 6,
    shortDescription:
      "Drag-and-drop blocks, real programming ideas. Children build animations, stories and games while learning loops, events and logic, without having to type a line of syntax.",
  },
  {
    slug: "python-for-kids",
    title: "Python for Kids",
    shortTitle: "Python",
    marker: "9+",
    metaTitle: "Python Lessons for Kids",
    audience: "kids",
    ageLabel: "Ages 9+",
    minAge: 9,
    shortDescription:
      "The language professionals use every day, made approachable. Learners write their first real programs, from quizzes and text adventures to simple games, building habits that carry straight into school computing and beyond.",
  },
  {
    slug: "ai-machine-learning-for-teens",
    title: "AI and Machine Learning",
    shortTitle: "AI and Machine Learning",
    marker: "12+",
    metaTitle: "AI and Machine Learning for Teens",
    audience: "kids",
    ageLabel: "Ages 12+",
    minAge: 12,
    shortDescription:
      "How does a computer learn to recognise a cat? Teens find out by building it. Using Python, they train simple models, explore how chatbots work and learn to use AI tools thoughtfully and safely.",
  },
  {
    slug: "python-for-adults",
    title: "Python for Adults",
    shortTitle: "Python",
    marker: "Py",
    metaTitle: "Python Lessons for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    minAge: 18,
    shortDescription:
      "From your first line of code to automating your own work. Ideal for professionals tired of repetitive tasks and for students who need Python for their degree.",
  },
  {
    slug: "sql",
    title: "SQL",
    shortTitle: "SQL",
    marker: "SQL",
    metaTitle: "SQL Lessons for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    minAge: 18,
    shortDescription:
      "Ask your data questions and get real answers. Learn to query, join and summarise databases, the core skill behind analytics and reporting roles.",
  },
  {
    slug: "ai-and-prompt-engineering",
    title: "AI, Machine Learning and Prompt Engineering",
    shortTitle: "AI, Machine Learning and Prompt Engineering",
    marker: "AI",
    metaTitle: "AI and Prompt Engineering for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    minAge: 18,
    shortDescription:
      "Use AI properly, not just casually. Understand how models work, write prompts that give reliable results and build small machine learning projects in Python.",
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function coursePath(course: Course): string {
  return `/courses/${course.slug}/`;
}

/** The course a pathname belongs to ("/courses/sql/" -> SQL), if any. */
export function courseForPath(pathname: string): Course | undefined {
  const match = pathname.match(/^\/courses\/([^/]+)\/?$/);
  return match ? getCourse(match[1]) : undefined;
}

/**
 * Meta description for a course page: kept under 155 characters, so it is
 * generated rather than reusing the longer shortDescription.
 */
export function courseMetaDescription(course: Course): string {
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
