# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

From the project root:

```bash
npm run dev          # frontend only (localhost:5173)
npm run dev:studio   # Sanity Studio only (localhost:3333)
npm run build        # production build of the frontend
npm run lint         # ESLint
```

Both apps must be started separately — there is no single command that runs them concurrently.

From `studio/`:

```bash
npx sanity dataset import <file.ndjson> production  # bulk-import content (seed.ndjson exists)
npx sanity deploy                                    # deploy Studio to sanity.io
```

Content migration from the live Framer site:

```bash
node import/scrape-framer.mjs                        # theneighborr.com → import/framer-content.json
node import/import-framer.mjs                        # dry run: prints the plan, writes nothing
SANITY_TOKEN=<token> node import/import-framer.mjs --write
```

## Architecture

This is a monorepo with two apps sharing the same directory:

- **Root** — Vite + React frontend (`src/`, `index.html`, `vite.config.js`)
- **`studio/`** — Sanity Studio v3 (separate `package.json`, runs independently)

### Frontend (`src/`)

- `main.jsx` → mounts React
- `App.jsx` → routing shell; `Layout.jsx` holds the header, phone menu overlay, routes and `Footer`
- Per-component CSS files next to each component (no CSS modules or Tailwind)
- `AboutPage.jsx` — static copy from `i18n.js` (`aboutParagraphs`, `founders`); avatars in `public/about/`
- `PortraitCard.jsx` + `PortraitAnimation.jsx` — Framer's Portrait Vignette: a 110×110 sprite slot over a 300px centred text block. `portraitAnimations.js` is a hand-transcribed spec of the seven portrait loops (frames, mirrors, per-step positions, dwell times), sourced from the Framer MCP node XML and the published component chunks and verified against recordings of the live site. Sprites live in `public/portraits/`; do not regenerate this file from the chunks — that path was tried and is unreliable.
- `src/sanity/client.js` — Sanity client + `urlFor()` image helper
- `src/sanity/queries.js` — GROQ query (`getArticlesBySection`)
- `i18n.js` — bilingual strings and section labels for `en` / `fr`

### Routing and Bilingualism

URL structure: `/:lang/:section` (e.g. `/en/fiction-poetry`, `/fr/literature-review`).

- `/` redirects to `/en`; `/:lang` is the Latest page (articles whose `featured` names that language)
- `/:lang/about` is the About page; Donate links out to `https://buymeacoffee.com/theneighbor`
- `lang` param is `en` or `fr`; `i18n.js` drives all translated labels and section listings
- `Layout` reads `lang` from the URL and passes it to queries so only articles with the matching `language` field are fetched
- The language selector opens a small row with the other language (as on Framer); choosing it navigates to the same section under the alternate lang prefix
- Appear animations follow Framer's inline definitions: section pages lift `.main` at 0.4s (bouncy spring) then card text groups at 0.5s/0.55s; article pages stagger title/byline/body at 0.15/0.2/0.3s. Keyframes and easings live in `index.css`.

### Breakpoints

The four Framer breakpoints are used verbatim: ≥1200 / 900–1199 / 700–899 / ≤699. Below 700 the header collapses to one 60px row with a hamburger and the sections nav moves into `menu-overlay`; article grids go 4/3/2/1 columns and portrait grids use 70px (90px on phone) row gaps.

### The Neighborhood Page

`NeighborhoodPage.jsx` is a special interactive canvas — not a standard article section. It:

- Fetches community members from an external REST API (`https://the-neighbor.onrender.com/community`)
- Lays out member portrait images using a golden-angle spiral
- Supports pointer drag-to-pan with momentum/friction physics
- Shows a tooltip overlay (via `ReactDOM.createPortal`) on hover with member details

### Sanity (`studio/`)

- One document type: `article` (`studio/schemas/article.js`)
- Core fields: `title`, `slug`, `language` (`en`/`fr`), `section`, `category`, `author`, `excerpt`, `mainImage`, `body`, `publishedAt`
- Additional fields: `poems` (array of titled poem objects with block content), `translationSlug` (links to the translated version), `audioFile` (URL), `audioQuote`, `featured` (`NO`/`YES`/`English`/`French`)
- `section` enum: `fiction-poetry`, `literature-review`, `the-arts`, `portraits` (The Neighborhood is frontend-only, not a Sanity section)
- Studio sidebar: Language → Section → articles (writers never touch the language or section dropdowns directly)
- Sanity project ID: `9hw8z0gm`, dataset: `production`

### Content migration (`import/`)

The live Framer site at theneighborr.com is the source of truth for content until
the cutover. Two scripts keep Sanity in step with it:

- `scrape-framer.mjs` — walks the sitemap's section pages and entry pages and writes
  `framer-content.json`. Framer emits every text block once per responsive
  breakpoint, so the scraper detects the repeat cycle and keeps one copy. Section
  listing cards supply `category`, `excerpt` and `mainImage` (entry pages omit
  them); the two homepages supply `featured`, since each renders exactly the
  entries flagged for its language. Fetched HTML is cached in `import/.framer-cache`.
- `import-framer.mjs` — upserts that JSON into Sanity. Dry run by default. Document
  ids follow the original `article-<de-accented-slug>` scheme so entries update in
  place rather than duplicating. `translationSlug`, `audioFile` and `audioQuote`
  are not rendered by Framer, so they are carried over from the existing document;
  unpaired translations are reported for manual linking. Every `--write` first
  dumps the current dataset to `import/backup-<timestamp>.ndjson`.

`Articles.csv` / `import.mjs` are the earlier one-off CSV import. That export
dropped pull-quote and attribution paragraphs and mangled typographic
apostrophes, so prefer the scraper.

### Fonts

- **NeighborFont** (proprietary) — served locally from `public/` as `.otf` files, declared via `@font-face` in `index.css`
- **EB Garamond** + **Geist Mono** — loaded from Google Fonts via `<link>` in `index.html`

### CORS

`localhost:5173` must be in the allowed CORS origins for the Sanity project (sanity.io/manage → API → CORS Origins) for the frontend to fetch data in development.
