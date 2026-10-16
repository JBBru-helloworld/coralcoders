import type { MetadataRoute } from "next";
import { absoluteUrl, coursePath, courses } from "@/lib/site";

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
  ];
}
