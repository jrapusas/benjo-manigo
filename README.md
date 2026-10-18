# Benjo Manigo — artist website

**Client:** Jonathan “Benjo” Manigo — oil painter. Astro + Keystatic site cloned from `~/Documents/astro_keystatic/`. Product spec: `.context/project` (JA2B). Run `npm run gallery:sync` after new brain images.

---

# Astro + Keystatic Block CMS Starter

Production-quality proof of concept for an agency website starter that replaces a typical **WordPress + ACF Pro + Gutenberg blocks + ACF WYSIWYG** workflow with **Astro + Keystatic + Git + static hosting**.

The public site is **Jonathan “Benjo” Manigo** — Filipino oil painter (commissions + gallery). Keystatic still powers editable page blocks; gallery JPEGs sync from JA2B.

## What this is

- **Block-based CMS** - Pages and Posts are built from reusable, typed content blocks
- **Git-based content** - All content lives in the repository as YAML + Markdoc files
- **Static public site** - No database, no runtime API, deployable to Cloudflare Pages (or any static host)
- **Keystatic admin** - Structured block editor for clients (not a visual page builder)

## Architecture

```
                ┌───────────────┐
                │   Keystatic   │
                │     CMS       │
                └───────┬───────┘
                        │
                        ↓
                ┌───────────────┐
                │     Git       │
                │    GitHub     │
                └───────┬───────┘
                        │
                        ↓
                ┌───────────────┐
                │     Astro     │
                │     Build     │
                └───────┬───────┘
                        │
                        ↓
                ┌───────────────┐
                │ Static Website│
                │   Cloudflare  │
                └───────────────┘
```

| Layer | Technology | Role |
|-------|------------|------|
| CMS | Keystatic | Block editor, content schemas, Git storage |
| Content | YAML + Markdoc | Human-readable, version-controlled files |
| Site | Astro 7 + TypeScript | Static site generation |
| Styling | Tailwind CSS 4 | Design system |
| Hosting | Cloudflare Pages / Workers | Free tier; static pages + on-demand CMS routes |

### CMS vs public site

- **Public pages** - Prerendered to static HTML at build time (fast CDN delivery).
- **CMS (`/keystatic`)** - On-demand routes on Cloudflare via `@astrojs/cloudflare`. In production, Keystatic uses **GitHub storage** so editors can log in from any browser.

Local dev still uses filesystem storage - no GitHub App required until you deploy.

## Quick start

