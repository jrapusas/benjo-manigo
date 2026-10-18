# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7, Keystatic (`@keystatic/core`, `@keystatic/astro`), TypeScript (strict), Tailwind CSS 4, React (Keystatic admin UI and DocumentRenderer only), GSAP + Lenis (motion), Markdoc, Vitest. Static output deployed to Cloudflare Pages (or any static host). Node 22+.

## Users

**Primary:** Agency developers who clone, customize, and ship client websites from this starter.

**Secondary (indirect):** Non-technical content editors who maintain site content through Keystatic after a developer has set up the project.

**Tertiary (indirect):** Public website visitors who consume the deployed demo/client site.

## Product Purpose

A production-quality agency website starter that replaces a typical WordPress + ACF Pro + Gutenberg blocks workflow with Astro + Keystatic + Git + static hosting. Developers get a typed, block-based CMS with Git-versioned content, a static public site with minimal JavaScript, and a clear path from local editing through staging to production deploy.

Success means the starter ships with a demo site credible enough to deploy live and attract agency clients or leads - demonstrating both the technical architecture and the design quality clients can expect.

## Positioning

Unlike generic Astro starters or headless CMS templates, this project encodes a full agency delivery workflow: shared block schemas and renderers, Keystatic `fields.blocks()` parity with ACF-style page building, a staging-via-Git review loop, and a CORE vs SITE separation that makes per-client customization predictable. The demo site is not a toy - it is the proof that the stack produces real marketing sites.

## Operating Context

- **Local dev:** `npm run dev` serves the public site at `http://localhost:4321` and Keystatic admin at `/keystatic`.
- **Content editing:** Clients edit structured blocks in Keystatic, commit to Git, review on a staging build, then approve production deploy.
- **Build:** `npm run build` outputs static HTML to `dist/`. Keystatic admin is excluded from production builds.
- **CMS in production:** Editors run locally, or CMS is hosted separately (GitHub storage mode, or a branch with Keystatic enabled).
- **Dev-only routes:** `/blocks` and `/blocks-extreme` are showcase pages excluded from sitemap and production navigation.

## Capabilities and Constraints

**Capabilities:**
- 20+ typed content blocks (Hero, Rich Text, Feature Grid, Testimonials, FAQ, CTA, Pricing, Team, Timeline, etc.)
- Pages and posts share the same block system
- Site singleton for navigation and footer (`src/content/site.yaml`)
- SEO fields, sitemap, robots.txt
- Color theme generation from `src/content/colors.yaml`
- Motion system (GSAP reveal, Lenis smooth scroll)
- Media library with Keystatic admin thumbnails

**Constraints:**
- Public site is fully static - no database, no runtime API
- Keystatic admin requires Node.js and is not bundled in production builds
- Block content lives in YAML + Markdoc under `src/content/`
- Per-client branding swaps via `src/config/site.ts` and content files

**Open decisions:**
- None currently tracked.

## Brand Commitments

**Artist:** Jonathan “Benjo” Manigo — Filipino oil painter. Tagline: custom oil paintings. Locale: en-PH. Commission inquiries via `/commission` (no public price list).

**Visual direction** (`.context/project/.impeccable/surfaces/home.md`): warm charcoal ink (`#2a2826`), off-white mats (`#f7f5f2`), muted gold CTA accent (`#b8a066`). Typography: **Source Serif 4** headings, **DM Sans** UI/body.

## Evidence on Hand

- **Pages:** Home, About, Work (+ 8 category galleries), Commission, Thank you
- **Gallery:** 47 WebP assets under `public/images/gallery/` (sync from JA2B `images/`)
- **Inquiry:** `POST /api/inquiry` + commission form (§11–16 SPECS)
- **No fabricated testimonials or sales metrics**

## Product Principles

1. **Blocks over templates** - Page layout comes from CMS block sequences, not hard-coded templates.
2. **Git is the source of truth** - Content changes flow through version control, not a database.
3. **Static by default** - The public site ships zero server dependencies; performance and hosting cost are non-negotiable.
4. **CORE vs SITE separation** - Reusable block infrastructure stays stable; per-client branding and content swap cleanly.
5. **Staging is the preview** - The deployed staging site is the visual review surface, not an in-admin WYSIWYG.

## Accessibility & Inclusion

No product-specific accessibility standard mandated yet. Demo site should meet baseline WCAG practices as a quality signal for agency clients. Formal compliance target (e.g. WCAG 2.1 AA) to be set per client project.
