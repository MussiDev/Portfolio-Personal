# Joaquín Mussi — Portfolio

**Live:** [joaquinmussi.com.ar](https://joaquinmussi.com.ar)

Personal portfolio built as a "nervous system": a navigable 3D brain (Three.js) works as the site's index, with continuous scroll between sections, visual signals connecting the brain to the content, and bilingual content (ES/EN) served from Sanity CMS.

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.1.6 |
| UI | React | ^19.2.4 |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | ^3.4.1 |
| 3D | Three.js | ^0.186.0 |
| CMS | Sanity (`next-sanity`) | ^12.1.0 / ^5.11.0 |
| Rich content | `@portabletext/react`, `react-markdown`, `mermaid` | — |
| Contact form | EmailJS (REST API, from the server) + Google reCAPTCHA v3 | — |
| Tests | `node:test` (native, no dependencies) | — |

## Features

- **3D brain as navigation** — six brain regions are the site's main navigation; hovering fires a guide line and the camera flies to that region
- **Continuous nervous system** — a signal cord with a pulse/flow connects the brain to the content as you scroll
- **Custom binary for the 3D model** — `scripts/prepare-brain.mjs` converts the source `.glb` (3 MB) into a quantized binary (`brain.<hash>.bin`, ~460 KB) that's stream-parsed on the client; the name carries a content hash so it can be served with a year-long immutable cache
- **Bilingual (ES/EN)** — Spanish with no prefix, English under `/en`, with correct per-route `hreflang` and `<html lang>`
- **Blog connected to Sanity** — posts in Portable Text or Markdown, with embedded Mermaid diagrams
- **Dynamic, localized OG image** — `next/og`, prerendered per language
- **Contact form** — React 19 `useActionState` + reCAPTCHA v3 (invisible) deferred until the user reaches the form. `/api/contact` validates the message, verifies the captcha, and only then sends it through EmailJS's REST API with the private key: the browser never talks to EmailJS
- **Accessible** — reduced-motion respected in the cursor and animations, navigation regions as `<a>` inside `<nav>`, skip link
- **CI on GitHub Actions** — type-check, tests and build on every push/PR

## Project structure

```
├── app/
│   ├── (nervous-system)/[lang]/     # Bilingual routes (home, layout, blog)
│   │   ├── layout.tsx               # <html lang>, fonts, JSON-LD, metadata
│   │   ├── page.tsx                 # Section composition
│   │   ├── opengraph-image.tsx      # Localized OG image (SSG per language)
│   │   └── blog/[slug]/             # Individual post
│   ├── studio/                      # Embedded Sanity Studio (/studio)
│   ├── robots.ts / sitemap.ts       # SEO
│   └── src/
│       ├── common/                  # Brain3D, NervousSystem, Cursor, etc.
│       ├── components/Blog/         # MermaidDiagram, ReadingProgress
│       ├── components/Workshop/     # ContactForm
│       └── i18n/                    # ES/EN dictionary and metadata helpers
├── api/                             # JSON data (experience, projects, recommendations)
├── entities/                        # Domain types + pure tests (node:test)
├── sanity/                          # Sanity client, queries and schema
├── scripts/prepare-brain.mjs        # Generates public/image/brain.<hash>.bin and app/src/common/brainAsset.ts
├── proxy.ts                         # Per-language routing + /studio gate (Next 16's "proxy" convention, replaces middleware.ts)
└── .github/workflows/ci.yml         # tsc + tests + build in CI
```

## Environment variables

Create a `.env.local` in the project root:

```env
# Site
NEXT_PUBLIC_SITE_URL=https://joaquinmussi.com.ar

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
STUDIO_SECRET=a_secret_to_access_/studio

# EmailJS (used only from /api/contact, on the server)
NEXT_PUBLIC_SERVICE_ID=your_service_id
NEXT_PUBLIC_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

# Google reCAPTCHA v3
NEXT_PUBLIC_FIRSTCAPTCHA=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

**EmailJS from the server:** in the EmailJS dashboard (Account → Security) enable *"Allow EmailJS API for non-browser applications"* (without this it rejects submissions from `/api/contact`) and *"Use Private Key"* (without this anyone can keep sending mail with the public key, bypassing the captcha). Without `EMAILJS_PRIVATE_KEY` the form responds with an error: it fails closed.

`NEXT_PUBLIC_SITE_URL` sets the canonical domain used in metadata, the sitemap, robots and OG images (`entities/site.ts`). If it isn't set, it falls back to `https://joaquinmussi.com.ar`. **It must be set on Railway** with the real production domain — if it points to a domain that doesn't resolve, the canonical, the sitemap and the OG images end up broken in production.

`NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` also need to be loaded as repository **Secrets** on GitHub (Settings → Secrets and variables → Actions) so CI's build step can read Sanity's content.

## Running it

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Regenerate the 3D brain binary (if assets/brain_areas.glb is replaced)
pnpm run brain

# Type-check
pnpm exec tsc --noEmit

# Tests
pnpm test

# Production build
pnpm run build

# Production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** run `pnpm run build && pnpm start` before measuring with Lighthouse — `pnpm run dev` doesn't minify or tree-shake, and that distorts the performance metrics.

## Adding content

| Content | Source |
|---|---|
| Work experience | `api/experienceItems.json` |
| Main project (NorteAR) | `api/projects.json` |
| Other projects | `api/workProjects.json` |
| Certifications | `api/certifications.json` |
| Languages | `api/languages.json` |
| Recommendations | `api/recommendations.json` |
| "What I discarded" | `api/descartes.json` |
| Blog posts | Sanity Studio (`/studio`) |
| UI copy (ES/EN) | `app/src/i18n/dict.ts` |
