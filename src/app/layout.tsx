import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { MobileCtaBar } from "@/components/cta/mobile-cta-bar";
import { MotionProvider } from "@/components/motion-provider";
import { NavStateProvider } from "@/components/site/nav-state";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";
import { defaultOgImage, ogImage } from "@/lib/metadata";
import { description, homeTitle, locale, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
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
        <MotionProvider>
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
        </MotionProvider>
      </body>
    </html>
  );
}
