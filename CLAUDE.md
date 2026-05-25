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

## Architecture

This is a monorepo with two apps sharing the same directory:

- **Root** — Vite + React frontend (`src/`, `index.html`, `vite.config.js`)
- **`studio/`** — Sanity Studio v3 (separate `package.json`, runs independently)

### Frontend (`src/`)

- `main.jsx` → mounts React
- `App.jsx` → routing shell + `ArticleCard`, `SectionPage`, `Layout` components
- `App.css` → all component styles (no CSS modules or Tailwind)
- `src/sanity/client.js` — Sanity client + `urlFor()` image helper
- `src/sanity/queries.js` — GROQ query (`getArticlesBySection`)
- `i18n.js` — bilingual strings and section labels for `en` / `fr`

### Routing and Bilingualism

URL structure: `/:lang/:section` (e.g. `/en/fiction-poetry`, `/fr/literature-review`).

- `/` and `/:lang` both redirect to `/en/literature-review`
- `lang` param is `en` or `fr`; `i18n.js` drives all translated labels and section listings
- `Layout` reads `lang` from the URL and passes it to queries so only articles with the matching `language` field are fetched
- The language switcher navigates to the same section under the alternate lang prefix

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

### Fonts

- **NeighborFont** (proprietary) — served locally from `public/` as `.otf` files, declared via `@font-face` in `index.css`
- **EB Garamond** + **Geist Mono** — loaded from Google Fonts via `<link>` in `index.html`

### CORS

`localhost:5173` must be in the allowed CORS origins for the Sanity project (sanity.io/manage → API → CORS Origins) for the frontend to fetch data in development.
