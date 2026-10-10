# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

From the project root:

```bash
npm run dev          # frontend only (localhost:5173)
npm run dev:studio   # Sanity Studio only (localhost:3333)
npm run build        # production build of the frontend + dist/sitemap.xml
npm run lint         # ESLint
```

Each app is started separately — there is no single command that runs them concurrently. The iOS app runs from `mobile/` (`npx expo start`, then Expo Go); see `mobile/CLAUDE.md`.

Deployment is through Vercel, not `sanity deploy`: the site is one Vercel project (root, Vite, served at `react.theneighborr.com`) and the Studio another (root directory `studio/`, served at `cms.theneighborr.com`). `scripts/vercel-build.mjs` picks which one to build when a project's root directory is left at the repo root. See the README's Deploy section. The mobile app is not deployed yet (no EAS config).

From `studio/`:

```bash
npx sanity dataset import <file.ndjson> production  # bulk-import content (seed.ndjson exists)
```

Content migration from the live Framer site:

```bash
node import/scrape-framer.mjs                        # theneighborr.com → import/framer-content.json
node import/import-framer.mjs                        # dry run: prints the plan, writes nothing
SANITY_TOKEN=<token> node import/import-framer.mjs --write
SANITY_TOKEN=<token> node import/seed-about.mjs      # (re)seed the about-en / about-fr documents
SANITY_TOKEN=<token> node import/assign-vignettes.mjs <dir> --write  # set main images from numbered vignettes (dry run without --write)
```

## Architecture

This is a monorepo with three apps, all reading the same Sanity dataset:

- **Root** — Vite + React website (`src/`, `index.html`, `vite.config.js`)
- **`studio/`** — Sanity Studio v3 (separate `package.json`, runs independently)
- **`mobile/`** — the iOS app, Expo + Expo Router (separate `package.json`). It has its own `mobile/CLAUDE.md`; read it before touching anything in `mobile/`. Most current work happens here.

Sanity stores four `section` values. The website, the app and the Studio sidebar all group them into the same three rubriques: Essays & Criticism (`literature-review` + `the-arts`), Prose & Poetry (`fiction-poetry`) and Portraits. Each has its own copy of the list, in `src/sections.js`, `mobile/src/sections.js` and `studio/structure.js`; change all three together. The website is bilingual and uses English URL slugs for both languages. The app is French-only for now and uses French slugs.

### Frontend (`src/`)

