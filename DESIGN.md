# Coral Coders design system

The tokens live in `src/app/globals.css` and the motion presets in `src/lib/motion.ts`. This file covers how to use them and why they are set the way they are.

## Palette: "Reef at dusk"

| Token | Hex | OKLCH | Use |
|---|---|---|---|
| `--sand` | `#F7F2EC` | `0.963 0.010 72.7` | Main light background |
| `--sand-raised` | `#FDFAF6` | `0.985 0.006 72.7` | Cards on sand |
| `--sand-sunk` | ~`#F1EBE3` | `0.945 0.013 72.7` | Quiet fills, muted panels |
| `--ink` | `#0B1426` | `0.193 0.039 263.1` | Body text, dark sections, hero |
| `--ink-raised` | ~`#18213A` | `0.245 0.040 263.1` | Cards on ink |
| `--coral` | `#FF6B57` | `0.708 0.185 30.1` | Buttons, large headings, highlights only |
| `--coral-deep` | `#C2412F` | `0.556 0.168 30.9` | Coral text and links on light backgrounds |
| `--lagoon` | `#1FB5A8` | `0.698 0.117 185.5` | Sparing accent: small details, code highlights, focus on ink |
| `--lagoon-deep` | `#0C8D83` | `0.58 0.1 185.5` | Focus rings on light backgrounds |
| `--mist` | `#60697B` | `0.52 0.03 263.1` | Muted text on sand (derived from ink) |
| `--mist-line` | `#D7DBE3` | `0.89 0.012 263.1` | Hairlines and borders on sand |
| `--mist-on-ink` | `#AFB8C8` | `0.78 0.025 263.1` | Muted text on ink |

### Contrast (WCAG 2.x)

| Pair | Ratio | Result |
|---|---|---|
| ink on sand | 16.52:1 | AAA |
| coral-deep on sand | 4.61:1 | AA body text |
| mist on sand | 4.95:1 | AA body text |
| ink on coral (button label) | 6.56:1 | AA |
| sand or white on coral | 2.52:1 | **Fails. Never use.** |
| coral on sand | 2.52:1 | Fails for text. Decorative or 3:1-exempt use only |
| coral on ink | 6.56:1 | AA, so coral text is fine on dark sections |
| lagoon-deep on sand (focus ring) | 3.66:1 | Meets 3:1 for non-text |
| lagoon on ink (focus ring) | 7.21:1 | Meets 3:1 for non-text |

### Rules

- Bright coral is never used for body text on sand. Use `text-coral-deep` (or `text-link`).
- Coral buttons carry **ink** labels, never white.
- No purple, no rainbow gradients, no gradient text. `--gradient-hero` (coral to lagoon, low alpha) is the only gradient and is used in the hero at most.
- The sticky header is transparent at the top of the page and fully opaque sand with a hairline border once scrolled. No blur: any translucency lets content ghost through and drops nav contrast over ink sections.
- No glassmorphism as decoration. Translucency is allowed only where it does a job (for example a sticky nav over scrolling content) and must fall back to solid under `prefers-reduced-transparency`.
- Light is the default. An ink section is made by adding the `dark` class to that section, which remaps shadcn's semantic variables. It is never set on `<html>`, and there is no theme toggle.

## Typography

- **Display and headings:** Instrument Serif (400). Add the italic in layout.tsx only if a design uses it. Size and space create hierarchy, not weight.
- **Body and UI:** Geist Sans.
- **Code accents, small labels, measurements:** Geist Mono. Use it for real code or data, never as a "techy" costume.
- All three are self-hosted at build time through `next/font/google`.

Fluid scale (Tailwind utilities `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-label`), clamped between the 390px and 1440px viewports:

| Step | Size | Leading | Tracking |
|---|---|---|---|
| display | 3.5rem to 6rem | 0.98 | -0.025em |
| h1 | 2.5rem to 4.25rem | 1.02 | -0.02em |
| h2 | 2rem to 3rem | 1.08 | -0.015em |
| h3 | 1.5rem to 2rem | 1.15 | -0.01em |
| lead | 1.125rem to 1.3125rem | 1.55 | -0.005em |
| body | 1rem | 1.6 | 0 |
| small | 0.875rem | 1.5 | 0.005em |
| label | 0.75rem | 1.4 | 0.08em |

Body copy stays within 60 to 75 characters per line.

