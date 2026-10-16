import {
  absoluteUrl,
  areaServed,
  contact,
  countryNames,
  courseDescription,
  coursePath,
  courses,
  description,
  lessonLanguageNote,
  pricingNote,
  siteName,
} from "@/lib/site";

// Built to out/llms.txt from site.ts, so it can never drift from the site.
export const dynamic = "force-static";

export function GET() {
  const countries = areaServed.map((code) => countryNames[code]).join(" and ");
  const courseLines = (audience: "kids" | "adults") =>
    courses
      .filter((course) => course.audience === audience)
      .map(
        (course) =>
          `- [${course.title}](${absoluteUrl(coursePath(course))}) (${course.ageLabel}): ${courseDescription(course)}`,
      )
      .join("\n");

  const body = `# ${siteName}

> ${description}

${siteName} offers online one-to-one coding lessons for children and adults in ${countries}. ${lessonLanguageNote} The first lesson is free. ${pricingNote}

## Courses for children

${courseLines("kids")}

## Courses for adults

${courseLines("adults")}

## Contact

- WhatsApp: ${contact.whatsappDisplay} (https://wa.me/${contact.whatsappE164.replace(/\D/g, "")})
- Email: ${contact.email}
- Instagram: ${contact.instagramHandle} (${contact.instagramUrl})
- Website: ${absoluteUrl("/")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
