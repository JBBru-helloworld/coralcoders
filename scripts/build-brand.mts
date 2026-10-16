/*
 * Builds optimised brand and photo assets from the owner's originals in
 * assets/originals/ (local only, gitignored: large files, and the photo
 * carries GPS EXIF data). The outputs are small, metadata-free and committed,
 * so a build without the originals (for example on a CI host) skips this step
 * and uses the committed files.
 *
 * Outputs:
 *   public/brand/logo-mark-{96,192}.webp     header and footer mark
 *   public/brand/logo-mark-512.png           schema logo, OG images
 *   src/assets/brand/logo-mark.png           OG image renderer input
 *   public/images/tutor/joshua-bonham-{640,1280}.webp
 *   src/app/icon.png (512), apple-icon.png (180), favicon.ico (32)
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const originals = join(root, "assets", "originals");
const logoSource = join(originals, "brand", "logo.svg");
const photoSource = join(originals, "tutor", "joshua-bonham.jpg");
const SAND = "#F7F2EC";
const PHOTO_BUDGET = 148_000; // bytes: under 150 KB however it is counted

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

/** The logo "SVG" wraps an embedded raster, so it is rasterised and trimmed. */
async function buildLogo() {
  const mark = await sharp(logoSource, { density: 192 })
    .trim({ threshold: 1 })
    .png()
    .toBuffer();
  const { width = 0, height = 0 } = await sharp(mark).metadata();

  await mkdir(join(root, "public", "brand"), { recursive: true });
  await mkdir(join(root, "src", "assets", "brand"), { recursive: true });
  for (const h of [96, 192]) {
    await sharp(mark)
      .resize({ height: h })
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(join(root, "public", "brand", `logo-mark-${h}.webp`));
  }
  // Palette PNGs: the watercolour texture makes full-colour PNGs heavy.
  const palette = { compressionLevel: 9, palette: true, quality: 90, effort: 10 } as const;
  await sharp(mark).resize({ height: 512 }).png(palette).toFile(join(root, "public", "brand", "logo-mark-512.png"));
  await sharp(mark).resize({ height: 256 }).png(palette).toFile(join(root, "src", "assets", "brand", "logo-mark.png"));

  // Favicons: the mark centred on a square, padded so it reads at small sizes.
  const square = async (size: number, padding: number, background: string | null) => {
    const inner = Math.round(size * (1 - padding * 2));
    const fitted = await sharp(mark).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: fitted, gravity: "centre" }])
      .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
      .toBuffer();
  };
  const appDir = join(root, "src", "app");
  await writeFile(join(appDir, "icon.png"), await square(512, 0.04, null));
  await writeFile(join(appDir, "apple-icon.png"), await square(180, 0.12, SAND));
  // favicon.ico holding one 32px PNG (PNG-in-ICO, supported by all current browsers).
  const png32 = await square(32, 0.02, null);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png32.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  await writeFile(join(appDir, "favicon.ico"), Buffer.concat([header, png32]));

  console.log(`brand: logo mark ${width}x${height} -> webp 96/192, png 512, favicons`);
}

/** Photo: EXIF orientation applied, all metadata stripped (sharp's default). */
async function buildPhoto() {
  const outDir = join(root, "public", "images", "tutor");
  await mkdir(outDir, { recursive: true });
  for (const height of [640, 1280]) {
    let quality = 82;
    let output: Buffer;
    do {
      output = await sharp(photoSource).rotate().resize({ height }).webp({ quality, effort: 6 }).toBuffer();
      quality -= 4;
    } while (output.length > PHOTO_BUDGET && quality > 40);
    await writeFile(join(outDir, `joshua-bonham-${height}.webp`), output);
    const { width } = await sharp(output).metadata();
    console.log(`brand: photo ${width}x${height}, q${quality + 4}, ${(output.length / 1024).toFixed(1)} KB`);
  }
}

if (await exists(logoSource)) await buildLogo();
else console.log("brand: logo original not found, using committed outputs");
if (await exists(photoSource)) await buildPhoto();
else console.log("brand: photo original not found, using committed outputs");
