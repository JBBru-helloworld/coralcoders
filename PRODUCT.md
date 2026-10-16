# Product

<!-- impeccable:product-schema 1 -->

<!-- Written in Phase 1 from the owner's project brief, which pre-answered the init interview. -->

## Platform

web

## Users

- **Primary:** parents of children aged 6 to 16 in Mauritius and South Africa, choosing an online coding tutor for their child. They are judging trust, fit for their child's age, and how easy it is to get started.
- **Secondary:** adults learning Python, SQL and AI: working professionals and university students who want 1:1 tuition around their schedule.

## Product Purpose

Marketing site for Coral Coders, an online 1:1 coding tutoring business. Success is a visitor booking a free first lesson, through WhatsApp (primary) or email (secondary).

## Positioning

One-to-one, online, with a single named tutor, rather than group classes or a self-paced platform. The first lesson is free and pricing is custom to each learner's schedule.

## Operating Context

- Lessons happen online, so location only matters for time zones and local trust (Mauritius and South Africa).
- Enquiries go straight to the tutor on WhatsApp with a pre-filled message, or to email. There is no backend, form, account or checkout.
- The site is a statically exported one-page homepage with anchor navigation, plus dedicated course pages.

## Capabilities and Constraints

- **Kids courses:** Scratch (ages 6+), Python (ages 9+), AI and Machine Learning (ages 12+).
- **Adult courses:** Python, SQL, and Machine Learning / Prompt Engineering / AI.
- **Primary action:** "Book a free lesson" opens WhatsApp (`+230 5479 2689`) with a pre-filled message. **Secondary action:** a `mailto:` link to `coralcoderz@gmail.com`.
- **Never show prices.** Use: "Enquire for custom pricing that suits your schedule or your child's."
- Static export only (Next.js `output: "export"`). The domain is not final and is read from `NEXT_PUBLIC_SITE_URL`.
- All contact details and the business name come from `src/lib/site.ts`, so they are identical everywhere (local SEO).

## Brand Commitments

- Name: **Coral Coders**. Instagram `@coralcoders`.
- Copy: UK English (colour, organise, programme, enrol). No em dashes. Not emoji-heavy.
- Feeling the owner made binding: elegant, calm, modern and trustworthy, with a warm, playful edge. A premium independent studio, not a generic edtech template or a children's cartoon site.
- References in spirit: Apple product pages (restraint, typography, motion), Linear and Vercel marketing sites (precision), coral reef and island light (warmth).
- Fixed palette, type and motion rules: see `docs/DESIGN.md`.
- Avoid: purple gradients, glassmorphism everywhere, stock "kids on laptops" imagery, generic three-column icon feature grids, Inter.

## Evidence on Hand

- Logo: owner is supplying `public/brand/logo.svg` (or `logo.png`) and optionally `logo-mark.svg`.
- Tutor portrait: owner is supplying `public/images/tutor/joshua-bonham.jpg`.
- No testimonials, reviews, learner numbers, results or credentials have been supplied. Do not invent any.

## Product Principles

1. Every page leads to one action: book the free lesson.
2. Earn a parent's trust through clarity and calm, not hype.
3. Speak to children's progress and adults' goals separately; never blur the two audiences.
4. Be honest: no prices, no fabricated proof.

## Accessibility & Inclusion

WCAG 2.2 AA. Respect `prefers-reduced-motion`. Text contrast at least 4.5:1, focus indicators at least 3:1.
