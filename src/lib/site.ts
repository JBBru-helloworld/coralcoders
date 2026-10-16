/*
 * Content source of truth. Every component and all SEO metadata read from
 * here so the business name, email and phone are identical everywhere.
 */

export type Audience = "kids" | "adults";

export type Course = {
  slug: string;
  title: string;
  audience: Audience;
  ageLabel: string;
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

export const description =
  "Online 1:1 coding lessons for children and adults in Mauritius and South Africa. Scratch, Python, SQL and AI. Your first lesson is free.";

export const locale = "en-GB";

export const areaServed = ["MU", "ZA"] as const;

export const contact = {
  email: "coralcoderz@gmail.com",
  whatsappE164: "+23054792689",
  whatsappDisplay: "+230 5479 2689",
  instagramHandle: "@coralcoders",
  instagramUrl: "https://instagram.com/coralcoders",
} as const;

export const defaultWhatsappMessage =
  "Hi Coral Coders! I'd like to book a free lesson. Learner's age: __ , Course: __";

export function whatsappLink(message: string = defaultWhatsappMessage): string {
  const number = contact.whatsappE164.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(
  subject: string = "Free lesson enquiry",
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
    audience: "kids",
    ageLabel: "Ages 6+",
    shortDescription: "",
  },
  {
    slug: "python-for-kids",
    title: "Python for Kids",
    audience: "kids",
    ageLabel: "Ages 9+",
    shortDescription: "",
  },
  {
    slug: "ai-machine-learning-for-teens",
    title: "AI and Machine Learning",
    audience: "kids",
    ageLabel: "Ages 12+",
    shortDescription: "",
  },
  {
    slug: "python-for-adults",
    title: "Python for Adults",
    audience: "adults",
    ageLabel: "Professionals and university students",
    shortDescription: "",
  },
  {
    slug: "sql",
    title: "SQL",
    audience: "adults",
    ageLabel: "Professionals and university students",
    shortDescription: "",
  },
  {
    slug: "ai-and-prompt-engineering",
    title: "Machine Learning, Prompt Engineering and AI",
    audience: "adults",
    ageLabel: "Professionals and university students",
    shortDescription: "",
  },
];

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
