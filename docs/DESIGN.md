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
- No glassmorphism as decoration. Translucency is allowed only where it does a job (for example a sticky nav over scrolling content) and must fall back to solid under `prefers-reduced-transparency`.
- Light is the default. An ink section is made by adding the `dark` class to that section, which remaps shadcn's semantic variables. It is never set on `<html>`, and there is no theme toggle.

## Typography

- **Display and headings:** Instrument Serif (400, with italic). Size and space create hierarchy, not weight.
- **Body and UI:** Geist Sans.
- **Code accents, small labels, measurements:** Geist Mono. Use it for real code or data, never as a "techy" costume.
- All three are self-hosted at build time through `next/font/google`.

Fluid scale (Tailwind utilities `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-label`), clamped between the 390px and 1440px viewports:

| Step | Size | Leading | Tracking |
|---|---|---|---|
| display | 3rem to 6rem | 0.98 | -0.025em |
| h1 | 2.5rem to 4.25rem | 1.02 | -0.02em |
| h2 | 2rem to 3rem | 1.08 | -0.015em |
| h3 | 1.5rem to 2rem | 1.15 | -0.01em |
| lead | 1.125rem to 1.3125rem | 1.55 | -0.005em |
| body | 1rem | 1.6 | 0 |
| small | 0.875rem | 1.5 | 0.005em |
| label | 0.75rem | 1.4 | 0.08em |

Body copy stays within 60 to 75 characters per line.

## Motion

| Token | Value |
|---|---|
| `--duration-instant` | 100ms (press feedback) |
| `--duration-fast` | 160ms (hover, colour) |
| `--duration-base` | 220ms (small reveals) |
| `--duration-slow` | 300ms (the ceiling for any UI transition) |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `ease-press` | `cubic-bezier(0.3, 0, 0.2, 1)` |
| `spring` (TS) | `{ type: "spring", bounce: 0, duration: 0.3 }` |
| `springMomentum` (TS) | `{ type: "spring", bounce: 0.2, duration: 0.3 }` |

`prefers-reduced-motion: reduce` is respected globally: CSS animation and transition durations collapse, smooth scrolling is turned off, and `MotionConfig reducedMotion="user"` wraps the app.

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
