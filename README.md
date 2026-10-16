# Coral Coders

The website for Coral Coders, online 1:1 coding lessons for children and adults in Mauritius and South Africa.

**Live:** https://coralcoders.com

The site is built with Next.js, React and Tailwind CSS and exported as plain static files (HTML, CSS, JavaScript and images) into `out/`. There is no server, database or form. Cloudflare serves the files from its network (Workers with Static Assets) and rebuilds the site every time `main` changes on GitHub. Visits are counted with Cloudflare Web Analytics, which uses no cookies.

## Editing content

All words, links and contact details live in a few TypeScript files. Change text there, never inside the components.

| File | What it holds |
|---|---|
| `src/lib/site.ts` | Business name, contact details (email, WhatsApp, Instagram), the list of courses (names, ages, SEO titles and descriptions), the tutor's bio, credentials and photo, and the pre-filled WhatsApp and email messages |
| `src/content/home.ts` | Homepage copy: hero, "Why start coding now?", courses intro, "How it works", the homepage FAQ and the contact section |
| `src/content/courses.ts` | Each course page: intro, what you learn, what you build, who it is for, setup, where it leads and the course FAQ |
| `src/content/privacy.ts` | The privacy notice. The "Last updated" date changes by itself on every build |

Keep to UK English and avoid em dashes in copy. Every text field is a plain string between quotes; if the text contains a double quote, use the curly one or an apostrophe instead.

**Example: change the WhatsApp number.** In `src/lib/site.ts`, find `contact` and change both lines:

```ts
whatsappE164: "+23054792689",       // digits only after the +, used in links
whatsappDisplay: "+230 5479 2689",  // how it is shown on the page
```

Every WhatsApp button, the footer and the structured data for Google update from these two lines.

**Example: add a homepage FAQ.** In `src/content/home.ts`, find `faqSection` and add an item to `items`, in the position you want it to appear:

```ts
{
  question: "Can siblings share a lesson?",
  answer: "Lessons are always 1:1, so each learner gets their own time. Ask us about booking siblings back to back.",
},
```

The question appears on the page and in the FAQ data Google reads. Course FAQs work the same way, inside each course's `faq` list in `src/content/courses.ts`.

## Publishing

1. Edit the files (on GitHub in the browser, or locally).
2. Commit and push to `main`.
3. Cloudflare builds and deploys automatically, usually within two or three minutes.

**Build logs:** Cloudflare dashboard > Workers & Pages > `coralcoders` > Deployments, then "View build history" at the bottom. A failed build leaves the previous version live, so a mistake never takes the site down.

**Rolling back:** Workers & Pages > `coralcoders` > Deployments, then the three dots next to an earlier version > Rollback. This is instant, but the next push to `main` deploys whatever is in `main`, so also undo the change in git (`git revert <commit>` and push).

**Build settings** (Workers & Pages > `coralcoders` > Settings > Build): build command `pnpm build`, deploy command `npx wrangler deploy`, build variable `NEXT_PUBLIC_SITE_URL = https://coralcoders.com`.

Analytics: Cloudflare adds the analytics script to each page by itself (automatic setup). Do not also set the `NEXT_PUBLIC_CF_BEACON_TOKEN` build variable unless you first switch Web Analytics to manual setup, or every visit is counted twice.

## Previewing locally

You need Node.js 22.18 or newer (24 recommended) and pnpm 9 (`corepack enable` sets it up from `package.json`).

```sh
pnpm install     # once, and after dependencies change
pnpm dev         # live-reloading preview at http://localhost:3000
pnpm preview     # production build served by Cloudflare's local runtime at http://localhost:8787
```

`pnpm preview` is the closest thing to the live site: it applies the same headers, redirects and 404 page. Before pushing a larger change, also run `pnpm lint` and `pnpm build`.

## QA scripts

Developer checks in `scripts/qa/`, never shipped. Most need the built site served on `QA_BASE` (default `http://localhost:4173`): run `pnpm build`, then `python3 -m http.server 4173 -d out` in another terminal. Run each with `node scripts/qa/<name>.mts`. Reports and screenshots go to `docs/qa/` (gitignored). Set `QA_BASE=https://coralcoders.com` to test the live site.

| Script | What it checks |
|---|---|
| `proofread.mts` | Reads `out/` directly (no server): page text, metadata and JSON-LD on every page, and that internal links resolve |
| `schema.mts` | JSON-LD against the schema.org vocabulary: every type and property is real (run after a build, no server) |
| `a11y.mts` | Accessibility: axe plus structural checks on every page. Optional browser argument: `chromium`, `webkit` or `firefox` |
| `responsive.mts` | Full-page screenshots of every page across screen widths |
| `cross-browser.mts` | Screenshots and checks in Chromium, WebKit (Safari) and Firefox |
| `perf.mts` | Cold-load speed on a throttled phone: FCP, LCP, CLS and TBT. Arguments: number of runs, then routes |
| `font-fallbacks.mts` | That text does not rewrap (cause layout shift) when the web fonts swap in |
| `coral-cost.mts` | The hero coral's animation cost per frame, and that it stops when scrolled away |
| `coral-sharpness.mts` | That the hero coral stays sharp through and after the intro |

## Assets

Original files (the logo and the tutor photo) live in `assets/originals/`, which is **gitignored**: they are large, and phone photos carry GPS location data. Keep a backup of that folder somewhere safe; it only exists on your computer.

To replace the photo or logo, overwrite `assets/originals/tutor/joshua-bonham.jpg` (portrait, at least 1200 px tall) or `assets/originals/brand/logo.svg`, run `pnpm assets`, check the result with `pnpm dev`, then commit the regenerated files in `public/brand/`, `public/images/tutor/`, `src/assets/brand/` and the icons in `src/app/`. Full details: `docs/ASSETS.md`.

The coral hero images in `public/coral/` are drawn by `scripts/build-coral.mts` on every build and are not committed.

## Design rules

`DESIGN.md` is the design system: colours (sand, ink, coral, lagoon), type, spacing, motion and the performance budget. `PRODUCT.md` describes who the site is for and how it should feel. Read both before changing the look.

## Credits

- Link underline style adapted from [Skiper UI](https://skiper-ui.com) (skiper40).
- Fonts: [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [Geist](https://vercel.com/font), both under the SIL Open Font Licence (copies in `src/assets/fonts/`).
