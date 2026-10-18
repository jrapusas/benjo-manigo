---
name: Benjo Manigo — Gallery Vitrine
description: Exhibition-wall marketing system for a Filipino oil painter — charcoal gallery, off-white mats, gold commission CTA.
colors:
  wall: "#2a2826"
  mat: "#f7f5f2"
  ink: "#2a2826"
  ink-muted: "#5c534c"
  accent-gold: "#b8a066"
  accent-gold-hover: "#a08d58"
  accent-on-gold: "#1a1816"
typography:
  display:
    fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif'
  body:
    fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif'
---

# Design system: Gallery Vitrine

## Overview

**North star:** A gallery wall that happens to sell commissions. Paintings sit in off-white mats at exhibition scale; UI is placard-quiet; muted gold appears only on primary actions and focus.

**Visitor mode:** Experience on home, work, and about; Persuade (commission) only on `/commission` (+ `/thanks`).

**Stack:** Astro blocks + `data-color` × `data-appearance` from `src/content/colors.yaml` (custom mat/ink/gold primitives). Site chrome in `src/styles/vitrine.css`.

## Colors

| Role | Token / hex | Use |
|------|-------------|-----|
| Gallery wall | `#2a2826` | Header, footer, dark section bands (`appearance: dark`) |
| Mat | `#f7f5f2` | Page ground, painting mats, elevated cards on wall |
| Ink | `#2a2826` | Body text on mat |
| Gold CTA | `#b8a066` | Primary buttons, focus rings — not full UI chrome |
| On gold | `#1a1816` | Button label on gold |

**Rules:** Paintings carry saturation. No gradient marketing washes on hero (dark wall + mat frame). Links on mat are warm brown, not blue.

## Typography

- **Display:** Source Serif 4 — artist name, section headings, hero title.
- **UI / placard:** DM Sans — nav, form, category labels (`.block-placard`, `.hero-placard`: uppercase, tracked small caps).
- **No eyebrows above headings** — medium/placard line sits **below** the hero title when needed.

## Layout

- **Hero:** Split layout — copy left, matted painting right (mobile: image then copy). `art-mat` frame hugs the painting's real proportions (no forced aspect, no crop). Title sizes to its column (`cqi`) so long words never split.
- **Featured grid (home):** Salon hang (`.salon-hang`) — 12-col grid, 4-item rhythm (7/5, 5/6 spans with vertical offsets); each item is mat + uncropped painting + serif placard with hairline rule and "View genre →".
- **Work index:** Dark wall band for genre grid + labels; full masonry collection on mat (`appearance: default`) below.
- **Work / category:** Mat band with category title; masonry only (1 / 2 / 3 balanced columns at 640 / 960px container width).
- **Commission:** Dark hero → ruled process sequence (italic serif numerals, no cards) + expectations on mat → inquiry form on soft mat band.

## Components

- **Header:** Charcoal bar, light nav, gold primary CTA.
- **Footer:** Charcoal continuation of wall; serif "Benjo Manigo" signature, gold commission link, Work (2-col genres) + Site columns.
- **Cards on dark:** System flips nested cards to light mat surfaces automatically.
- **Lightbox:** Full-bleed dim wall; painting centered (existing behavior).

## Motion

- Subtle zoom on painting hover; salon mats lift on hover.
- One authored moment: paintings "settle onto the wall" (fade + rise + de-blur) via CSS scroll-driven `animation-timeline: view()`; static where unsupported or under `prefers-reduced-motion`.
- No carousel on hero; no decorative grid overlay on dark hero.

## Do / Don't

- **Do** keep a header/footer link to `/commission`; sell copy stays on the commission page only.
- **Do** use real gallery WebPs only.
- **Don't** invent prices, testimonials, or blue advisory styling.
- **Don't** label Christian work as "Religious."
