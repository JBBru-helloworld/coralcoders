/*
 * Homepage copy. Final wording from the Phase 3 brief: change it here, never
 * inside components. Course names and descriptions live in src/lib/site.ts.
 */

export type TitledParagraph = { title: string; body: string };

export const hero = {
  heading: "Coding lessons for curious minds.",
  subheading:
    "Live 1:1 lessons online in Scratch, Python and AI for children from age 6, plus Python, SQL and AI for adults. Taught at your pace, from anywhere in Mauritius or South Africa.",
  primaryCta: "Book a free lesson",
  secondaryCta: "Email us",
  trust: ["First lesson free", "Always 1:1, never group classes", "Taught in English, online"],
  coralLabel: "A coral branch drawn by a short Python program",
} as const;

/** The Python turtle program shown in the hero code card. */
export const coralProgram = `def coral(length, depth):
    if depth == 0:
        return
    forward(length)
    left(25)
    coral(length * 0.7, depth - 1)
    right(50)
    coral(length * 0.7, depth - 1)
    left(25)
    back(length)`;

export const whyCode = {
  heading: "Why start coding now?",
  statement:
    "Your child will grow up alongside AI. We want them building with it, not just scrolling past it.",
  points: [
    {
      title: "Coding is a way of thinking.",
      body: "Breaking a big problem into small steps, testing an idea and fixing what went wrong. These habits show up in maths, science and even essay writing long before they show up in a job.",
    },
    {
      title: "AI rewards people who understand it.",
      body: "AI tools can write code now, but someone still has to know what to ask for, notice when the answer is wrong and fit the pieces together. Children who learn the fundamentals early get to direct these tools instead of depending on them.",
    },
    {
      title: "Making beats consuming.",
      body: "Most screen time is passive. An hour of coding ends with a game, an animation or a program your child made themselves, and that sense of pride is what keeps them coming back.",
    },
    {
      title: "Starting early makes it easier.",
      body: "Young learners pick up new languages quickly, and programming languages are no different. Scratch at six becomes Python at nine and machine learning at twelve, with each step building on the last.",
    },
  ] satisfies TitledParagraph[],
  adultsPrompt: "Not a child any more? It is never too late.",
  adultsLink: "See courses for adults",
};

export const coursesSection = {
  heading: "Courses",
  intro:
    "Every course is taught 1:1 and shaped around the learner. These are starting points, not fixed syllabuses.",
  groups: {
    kids: { label: "Young learners" },
    adults: { label: "Adults and students" },
  },
  learnMore: "Learn more",
  book: "Book a free lesson",
} as const;

/** Hash that opens the adult tab of #courses (used by the #why-code link). */
export const adultCoursesHash = "adult-courses";

export const howItWorks = {
  heading: "How it works",
  steps: [
    {
      title: "Book a free lesson.",
      body: "Send a message on WhatsApp or email with the learner's age and what interests them. No forms, no commitment.",
    },
    {
      title: "Meet your tutor.",
      body: "The first lesson is a relaxed 1:1 video call. We find the right starting level, and the learner builds something on day one.",
    },
    {
      title: "Get a plan that fits.",
      body: "We suggest a course and a weekly rhythm that suit your schedule, with pricing tailored to match.",
    },
  ] satisfies TitledParagraph[],
  requirements:
    "All you need is a laptop or desktop computer and a stable internet connection.",
};
