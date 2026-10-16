import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ogSize } from "./metadata";
import { siteName } from "./site";

/*
 * Shared renderer for the build-time Open Graph images. Satori needs TTF or
 * OTF fonts (not the woff2 files next/font produces), so OFL-licensed copies
 * live in src/assets/fonts.
 */


const colours = {
  sand: "#F7F2EC",
  ink: "#0B1426",
  coral: "#FF6B57",
  coralDeep: "#C2412F",
  mist: "#60697B",
};

/** The coral mark (built by scripts/build-brand.mts) as a data URL for Satori. */
async function loadMark() {
  const png = await readFile(join(process.cwd(), "src/assets/brand/logo-mark.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function loadFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [serif, sans] = await Promise.all([
    readFile(join(dir, "InstrumentSerif-Regular.ttf")),
    readFile(join(dir, "Geist-Regular.ttf")),
  ]);
  return [
    { name: "Instrument Serif", data: serif, style: "normal" as const, weight: 400 as const },
    { name: "Geist", data: sans, style: "normal" as const, weight: 400 as const },
  ];
}

type OgImageInput = {
  /** Large serif line. */
  title: string;
  /** Smaller sans line under the title. */
  subtitle: string;
  /** Optional small line above the wordmark row, e.g. an age label. */
  detail?: string;
};

export async function renderOgImage({ title, subtitle, detail }: OgImageInput) {
  const long = title.length > 40;
  const mark = await loadMark();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: colours.sand,
          fontFamily: "Geist",
          color: colours.ink,
          overflow: "hidden",
        }}
      >
        {/* Coral sun setting off the right edge. */}
        <div
          style={{
            position: "absolute",
            right: -150,
            bottom: -210,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: colours.coral,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img */}
            <img src={mark} width={56} height={48} alt="" />
            <div style={{ display: "flex", fontFamily: "Instrument Serif", fontSize: 40 }}>{siteName}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Instrument Serif",
                width: long ? 860 : 700,
                fontSize: long ? 92 : 120,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            <div style={{ marginTop: 28, fontSize: 34, color: colours.mist }}>{subtitle}</div>
            {detail && (
              <div style={{ marginTop: 18, fontSize: 28, color: colours.coralDeep }}>
                {detail}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await loadFonts() },
  );
}
