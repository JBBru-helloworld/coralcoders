import { renderOgImage } from "@/lib/og";
import { tagline } from "@/lib/site";

// Emitted as out/og.png. A route handler is used instead of the
// opengraph-image file convention, which exports files without an extension
// that static hosts serve with the wrong content type.
export const dynamic = "force-static";

export function GET() {
  return renderOgImage({
    title: tagline,
    subtitle: "Online 1:1 lessons for kids and adults",
  });
}
