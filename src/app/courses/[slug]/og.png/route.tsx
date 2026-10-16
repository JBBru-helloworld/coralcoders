import { renderOgImage } from "@/lib/og";
import { courses, getCourse, siteName } from "@/lib/site";

// Emitted as out/courses/<slug>/og.png. See src/app/og.png/route.tsx.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const course = getCourse(slug);
  return renderOgImage({
    title: course?.title ?? siteName,
    subtitle: "Online 1:1 lessons. First lesson free.",
    detail: course?.ageLabel,
  });
}
