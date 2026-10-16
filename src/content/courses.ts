/*
 * Course page copy. Final wording from the Phase 5 brief: change it here,
 * never inside components. Course names, labels and SEO titles live in
 * src/lib/site.ts.
 */
import type { FaqItem } from "@/lib/schema";

export type CourseContent = {
  h1: string;
  intro: string;
  learn: string[];
  build: string[];
  whoFor: string;
  setup: string;
  next: string;
  /** Slugs of related courses, linked from "Where it leads". */
  related: string[];
  faq: FaqItem[];
};

export const coursePageHeadings = {
  learn: "What you will learn",
  build: { kids: "What learners build", adults: "What you will build" },
  whoFor: "Who it is for",
  lessons: "How lessons work",
  next: "Where it leads",
  faq: "Questions about this course",
} as const;

/** Shared by every course page. */
export const lessonFormat = {
  length: "60-minute live 1:1 lessons over Zoom or Google Meet, with longer sessions on request.",
  times: "After school, at weekends and during school holidays.",
  rescheduling: "Free rescheduling up to 12 hours before a lesson.",
  /** Kids' pages only. */
  progress: "Parents receive a progress update once a month.",
} as const;

export const courseContent: Record<string, CourseContent> = {
  scratch: {
    h1: "Scratch coding lessons for kids aged 6+",
    intro:
      "Scratch is where most young programmers begin. Instead of typing code, children snap together colourful blocks to make characters move, talk and react. It looks like play, but every project uses the same ideas professional programmers rely on.",
    learn: [
      "Sequences and loops",
      "Events: when this happens, do that",
      "Conditions and simple logic",
      "Variables, such as keeping score",
      "Breaking a big idea into small steps",
      "Finding and fixing bugs",
    ],
    build: [
      "An animated story starring their own characters",
      "A catch-the-falling-objects game with a score",
      "A quiz that reacts to each answer",
      "A maze game with more than one level",
    ],
    whoFor:
      "Children aged 6 and over with no coding experience. Confident readers get the most out of it, but younger learners do well with the tutor guiding them through the reading.",
    setup: "Scratch runs free in a web browser, so there is nothing to install.",
    next: "Once a learner is confident with Scratch, the natural next step is Python, usually from around age 9.",
    related: ["python-for-kids", "ai-machine-learning-for-teens"],
    faq: [
      {
        question: "Does my child need to read well?",
        answer: "Basic reading helps, but the tutor reads instructions aloud wherever needed.",
      },
      {
        question: "Is Scratch real coding?",
        answer:
          "Yes. The blocks remove the typing, not the thinking. Loops, conditions and variables in Scratch are the same concepts used in Python and every other language.",
      },
    ],
  },

  "python-for-kids": {
    h1: "Python coding lessons for kids aged 9+",
    intro:
      "Python is one of the most popular programming languages in the world, used for websites, science, games and artificial intelligence. It reads almost like English, which makes it the ideal first typed language for young learners.",
    learn: [
      "Writing and running real Python programs",
      "Variables, data types and user input",
      "If statements, loops and functions",
      "Lists and simple data handling",
      "Reading error messages and debugging",
      "Writing clean, readable code",
    ],
    build: [
      "A number-guessing game",
      "A text adventure where choices change the story",
      "A quiz with scoring and feedback",
      "Drawings and patterns with Python's turtle module",
    ],
    whoFor:
      "Children aged 9 and over, whether they are complete beginners or moving on from Scratch. Being comfortable with a keyboard helps.",
    setup:
      "Python is free. Setup is done together in the first lesson, or we use a browser-based editor so there is nothing to install.",
    next: "Confident Python learners can move on to AI and Machine Learning from around age 12.",
    related: ["scratch", "ai-machine-learning-for-teens"],
    faq: [
      {
        question: "Does my child need to have done Scratch first?",
        answer: "No. Scratch is a helpful foundation, but many children start straight with Python.",
      },
      {
        question: "What do we need to install?",
        answer:
          "Nothing before the first lesson. The tutor helps set everything up, and all the tools are free.",
      },
    ],
  },

  "ai-machine-learning-for-teens": {
    h1: "AI and machine learning lessons for teens aged 12+",
    intro:
      "Teenagers already use AI every day. This course takes them behind the scenes: how machines learn from data, why AI sometimes gets things wrong, and how to build simple AI projects of their own in Python.",
    learn: [
      "What machine learning is, and what it is not",
      "Working with data in Python",
      "Training and testing simple models",
      "The basics of image and text classification",
      "How chatbots and large language models work",
      "Using AI responsibly: bias, privacy and checking answers",
    ],
    build: [
      "A model that sorts images into categories",
      "A program that decides whether a review is positive or negative",
      "A simple recommender for music or films",
      "A small chatbot project, built with care and parental agreement",
    ],
    whoFor:
      "Teens aged 12 and over who are curious about how AI works. Some Python experience helps. Beginners start with a short Python foundation inside the course.",
    setup:
      "We use free, beginner-friendly tools. Any account sign-up for an AI service is discussed with parents first.",
    next: "Learners finish with real projects they can show at school, in competitions or in future applications.",
    related: ["python-for-kids", "scratch"],
    faq: [
      {
        question: "Does my teen need to know Python already?",
        answer: "It helps, but it is not required. If needed, the course starts with the Python essentials.",
      },
      {
        question: "Is it safe for teenagers to use AI tools?",
        answer:
          "Yes, with guidance. Safe and responsible use is part of the course, and parents are consulted before any new account is created.",
      },
    ],
  },

  "python-for-adults": {
    h1: "Python lessons for adults and university students",
    intro:
      "Whether you want to automate tasks at work, keep up with a degree or move into a technical career, Python is the most practical first language to learn. Lessons are 1:1 and built around your goals, not a fixed syllabus.",
    learn: [
      "Python fundamentals, from the first line of code",
      "Working with files, spreadsheets and CSV data",
      "Automating repetitive tasks",
      "Data analysis with pandas",
      "Using APIs to pull in live data",
      "Writing code you can maintain and reuse",
    ],
    build: [
      "A script that cleans and merges messy spreadsheets",
      "An automated weekly report",
      "A small tool that collects data from a public API",
      "A personal project based on your own work or studies",
    ],
    whoFor:
      "Complete beginners, working professionals and university students whose course involves Python.",
    setup: "Python and every tool used are free. Setup is done together in the first lesson.",
    next: "Many learners go on to SQL for working with databases, or to AI and machine learning.",
    related: ["sql", "ai-and-prompt-engineering"],
    faq: [
      {
        question: "Am I too old to learn to code?",
        answer: "No. Adults often progress quickly because they arrive with a clear reason to learn.",
      },
      {
        question: "Can you help with university coursework?",
        answer:
          "Yes, by teaching the concepts behind it and checking your understanding. We do not complete assessed work for students.",
      },
    ],
  },

  sql: {
    h1: "SQL lessons for beginners and professionals",
    intro:
      "Almost every organisation stores its data in databases, and SQL is how you get answers out of them. Employers ask for it across analytics, finance, marketing and software roles, and it is one of the quickest technical skills to put to real use.",
    learn: [
      "Selecting, filtering and sorting data",
      "Summarising with aggregates and GROUP BY",
      "Joining tables together",
      "Subqueries and common table expressions",
      "An introduction to window functions",
      "The basics of good database design",
    ],
    build: [
      "Answers to real business questions on a realistic sales dataset",
      "A reporting query ready to feed a dashboard",
      "A small database designed from scratch",
      "A set of practice answers for SQL interview questions",
    ],
    whoFor:
      "Analysts, spreadsheet power users, students and job seekers preparing for technical interviews. No coding experience is needed.",
    setup:
      "We use free tools such as SQLite and PostgreSQL. What you learn transfers directly to MySQL, SQL Server and other databases.",
    next: "SQL pairs naturally with Python, for anyone who wants to automate or analyse data further.",
    related: ["python-for-adults", "ai-and-prompt-engineering"],
    faq: [
      {
        question: "Do I need programming experience?",
        answer: "No. SQL is a gentle first step into technical work.",
      },
      {
        question: "Which database will I learn?",
        answer:
          "The core of SQL is the same everywhere. Lessons use free databases, and the skills carry over to whichever system your workplace uses.",
      },
    ],
  },

  "ai-and-prompt-engineering": {
    h1: "AI, machine learning and prompt engineering lessons",
    intro:
      "AI tools are now part of everyday work, but most people only scratch the surface. Learn how these systems actually work, how to get dependable results from them, and how to build machine learning projects with Python. You are taught by someone who has built AI workflows and evaluation pipelines in industry.",
    learn: [
      "How large language models work, and where they fail",
      "Prompt techniques: structure, examples, roles and step-by-step reasoning",
      "Checking outputs and reducing made-up answers",
      "Machine learning fundamentals with scikit-learn",
      "Working with AI APIs",
      "Using AI responsibly with private and work data",
    ],
    build: [
      "A reusable prompt library for your own job",
      "A small AI assistant powered by an API",
      "A prediction model trained on real data",
      "Simple tests that check the quality of AI outputs",
    ],
    whoFor:
      "Professionals who want to use AI properly at work, students and developers moving into AI. The prompt engineering side needs no coding. The machine learning side uses Python, which can be taught alongside.",
    setup: "Most tools are free. Where a paid AI service would help, we discuss it first.",
    next: "From here, learners often go deeper into Python or data work with SQL.",
    related: ["python-for-adults", "sql"],
    faq: [
      {
        question: "Do I need to know how to code?",
        answer: "Not for prompt engineering. For the machine learning projects, Python is taught as part of the course.",
      },
      {
        question: "Will this help with my current job?",
        answer:
          "That is the aim. Lessons are shaped around the tasks you actually do, so you leave with tools you can use straight away.",
      },
    ],
  },
};

export function getCourseContent(slug: string): CourseContent {
  const content = courseContent[slug];
  if (!content) throw new Error(`No course content for "${slug}"`);
  return content;
}