## Motion

Restraint first: every animation shows state, hierarchy or feedback, or rewards an action. Nothing loops except the hero coral.

| Token | Value |
|---|---|
| `--duration-instant` | 100ms (press down) |
| `--duration-fast` | 160ms (hover, colour) |
| `--duration-base` | 220ms (small reveals, FAQ height) |
| `--duration-spring` | 240ms (springs: tabs, nav line, arrows, button release) |
| `--duration-slow` | 300ms (panel cross-fade, sheet slide) |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` (entrances) |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `ease-press` | `cubic-bezier(0.3, 0, 0.2, 1)` (press down) |
| `ease-spring` | a damped spring (damping 0.85) as CSS `linear()`: 99% at half time, 0.6% overshoot |
| `spring` (TS) | `{ type: "spring", bounce: 0, duration: 0.3 }` |
| `springMomentum` (TS) | `{ type: "spring", bounce: 0.2, duration: 0.3 }` |

**Rules**

- Animate only `transform` (including `translate`/`scale`), `opacity`, `clip-path` and `filter`. Colour fades on hover are paint-only and allowed. Never animate layout, except the FAQ panel height through Base UI's `--accordion-panel-height`.
- UI feedback 150 to 250ms; entrances 300 to 600ms. Springs for interactive elements, `ease-out` for entrances.
- Prefer CSS: transitions retarget from the current value, so every interaction is interruptible. Scroll-driven effects use `animation-timeline` and are fully visible where unsupported.
- Hover only under `@media (hover: hover) and (pointer: fine)` (the `pointer-hover:` variant); touch gets press feedback (scale 0.97, spring back).
- Headings and calls to action never wait to appear. Entrances (`.reveal`, 12px fade-up) are for supporting content only.
- Zero layout shift.

**Inventory**

| Element | Trigger | What moves | Timing |
|---|---|---|---|
| Buttons | press / release | `scale` 0.97 | 100ms down, spring back |
| Coral button | hover | `filter: brightness(1.06)` | spring 240ms |
| Arrows (Learn more, adults link, tutor, related courses) | hover | `translateX(3px)` | spring 240ms |
| Links (nav, footer, tutor, related, breadcrumb) | hover, focus | underline `scaleX` grows from left (skiper40 style) | 220ms ease-out |
| Nav active line | section change | `clip-path` slides between links | spring 240ms |
| Course tabs | select | ink pill `clip-path` slides (the fill under it covers only the active tab at rest, stepping its edges, never interpolating); panel fades + rises 8px | spring 240ms; 300ms ease-out |
| Course rows | hover on Learn more | row tint `opacity`, numeral up 2px | 220ms; spring |
| Why Code statement | scroll | each word `opacity` 0.4 to 1 (dimmed words stay above 3:1) | scroll-linked |
| How it works | scroll | connectors `scaleX`/`scaleY`, next number `opacity` | scroll-linked |
| FAQ | open / close | height (Base UI variable), chevron 180deg, answer fades in after 60ms | 220ms; spring; 220ms |
| Mobile menu | open / close | sheet `translate` (spring), links stagger 35ms; exit together | 300ms in; 160ms out |
| Section entrances | scroll | `.reveal` fade-up 12px | scroll-linked, entry 0 to 30% |
| Header | scroll past 24px | background and hairline colour | 220ms |
| Mobile CTA bar | past hero / over #contact | `translate`, `opacity` | 220ms |
| Hero coral | load | canvas intro and idle current (see below) | 1.6s once, then idle |

**Reduced motion.** Under `prefers-reduced-motion: reduce`, transitions are limited to opacity and colour (150ms), so transforms and clip-paths snap to their end state and state changes still fade. Scroll-driven and entrance keyframes exist only for `no-preference`; the course panel and mobile sheet get opacity-only fades instead. Smooth scrolling is off, the coral canvas never mounts, and `MotionConfig reducedMotion="user"` wraps the app.

## Hero visual: particle coral

A staghorn coral made of glowing particles, inside an ink panel: a window into the reef within the light hero. The code card beside it shows the program that grows it (`src/lib/coral.ts` follows the same steps).

**Shape.** Deterministic (skeleton seed `3`). A short, thick base fans into 3 branches, then each branch splits into 2 (sometimes 3) using turns from {-35, -10, 15, 40} degrees with jitter, never mirrored. Branches are curved (quadratic Bézier), bend gently upwards, and are about `width * 5` long. Each child is 0.72 to 0.8 of its parent's width. 4 depth levels, blunt rounded tips, no buds or dots at the ends.

**Particles.** Sampled along each branch with a Gaussian spread across it (dense core, soft edges), plus 4% stray particles and a 2% glow at the base. Radius 0.5 to 1.6 CSS px (skewed small), alpha 0.26 to 0.7.

| Colour | Share |
|---|---|
| coral `#FF6B57` | 70% |
| coral-deep `#C2412F` | 18% |
| warm highlight (coral towards sand) `#FBAFA2` | 7% |
| lagoon `#1FB5A8` | 5% |

