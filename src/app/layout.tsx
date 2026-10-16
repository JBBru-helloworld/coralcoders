import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { MobileCtaBar } from "@/components/cta/mobile-cta-bar";
import { NavStateProvider } from "@/components/site/nav-state";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";
import { defaultOgImage, ogImage } from "@/lib/metadata";
import { description, homeTitle, locale, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

// Sans and serif use hand-tuned metric fallbacks (globals.css) instead of
// next/font's automatic ones, which run wide for this copy and
// rewrap lines when the web font swaps in (layout shift on slow first loads).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["Geist Metric Fallback", "Arial", "sans-serif"],
});

// Only the code card uses mono, below the fold on phones: no preload, so it
// never competes with the two fonts the first screen needs.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  adjustFontFallback: false,
  fallback: ["Instrument Serif Metric Fallback", "Times New Roman", "serif"],
});

// Defaults only. Each page sets its own canonical, Open Graph and Twitter
// metadata through pageMetadata() in src/lib/metadata.ts.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeTitle,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName,
    locale: locale.replace("-", "_"),
    images: [ogImage(defaultOgImage.path, defaultOgImage.alt)],
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImage(defaultOgImage.path, defaultOgImage.alt)],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F2EC",
  // Lets env(safe-area-inset-*) report real values on notched phones.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <NavStateProvider>
          <SiteHeader />
          <main
            id="main"
            tabIndex={-1}
            className="flex flex-1 scroll-mt-(--nav-height) flex-col outline-none"
          >
            {children}
          </main>
          <SiteFooter />
          <MobileCtaBar />
        </NavStateProvider>
      </body>
    </html>
  );
}