```bash
npm install
npm run dev
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Astro dev server + Keystatic admin |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Preview production build locally |

- **Website:** http://localhost:4321
- **Keystatic admin:** http://localhost:4321/keystatic

## Why Keystatic?

Keystatic provides a first-class admin UI for Git-based content with:

- Native **`fields.blocks()`** for structured block editing
- Native **`fields.document()`** for rich text inside blocks
- Type-safe **Reader API** for Astro
- No database or external CMS service

Clients edit structured blocks in Keystatic, save to Git, and review changes on a **staging website** - the staging site is the visual preview, not an in-admin WYSIWYG page builder.

## Why static?

- Minimal JavaScript on the public site
- Fast global delivery via CDN
- Free-tier hosting on Cloudflare Pages
- No server maintenance for visitors
- Content changes flow through Git → build → deploy

## Pages

Pages live in `src/content/pages/*/index.yaml` and are rendered dynamically from their `blocks[]` array.

| Route | Content slug |
|-------|----------------|
| `/` | `home` |
| `/about` | `about` |
| `/services` | `services` |

Page schema (`keystatic.config.ts`):

- Title (slug)
- SEO fields
- **Content Blocks** (shared block system)

Templates do **not** hard-code layout - only the block sequence from CMS content determines the page.

## Posts

Posts live in `src/content/posts/*/index.yaml` with:

- Title, excerpt, published date, featured image
- SEO fields
- **Content Blocks** (same system as pages)

| Route | Purpose |
|-------|---------|
| `/blog` | Listing (title, excerpt, image, date) |
| `/blog/[slug]` | Individual post with dynamic blocks |

## Blocks

Seven block types are included:

| Block | Purpose |
|-------|---------|
| **Hero** | Page/post header with CTA, image, variants |
| **Rich Text** | Rich editorial content (escape hatch) |
| **Image + Text** | Side-by-side image and content |
| **Feature Grid** | Card grid for services/features |
| **Testimonials** | Client quotes |
| **FAQ** | Collapsible Q&A |
| **Call to Action** | Conversion section |
| **Logo Grid** | Client/partner logos |
| **Pricing** | Plan comparison cards |
| **Team** | People profiles |
| **Stats** | Key metrics highlight |
| **Gallery** | Image grid with captions |
| **Video** | YouTube/Vimeo embed |
| **Contact Details** | Email, phone, address |
| **Related Posts** | Linked blog post cards |
| **Services List** | Detailed service rows |
| **Map** | Address + embed map |
| **Timeline** | Company history / milestones |
| **Email Signup** | Subscribe CTA (heading + button, not a form) |
| **Process Steps** | Numbered how-it-works steps |

### How blocks work

1. **Schema** - Defined once in `src/keystatic/blocks.ts` using `fields.blocks()`
2. **Storage** - Saved as YAML in page/post content files
3. **Components** - Each block maps to `src/components/blocks/*.astro`
4. **Renderer** - `src/components/blocks/Blocks.astro` + `src/lib/blocks.ts` type-safe mapping

```
CMS block type  →  Block renderer  →  Astro component
hero            →  blockComponents →  Hero.astro
richText        →  blockComponents →  RichText.astro
emailSignup     →  blockComponents →  EmailSignup.astro
contactDetails  →  blockComponents →  ContactDetails.astro
...
```

Pages and posts share the **same** block definitions, components, and renderer.

### Rich Text block

The Rich Text block (`richText`) uses Keystatic's native `fields.document()` - not a custom rich text editor. It supports paragraphs, headings, bold, italic, links, lists, blockquotes, and tables where Keystatic allows.

It is **one block type inside the block editor**, not the page editor. Example page structure:

```
Hero → Rich Text → Feature Grid → Rich Text → CTA
```

## Staging workflow

```
Client edits in Keystatic
        ↓
Git commit / push
        ↓
Staging build (CI)
        ↓
Client reviews staging website
        ↓
Approval → Production deploy
```

The staging website **is** the visual preview. No separate in-CMS page preview is required.

## Adding a new block

1. **Create Astro component** - `src/components/blocks/MyBlock.astro`
2. **Define Keystatic schema** - Add to `src/keystatic/blocks.ts` inside `fields.blocks()`, wrapped in `fields.object({ ... })`
3. **Register in renderer** - Add mapping in `src/lib/blocks.ts`
4. **Add sample content** - Use the block in a page or post YAML file
5. **Rebuild** - `npm run build`

Example schema entry:

```ts
myBlock: {
  label: 'My Block',
  schema: fields.object({
    heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
  }),
},
```

## Project structure

```
src/
  components/
    blocks/          # Block Astro components + Blocks.astro renderer
    ui/              # Button, Container, Section
    react/           # DocumentContent (Keystatic DocumentRenderer)
  config/
    site.ts          # Client branding defaults (swap per project)
  content/
    site/            # Site settings singleton (nav, footer)
    pages/           # Page content (YAML + linked .mdoc)
    posts/           # Post content
  keystatic/
    blocks.ts        # Shared block schemas
    fields.ts        # SEO, buttons, rich text helpers
  layouts/           # BaseLayout, PageLayout, PostLayout
  lib/
    blocks.ts        # Type-safe block component map
    reader.ts        # Keystatic reader instance
    seo.ts           # SEO helpers
    types.ts         # Shared TypeScript types
  pages/             # Astro routes
keystatic.config.ts  # Keystatic CMS config
astro.config.mjs
```

### CORE vs SITE

| CORE (reusable) | SITE (per client) |
|-----------------|-------------------|
| Block schemas & components | `src/config/site.ts` branding |
| Renderer & UI primitives | Content in `src/content/` |
| Keystatic field helpers | Navigation in site singleton |

## SEO

Pages and posts support:

- SEO title, meta description, canonical URL
- Open Graph title, description, image

Also included:

- `@astrojs/sitemap` - auto-generated sitemap
- `public/robots.txt`
- `public/favicon.svg`

## Images

CMS-uploaded images are stored under `public/images/` with predictable paths configured in the Keystatic schema (`directory` + `publicPath`). No runtime image server is required.

## Deployment

### Cloudflare Pages + GitHub CMS (free tier)

The site uses **static prerendering** for public pages and **on-demand routes** for `/keystatic` and `/api/keystatic/*` via `@astrojs/cloudflare`.

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist/client` (also set in `wrangler.jsonc` as `pages_build_output_dir`) |
| Node version | `22` (`.nvmrc` / `NODE_VERSION` env) |

Build command is declared in `wrangler.jsonc` (`build.command`). If a deploy log still says **No build command specified**, set **Build command** to `npm run build` in the Pages dashboard as well (some project types only read one source).

Do **not** set the output directory to the repo root (`.`). A broken `.context/project` symlink used to live in git and triggers: *build output directory contains links to files that can't be accessed*.

#### 1. Create a GitHub App

At [github.com/settings/apps/new](https://github.com/settings/apps/new):

- **Homepage URL:** `https://your-domain.pages.dev`
- **Callback URL:** `https://your-domain.pages.dev/api/keystatic/github/oauth/callback`
- **Webhook:** inactive

Install the app on your content repo and note the **Client ID**, **Client Secret**, and **App slug**.

#### 2. Set Cloudflare environment variables

In **Pages → Settings → Environment variables** (Production and Preview):

| Variable | Value |
|----------|-------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | from GitHub App |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | from GitHub App |
| `KEYSTATIC_SECRET` | random string, 32+ chars |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | app slug |
| `KEYSTATIC_GITHUB_REPO` | `owner/repo` |

Copy `.env.example` for local reference.

#### 3. Enable `nodejs_compat`

In **Pages → Settings → Functions → Compatibility flags**, add `nodejs_compat` for Production and Preview. This is also declared in `wrangler.jsonc`.

#### 4. Deploy and log in

Push to GitHub (or connect the repo in Cloudflare Pages). After deploy, visit `https://your-domain.pages.dev/keystatic` and sign in with GitHub. Editors need **write** access to the repo.

Content saves commit to GitHub; Cloudflare rebuilds the static site automatically (~30–90s).

### Local-only editing (no GitHub App)

Skip the env vars above. Run `npm run dev`, edit at `/keystatic`, commit, and push. Keystatic uses local filesystem storage in development.

## Tech stack

- Astro 7
- Keystatic (`@keystatic/core`, `@keystatic/astro`)
- TypeScript (strict)
- Tailwind CSS 4
- React (Keystatic admin UI + DocumentRenderer only)

## License

MIT - use as an agency starter template.
