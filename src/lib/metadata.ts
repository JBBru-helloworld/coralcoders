import type { Metadata } from "next";
import { absoluteUrl, locale, siteName, tagline } from "./site";

type PageMetadataInput = {
  /** Page title. Gets the " | Coral Coders" suffix unless `absoluteTitle`. */
  title: string;
  description: string;
  /** Site path with trailing slash, e.g. "/courses/sql/". */
  path: string;
  absoluteTitle?: boolean;
  /** Built Open Graph image. Defaults to the site-wide /og.png. */
  image?: { path: string; alt: string };
};

export const ogSize = { width: 1200, height: 630 };

/** Open Graph image entry pointing at a PNG built by an og.png route. */
export function ogImage(path: string, alt: string) {
  return { url: path, ...ogSize, alt, type: "image/png" };
}

export const defaultOgImage = { path: "/og.png", alt: `${siteName}: ${tagline}` };

/*
 * Full per-page metadata. A page's `openGraph` replaces the layout's rather
 * than merging with it, so every page sets the complete object here.
 * OG images are PNGs built by the og.png route handlers.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image = defaultOgImage,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const images = [ogImage(image.path, image.alt)];
  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName,
      locale: locale.replace("-", "_"),
      url,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
  };
}
