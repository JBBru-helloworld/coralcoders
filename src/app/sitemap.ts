import type { MetadataRoute } from "next";
import { absoluteUrl, coursePath, courses, privacyPath } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static export: lastModified is the build time.
  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...courses.map((course) => ({
      url: absoluteUrl(coursePath(course)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl(privacyPath), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