- `main.jsx` → mounts React
- `App.jsx` → routing shell; `Layout.jsx` holds the header, phone menu overlay, routes and `Footer`
- Per-component CSS files next to each component (no CSS modules or Tailwind)
- `ArticleCard.jsx` — the app's centred card (category, title, excerpt, full-width illustration, "de/by <author>", date), used by every list. Phones show it centred in one column, as in the app; from 700px the same card is set on the left in the 4/3/2-column grid (`ArticleGrid.jsx`), with one long hand-drawn `Rule.jsx` line across the grid between rows, none above the first or below the last (wider than 600px a rule is drawn as a pen stroke rather than the stretched drawing). Portraits there are an endless row (`PortraitStrip` in `ArticleGrid.jsx`: a move slides the track one card, then turns the list and puts the track back unseen; a copy of the previous card waits off the left edge) showing four cards (three below 900px) across the header line's width with two drawn arrows either side, moved by the arrows or the wheel, centred in the height under the title. A subtitle in the category type (`portraitsSubtitle` in `i18n.js`) tells readers to use the arrows. The lists drop the dinkus there and set their title on the left, 47px below the header's line and 47px above the first row (measured to the letters). `PageTitle.jsx` is the app's page title closed by a dinkus.
- `AboutPage.jsx` — set like the app's A Propos: a fixed heading per language (`aboutHeading` in `i18n.js`), then the `about-<lang>` document's body with a drop cap. The founders' avatars are not shown, as in the app.
- `VoisinagePage.jsx` + `account.jsx` — The Neighborhood: the app's Voisinage sign-up mock-up (nothing is sent; the account lives in memory)
- `BroadsheetPage.jsx` — `/broadsheet`, outside `Layout`: a standalone newspaper-style front page experiment with hard-coded issue details. It is not linked from the site.
- `PortraitCard.jsx` + `PortraitAnimation.jsx` — an `ArticleCard` with the portrait's animated sprite at the top, as in the app: Framer's 110×110 slot drawn at 100px (the app's size), the character standing at the slot's foot. `portraitAnimations.js` is a hand-transcribed spec of the seven portrait loops (frames, mirrors, per-step positions, dwell times), sourced from the Framer MCP node XML and the published component chunks and verified against recordings of the live site. Sprites live in `public/portraits/`; do not regenerate this file from the chunks — that path was tried and is unreliable. The iOS app plays the same spec and sprites (`mobile/src/PortraitAnimation.js`), so a change here changes both.
- `src/sanity/client.js` — Sanity client + `urlFor()` image helper
- `src/sanity/queries.js` — GROQ queries (`getArticlesBySection`, `getLatestArticles`, `getArticleBySlug`, `getAboutPage`)
- `sections.js` — the three rubriques (`essays-criticism`, `prose-poetry`, `portraits`), each with its Sanity sections. `rubriqueOf()` maps an article's `section` to its URL segment, and `LEGACY_SECTIONS` lists the pre-rubrique URLs.
- `i18n.js` — bilingual strings and nav labels (the three rubriques plus The Neighborhood) for `en` / `fr`
- `scripts/sitemap.mjs` writes `dist/sitemap.xml` after `vite build`, and `scripts/vercel-build.mjs` is the Vercel build entry

### Routing and Bilingualism

URL structure: `/:lang/:rubrique` and `/:lang/:rubrique/:slug` (e.g. `/en/prose-poetry`, `/fr/essays-criticism/<slug>`). Article URLs use the article's rubrique (`rubriqueOf(section)`); `ArticlePage` looks articles up by slug alone. The old section URLs (`/:lang/fiction-poetry`, `/literature-review`, `/the-arts`, with or without a slug) redirect to their rubrique, in `vercel.json` in production and through `LegacySection` routes in `Layout.jsx` in development. The Framer redirects in `vercel.json` point straight at the new URLs.

- `/` goes to `/fr` or `/en` by the visitor's location: `middleware.js` (Vercel Routing Middleware, production only) sends French-speaking countries and regions to `/fr`, unless the `lang` cookie (set by the language switch) says otherwise. In development `App.jsx` uses the cookie, else `/en`; `/:lang` is the Latest page (articles whose `featured` names that language)
- `/:lang/about` is the About page. `/:lang/neighborhood` is The Neighborhood (`VoisinagePage.jsx`). While `NEIGHBORHOOD_OPEN` in `src/sections.js` is false, it is left out of the nav, the phone menu and the sitemap, and its URL redirects to `/:lang`; it is true now. About sits in the sections nav after the three rubriques; there is no Donate link.
- `lang` param is `en` or `fr`; `i18n.js` drives all translated labels and section listings
- `Layout` reads `lang` from the URL and passes it to queries so only articles with the matching `language` field are fetched
- The language switch is "FR / EN" in the wide header (≥1200) and Framer's selector opening a row with the other language below that; either navigates to the same section under the alternate lang prefix and stores the choice in the `lang` cookie
- Appear animations follow Framer's inline definitions: section pages lift `.main` at 0.4s (bouncy spring) then card text groups at 0.5s/0.55s; article pages stagger title/byline/body at 0.15/0.2/0.3s. Keyframes and easings live in `index.css`.

### Breakpoints

Framer uses different breakpoints per page. The section pages' set (≥1200 / 900–1199 / 700–899 / ≤699) drives the article grids (4/3/2/1 columns); portraits are a sliding row on wider screens (four cards, three below 900px). The header follows the home page's set instead, measured on the live site, plus one of its own: ≥1200 a single 70px row (the rubriques left of a 30px centred wordmark, The Neighborhood, About and the language right of it, all on the wordmark's baseline, 50px in from each side, over a hand-drawn `Rule` instead of a border, the language as "FR / EN" with the current one in red); 1000–1199 desktop (wordmark centred, language selector ending 15px from the right, nav links with 60px gaps); 750–999 tablet (language at the right, nav gaps 35px), ≤749 phone (one 60px row: 25px hamburger at 15px, wordmark at 90px, language at the right; the sections nav moves into `menu-overlay`). The nav links are Averia Libre capitals, 14px, +0.06em, the current page in red. Under the fixed header the paper fades out over 30px as the page scrolls beneath it. Layout.css has the measured values.

### The old Neighborhood canvas

`NeighborhoodPage.jsx` is an earlier interactive canvas for The Neighborhood. It is no longer routed (`VoisinagePage.jsx` took its place). It:

- Fetches community members from an external REST API (`https://the-neighbor.onrender.com/community`)
- Lays out member portrait images using a golden-angle spiral
- Supports pointer drag-to-pan with momentum/friction physics
- Shows a tooltip overlay (via `ReactDOM.createPortal`) on hover with member details

### Sanity (`studio/`)

- Two document types: `article` (`studio/schemas/article.js`) and `aboutPage` (`studio/schemas/aboutPage.js`). There is one `aboutPage` per language, with fixed ids `about-en` / `about-fr`: `title`, `body`, `founders[]` (name + image).
- Article core fields: `title`, `slug`, `language` (`en`/`fr`), `section`, `category`, `author`, `excerpt`, `mainImage`, `body`, `publishedAt`
- Additional fields: `poems` (array of titled poem objects with block content), `translationSlug` (links to the translated version), `audioFile` (URL), `audioQuote`, `featured` (`NO`/`YES`/`English`/`French`)
- `section` enum: `fiction-poetry`, `literature-review`, `the-arts`, `portraits` (The Neighborhood is frontend-only, not a Sanity section)
- Studio sidebar (`studio/structure.js`): Language (Français first) → the app's three rubriques → articles, plus the About page for that language. Essais & Critiques covers both `literature-review` and `the-arts`, so creating an article there asks which of the two it is. An initial-value template fills `language` and `section`, so writers never set those fields by hand. The rubrique list here duplicates `mobile/src/sections.js`; change both together.
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

`assign-vignettes.mjs` sets articles' main images from a folder of vignettes
numbered per rubrique (`essais-critiques/1.png` is the oldest French essay). Each
image also goes to the article's translation. The slug-to-number table is in the
script; the vignettes themselves live outside the repo. Illustrations are drawn
full width at their own proportions (about 1818×572, never cropped) on the site
and in the app.

`Articles.csv` / `import.mjs` are the earlier one-off CSV import. That export
dropped pull-quote and attribution paragraphs and mangled typographic
apostrophes, so prefer the scraper.

### Fonts

- **NeighborFont** (proprietary) — served locally from `public/` as `.otf` files, declared via `@font-face` in `index.css`. The app bundles its own copies in `mobile/assets/fonts/`.
- **EB Garamond**, **Averia Libre** (card categories, as in the app), **Averia Serif Libre** (the dinkus), **New Amsterdam** and **Geist Mono** (being phased out) — loaded from Google Fonts via `<link>` in `index.html`

### CORS

`localhost:5173` must be in the allowed CORS origins for the Sanity project (sanity.io/manage → API → CORS Origins) for the frontend to fetch data in development. The mobile app is not a browser, so CORS doesn't apply to it.