| Variant | Viewport | Panel aspect | Particles |
|---|---|---|---|
| mobile | under 768px | 4:3 | 3,500 |
| tablet | 768 to 1023px | 4:3 | 6,000 |
| desktop | 1024px and up | 4:5 | 9,000 |

**Panel.** Ink, 28px radius, inner vignette and a sand hairline at 8% opacity. Aspect ratio is fixed per breakpoint (no layout shift). On desktop the code card (raised ink, 460px max) overlaps the bottom-left corner, 3rem outside the panel edge; on mobile and tablet it sits below the panel and never covers the coral. Long code lines wrap with a hanging indent, never scroll sideways.

**Rendering.**
- Static first: `scripts/build-coral.mts` renders the settled coral at 2x with additive blending and writes WebP tiles to `public/coral/` (generated at build, not committed). The fallback is a 2x2 grid of plain `<img>` tiles so that no single image is larger than the H1, which must stay the Largest Contentful Paint element. Users without JavaScript, and with reduced motion, see only this.
- Canvas enhancement: mounted after the `load` event in an idle callback, from a dynamically imported chunk (about 3 KB gzipped). `lighter` compositing, device pixel ratio capped at 2.
- Intro (once, about 1.6s): particles ease in from a scatter with the `--ease-out` curve, staggered by depth, base first. The canvas cross-fades over the fallback (300ms).
- Idle current: fades in over 2s after the intro, so the settled frame is the fallback. The settled particles are baked into 4 phase-group layers; each frame shears them by a slow sine (one cycle every 7s), so the base stays still and the tips drift about 3px. Drawn at 30fps.
- The loop stops when the panel is off-screen or the tab is hidden, and resumes cleanly. Reduced motion: no canvas.

**Performance budget** (mobile, Slow 4G, 4x CPU): the H1 stays the LCP element, CLS 0, hero JS under 15 KB gzipped, idle scripting under 4ms per frame (measured 0.22ms). The intro is the one sanctioned motion longer than 300ms.

## Apple design principles we apply

From the `apple-design` skill, the principles this site uses:

1. **Restraint (simplicity, not minimalism).** Every element earns its place. One clear action per section, which here is booking the free lesson. Hierarchy comes from order, spacing and contrast, not decoration. One authored motion moment per page rather than an entrance on every section.
2. **Typography with size-specific tracking and leading.** Large serif display text gets negative tracking and tight leading. Body text stays near zero tracking with comfortable leading, and small labels get positive tracking. Spacing is in `rem`, so the layout scales with the user's text size.
3. **Spring motion that is interruptible.** Anything a person touches uses springs (Motion), critically damped by default (`bounce: 0`), so motion starts from the current on-screen value and can be reversed mid-flight. Bounce is reserved for interactions that carry momentum. Only `transform` and `opacity` are animated on hot paths.
4. **Instant response.** Press feedback happens on pointer-down (`active:scale-[0.97]` over 100ms). No artificial delays on the input path.
5. **Spatial consistency.** Things leave the way they came in. Popovers and menus scale from their trigger, not their centre.
6. **Reduced motion means gentler, not nothing.** Under `prefers-reduced-motion`, slides and springs become short cross-fades or static changes, and overshoot is dropped. Also honour `prefers-reduced-transparency` (solid surfaces) and `prefers-contrast: more`.
7. **Craft in the browser surfaces.** Selection colour, focus rings, underline offsets and scrollbars are themed from the palette rather than left at browser defaults.

## Avoid

Purple gradients, glassmorphism everywhere, emoji-heavy copy, stock "kids on laptops" imagery, generic three-column icon feature grids, Inter, eyebrow labels above headings, and gradient text.
