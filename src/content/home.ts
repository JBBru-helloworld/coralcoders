/*
 * Homepage copy. Final wording from the Phase 3 brief: change it here, never
 * inside components. Course names and descriptions live in src/lib/site.ts.
 */

export type TitledParagraph = { title: string; body: string };

export const hero = {
  heading: "Coding lessons for curious minds.",
  subheading:
    "Live 1:1 lessons online in Scratch, Python and AI for children from age 6, plus Python, SQL and AI for adults. Taught at your pace, for learners worldwide.",
  primaryCta: "Book a free lesson",
  secondaryCta: "Email us",
  trust: ["First lesson free", "Always 1:1, never group classes", "Taught in English, online"],
  coralLabel: "A glowing coral made of thousands of particles, drawn by a short Python program",
} as const;

/** The program shown in the hero code card; src/lib/coral.ts grows the same coral. */
export const coralProgram = `import random

def coral(x, y, angle, width, depth):
    if depth == 0:
        return
    tip = grow(x, y, angle, length=width * 5)
    scatter(dots=300, along=(x, y, tip), spread=width)
    for turn in random.sample([-35, -10, 15, 40], k=2):
        coral(*tip, angle + turn, width * 0.75, depth - 1)`;

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

export const tutorSection = {
  heading: "Meet your tutor",
} as const;

export const faqSection = {
  heading: "Questions parents ask",
  items: [
    {
      question: "Is the first lesson really free?",
      answer:
        "Yes. Your first 60-minute lesson is free, with no obligation to continue. It is a chance to meet the tutor, try a real lesson and find the right starting point.",
    },
    {
      question: "How long are lessons?",
      answer: "Lessons are 60 minutes. Longer sessions are available on request.",
    },
    {
      question: "How do online lessons work?",
      answer:
        "Lessons run live over Zoom or Google Meet. The tutor and learner share screens, so every idea can be explained, tried and debugged together in real time.",
    },
    {
      question: "What equipment do we need?",
      answer:
        "A laptop or desktop computer with a working camera and microphone, plus a stable internet connection. Tablets and phones make coding much harder, so a computer is strongly recommended.",
    },
    {
      question: "Does a parent need to sit in on lessons?",
      answer:
        "Usually not. Most children work happily on their own with the tutor. If your child needs help with something that cannot be done over a video call, such as setting up their computer, it helps to have an adult nearby.",
    },
    {
      question: "When are lessons available?",
      answer:
        "After school, at weekends and during school holidays. Times are arranged around your schedule and time zone, wherever you are.",
    },
    {
      question: "How much do lessons cost?",
      answer:
        "Pricing is tailored to the course and the schedule you choose. Send a message and we will put together an option that suits you.",
    },
    {
      question: "Can we reschedule a lesson?",
      answer: "Yes. You can reschedule for free up to 12 hours before the lesson starts.",
    },
    {
      question: "How will I know my child is progressing?",
      answer:
        "Parents receive a progress update once a month, covering what was learnt, what was built and what comes next.",
    },
    {
      question: "My child has never coded before. Is that a problem?",
      answer:
        "Not at all. Most young learners start from zero, and every course adapts to the learner's level and pace.",
    },
    {
      question: "What language are lessons taught in?",
      answer: "All lessons are taught in English.",
    },
  ],
} as const;

export const contactSection = {
  heading: "Book your free lesson",
  body: "Send a quick message with the learner's age and what they are curious about. We will reply to arrange a time that works for you.",
  primaryCta: "Message us on WhatsApp",
  secondaryCta: "Send an email",
  details: "Lessons are 60 minutes, online, and taught in English.",
} as const;
