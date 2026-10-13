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

Deployment is through Vercel, not `sanity deploy`: the site is one Vercel project (root, Vite, served at `www.theneighborr.com`, which took over from Framer; `react.theneighborr.com` was its address before) and the Studio another (root directory `studio/`, served at `cms.theneighborr.com`). `scripts/vercel-build.mjs` picks which one to build when a project's root directory is left at the repo root. See the README's Deploy section. The mobile app is not deployed yet (no EAS config).

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
SUPABASE_URL=<url> SUPABASE_SECRET_KEY=<secret> node import/import-neighbours.mjs --write  # the 128 neighbours from the old project's backups (dry run without --write)
```

## Architecture

This is a monorepo with three apps, all reading the same Sanity dataset:

- **Root** — Vite + React website (`src/`, `index.html`, `vite.config.js`)
- **`studio/`** — Sanity Studio v3 (separate `package.json`, runs independently)
- **`mobile/`** — the iOS app, Expo + Expo Router (separate `package.json`). It has its own `mobile/CLAUDE.md`; read it before touching anything in `mobile/`. Most current work happens here.

Sanity stores four `section` values. The website, the app and the Studio sidebar all group them into the same three rubriques: Essays & Critiques (`literature-review` + `the-arts`), Prose & Poetry (`fiction-poetry`) and Portraits. (In the app, the three are a switch at the top of the Rubriques tab, which opens on A La Une.) The list lives once, in `shared/sections.js`; `src/sections.js`, `mobile/src/sections.js` and `studio/structure.js` derive their own shapes from it. The website is bilingual and uses English URL slugs for both languages. The app is French-only for now and uses French slugs.

### Shared (`shared/`)

What the website and the app must agree on, as plain data and functions with no package imports (each side keeps its own `@sanity/client`, whose versions differ, and passes it in):

- `sections.js` — the rubriques (labels and slugs per language, the app's subtitles, their Sanity sections, and Essais & Critiques' four categories, the only ones its articles may take: Livres / Books, Cinéma / Film, Musique / Music, Arts croisés / Crossroads; the Studio's Category field offers them as a list, `studio/categoryInput.jsx`, and `import/set-categories.mjs` set them on the existing articles) and each Sanity section's own name
- `sanity.js` — the project (`SANITY`) and the queries both run: latest, a rubrique, an article, the About page
- `i18n.js` — the strings both print; `src/i18n.js` and `mobile/src/i18n.js` add their own on top
- `dates.js` — "9 mai 2026" / "May 9, 2026", spelled out by hand in UTC
- `tokens.js` — the design values both use (colours, the title / category / excerpt / byline type, the card's image gap and proportions). The app reads them through `mobile/src/theme.js`; the website as CSS variables (`--red`, `--title-size`, …) from `virtual:tokens.css`, which the `tokens` plugin in `vite.config.js` builds from the file. Only values both sides really share go here; font family names differ per side and stay local. Text is plain black (`#000`) everywhere, written as such rather than as a token.

The website and the Studio import it by relative path; the app through Metro's `watchFolders` (`mobile/metro.config.js`). `studio/sanity.cli.js` writes the project id out instead, since the Sanity CLI can't follow an import out of `studio/`.

### Frontend (`src/`)

- `main.jsx` → mounts React
- `App.jsx` → routing shell; `Layout.jsx` holds the header, phone menu overlay, routes and `Footer`
- Per-component CSS files next to each component (no CSS modules or Tailwind)
- `ArticleCard.jsx` — the app's centred card (category, title, excerpt, full-width illustration, "de/by <author>", date), used by every list. Phones show it centred in one column, as in the app; from 700px the same card is set on the left in the 4/3/2-column grid (`ArticleGrid.jsx`), with one long hand-drawn `Rule.jsx` line across the grid between rows, none above the first or below the last, and one standing line (`vertical`) down each gap between columns, crossing them, down through the last row with a card on its left and on to the line under it, so a short last row leaves no empty boxes; the last row has no line under it, the lines beside its cards stopping at their foot (measured) (wider than 600px a rule is drawn as a pen stroke rather than the stretched drawing). Portraits there are an endless row (`PortraitStrip` in `ArticleGrid.jsx`: a move slides the track one card, then turns the list and puts the track back unseen; a copy of the previous card waits off the left edge) showing four cards (three below 900px) across the header line's width with two drawn arrows either side, moved by the arrows or the wheel, and on its own one card every 5 seconds from the start of the last move (`AUTO_ADVANCE`; not while the page is in the background or with Reduce Motion on), 76px under the title (40px lower than the grids), with a drawn line in the gap left of each card, its lower 90% and 20px more, sliding with it (the edge fade hides the first card's), and the cards' dates. The lists drop the title's asterisk there and set their title on the left, Portraits included, 47px below the header's line and 47px above the first row (measured to the letters). `PageTitle.jsx` is the app's page title closed by one asterisk centred under it, in Averia Serif Libre (`titleMark` in `shared/tokens.js`: `size`, and the room `above` and `below` its line box; three asterisks, then a short drawn line, came first).
- `RubriqueSwitch.jsx` — phones only (≤699): a row like the app's Rubriques switch inside the fixed header, under its line, on Latest and the three rubriques: Latest · Essays & Critiques · Prose & Poetry fill the width and Portraits waits off to the right; the row scrolls sideways, fading out towards a drawn chevron that scrolls it on (and back, turned round, at the end, where the fade moves to the start). On Portraits it opens scrolled to the end. The current one is red; one drawn line runs under it; `.main` starts lower there. When it appears (and again when the language changes) its line draws itself from the middle outwards as the names rise, then the arrow; a held name shrinks (the app's press).
- `MenuIcon.jsx` (+ `MenuIcon.css`, `menuIcons.js`) — set aside, unused: the hand-drawn menu icon (a list of three dotted lines turning into a cross), kept for when the site has a menu again. The phone header has no menu button for now.
- `Footer.jsx` — under one drawn `Rule`, the wordmark over "© <year> The Neighbor" in small faint capitals, and nothing else for now (the Sections and The paper columns went while The Neighborhood and About are closed; their words are still `footer` in `i18n.js`).
- `ArticlePage.jsx` — set like the app's article screen: on the left the category, "author, date.", the title (56px, 48px on phones) and the reading time (`readingMinutes.js`, 230 words a minute), then the text in 21/31 EB Garamond, justified and hyphenated in the article's language, opening on a black NeighborFont drop cap, then any poems. Above the heading, a back arrow (`Arrow.jsx`, the Portraits row's drawn chevron) goes back to the page the article was opened from, or to its rubrique when opened from a link. Its `ArticleHeading` and `ArticleText` are reused by About.
- `AboutPage.jsx` — set like the app's A Propos: a fixed heading per language (`aboutHeading` in `i18n.js`), then the `about-<lang>` document's body with a drop cap. The founders' avatars are not shown, as in the app.
- `VoisinagePage.jsx` + `account.jsx` — The Neighborhood: the app's Voisinage sign-up mock-up (nothing is sent; the account lives in memory)
- `BroadsheetPage.jsx` — `/broadsheet`, outside `Layout`: a standalone newspaper-style front page experiment with hard-coded issue details. It is not linked from the site.
- `PortraitCard.jsx` + `PortraitAnimation.jsx` — an `ArticleCard` with the portrait's animated sprite in the illustration's place on phones, as in the app, and at the top of the card from 700px, where the row's sprites line up: Framer's 110×110 slot drawn at 100px (the app's size), the character standing at the slot's foot. `portraitAnimations.js` is a hand-transcribed spec of the seven portrait loops (frames, mirrors, per-step positions, dwell times), sourced from the Framer MCP node XML and the published component chunks and verified against recordings of the live site. Sprites live in `public/portraits/`; do not regenerate this file from the chunks — that path was tried and is unreliable. The iOS app plays the same spec and sprites (`mobile/src/PortraitAnimation.js`), so a change here changes both.
- `src/sanity/client.js` — Sanity client + `urlFor()` image helper
- `src/sanity/queries.js` — `getArticlesBySection`, `getLatestArticles`, `getArticleBySlug`, `getAboutPage`, bound to the site's client; the GROQ is in `shared/sanity.js`
- `sections.js` — the three rubriques (`essays-critiques`, `prose-poetry`, `portraits`) from `shared/sections.js`, each with its Sanity sections. `rubriqueOf()` maps an article's `section` to its URL segment, and `LEGACY_SECTIONS` lists the pre-rubrique URLs.
- `i18n.js` — bilingual strings and nav labels (the three rubriques plus The Neighborhood) for `en` / `fr`
- `scripts/sitemap.mjs` writes `dist/sitemap.xml` after `vite build`, and `scripts/vercel-build.mjs` is the Vercel build entry

### Routing and Bilingualism

URL structure: `/:lang/:rubrique` and `/:lang/:rubrique/:slug` (e.g. `/en/prose-poetry`, `/fr/essays-critiques/<slug>`). Article URLs use the article's rubrique (`rubriqueOf(section)`); `ArticlePage` looks articles up by slug alone. The old section URLs (`/:lang/fiction-poetry`, `/literature-review`, `/the-arts`, with or without a slug) redirect to their rubrique, in `vercel.json` in production and through `LegacySection` routes in `Layout.jsx` in development. The Framer redirects in `vercel.json` point straight at the new URLs.

- `/` goes to `/fr` or `/en` by the visitor's location: `middleware.js` (Vercel Routing Middleware, production only) sends French-speaking countries and regions to `/fr`, unless the `lang` cookie (set by the language switch) says otherwise. In development `App.jsx` uses the cookie, else `/en`; `/:lang` is the Latest page, titled Top Stories in English (the articles in that language's À la Une document, in its order)
- `/:lang/about` is the About page. `/:lang/neighborhood` is The Neighborhood (`VoisinagePage.jsx`). While `NEIGHBORHOOD_OPEN` in `src/sections.js` is false, it is left out of the nav, the footer and the sitemap, and its URL redirects to `/:lang`. `ABOUT_OPEN` does the same for About. Both are false for now. About sits in the sections nav after the three rubriques; there is no Donate link.
- `lang` param is `en` or `fr`; `i18n.js` drives all translated labels and section listings
- `Layout` reads `lang` from the URL and passes it to queries so only articles with the matching `language` field are fetched
- The language switch is "FR / EN" in the wide header (≥1400), the app's "FR EN" on phones (≤749: Averia Libre 16px, the other language faint, one tap on the pair switches, on the wordmark's baseline 28px from the edge), and Framer's selector opening a row with the other language in between; each opens the same page in the other language, or from an article its rubrique (the translation's slug differs), as the app does, and stores the choice in the `lang` cookie
- The article lists (Latest and the rubriques) build up as in the app, on the steps in `shared/tokens.js` (`appear`): the title one line at a time from 0.2s, the title's asterisk at 0.35s, the first five cards at 0.4s, timed from the page opening (`AppearContext` in `src/appear.js`), so cards fetched late don't wait out time already past. On the website the grids' later cards then rise the same way as they scroll into view (`riseOnScroll`), with the first five if already in view; the app and the website's Portraits row stop at five. The springs are traced into CSS `linear()` easings (`springCurve`) for the `rise` keyframes in `index.css`. The Neighborhood still lifts `.main` in whole as on Framer, and article pages build up as the app's do (`appear.article`: category, byline and back arrow / title / reading time and text at 300/350/400ms, timed from the page opening).

### Breakpoints

Framer uses different breakpoints per page. The section pages' set (≥1200 / 900–1199 / 700–899 / ≤699) drives the article grids (4/3/2/1 columns); portraits are a sliding row on wider screens (four cards, three below 900px). The header follows the home page's set instead, measured on the live site, plus one of its own: ≥1400 a single 70px row (A La Une and the rubriques left of a 30px centred wordmark, The Neighborhood, About and the language right of it, all on the wordmark's baseline, 50px in from each side, over a hand-drawn `Rule` instead of a border, the language as "FR / EN" with the current one in red); 1000–1399 desktop (wordmark centred, language selector ending 15px from the right, nav links with 60px gaps); 750–999 tablet (language at the right, nav gaps 35px), ≤749 phone (one 60px row: a hand-drawn menu icon (`MenuIcon.jsx`: a list of three dotted lines and a cross made of its own lines, from `assets/icons/make-icons.py` into `src/menuIcons.js`) 28px from the left on the wordmark's baseline, its top and bottom lines swinging into the cross when the menu opens while the dots and middle line go; wordmark centred as in the app, language at the right, over the app's masthead line, the hand-drawn `Rule` stretched edge to edge (`drawn`), instead of a border; the sections nav moves into `menu-overlay`). The nav links are Averia Libre capitals, 14px, +0.06em, the current page in red. Under the fixed header the paper fades out over 30px as the page scrolls beneath it. Layout.css has the measured values.

### The old Neighborhood canvas

`NeighborhoodPage.jsx` is an earlier interactive canvas for The Neighborhood. It is no longer routed (`VoisinagePage.jsx` took its place). It:

- Fetches community members from an external REST API (`https://the-neighbor.onrender.com/community`)
- Lays out member portrait images using a golden-angle spiral
- Supports pointer drag-to-pan with momentum/friction physics
- Shows a tooltip overlay (via `ReactDOM.createPortal`) on hover with member details

### Sanity (`studio/`)

- Three document types: `article` (`studio/schemas/article.js`), `frontPage` (`studio/schemas/frontPage.js`: À la Une, one per language with fixed ids `front-fr` / `front-en`, an ordered list of references to that language's articles, which the website's Latest and the app's A La Une show in that order; `import/seed-front.mjs` created them from the old `featured` field, then removed that field) and `aboutPage` (`studio/schemas/aboutPage.js`). There is one `aboutPage` per language, with fixed ids `about-en` / `about-fr`: `title`, `body`, `founders[]` (name + image).
- Article core fields: `title`, `slug`, `language` (`en`/`fr`), `section`, `category`, `author`, `excerpt`, `mainImage`, `body`, `publishedAt`
- Additional fields: `poems` (array of titled poem objects with block content), `audioFile` (URL), `audioQuote`, `illustrationScale` (0.5–2, a slider: the card's drawing height). The old `featured` field went with À la Une
- `section` names the article's rubrique, shown read-only, last in the Studio's form, in the article's language (`studio/rubriqueInput.jsx`); `language` is hidden; both are set by the folder the article was created in, as is `publishedAt` (to the moment of creation, editable): `literature-review` (Essais & Critiques), `fiction-poetry` (Prose & Poésie) or `portraits`. The old `the-arts` was merged into `literature-review` (`import/merge-sections.mjs`); Essais & Critiques still finds it, and the Framer import maps it. (The Neighborhood is frontend-only, not a Sanity section)
- Studio sidebar (`studio/structure.js`): Language (Français first) → À la Une (Top Stories in English), then the app's three rubriques → articles. The About pages (`about-en` / `about-fr`) are no longer in the sidebar, though the documents remain. Essais & Critiques covers both `literature-review` and `the-arts`; a new article there is simply `literature-review`, the two being no longer told apart. An initial-value template fills `language` and `section`, so writers never set those fields by hand. The rubriques, and the `section` field's options, come from `shared/sections.js`.
- Sanity project ID: `9hw8z0gm`, dataset: `production`

### Content migration (`import/`)

The live Framer site at theneighborr.com is the source of truth for content until
the cutover. Two scripts keep Sanity in step with it:

- `scrape-framer.mjs` — walks the sitemap's section pages and entry pages and writes
  `framer-content.json`. Framer emits every text block once per responsive
  breakpoint, so the scraper detects the repeat cycle and keeps one copy. Section
  listing cards supply `category`, `excerpt` and `mainImage` (entry pages omit
  them); the two homepages supply `featured`, since each renders exactly the
  entries flagged for its language, though nothing takes it any more (À la
  Une is set in the Studio). Fetched HTML is cached in `import/.framer-cache`.
- `import-framer.mjs` — upserts that JSON into Sanity. Dry run by default. Document
  ids follow the original `article-<de-accented-slug>` scheme so entries update in
  place rather than duplicating. `audioFile`, `audioQuote` and
  `illustrationScale` are not rendered by Framer, so they are carried over from the existing document.
  Articles no longer record their translation: `translationSlug` was deleted
  (`import/drop-translation-slug.mjs`, which saved the pairs first). Every `--write` first
  dumps the current dataset to `import/backup-<timestamp>.ndjson`.

`assign-vignettes.mjs` sets articles' main images from a folder of vignettes
numbered per rubrique (`essais-critiques/1.png` is the oldest French essay). Each
image went to the article's translation too, through `translationSlug`; run
again, it sets the French articles only. The slug-to-number table is in the
script; the vignettes themselves live outside the repo. Illustrations are drawn
full width in one box at the vignettes' proportions (about 1818×572); a taller
one is scaled down to fit, never cropped, on the site and in the app.

`Articles.csv` / `import.mjs` are the earlier one-off CSV import. That export
dropped pull-quote and attribution paragraphs and mangled typographic
apostrophes, so prefer the scraper.

### Supabase (`supabase/`)

The neighbours' accounts live in a Supabase project (`btwgwcmxercrdrncqerp`), separate from Sanity: Sanity holds the articles, Supabase the readers. `supabase/migrations/` holds its schema as SQL, applied by hand (SQL Editor) for now; GitHub isn't linked. Auth's e-mails (the 6-digit sign-in code) are not the dashboard's templates: the Send Email Hook calls the `send-email` Edge Function (`supabase/functions/send-email/`), which writes the letter in `letter.js` (laid out like an article, dated, French or English from the user's `lang` metadata) and sends it through Brevo's API from `admin@theneighborr.com` (DKIM and DMARC in GoDaddy's DNS). `node supabase/functions/send-email/preview.mjs` writes a local preview; deploying is in `index.ts`'s header. `profiles` (one per auth user, private to its owner), the public `neighbours` view (first name, avatar, country, activity, and the activity written out in French and English, `activity_fr` / `activity_en`, added by the second migration with the translations of the 114 imported activities), and two buckets: `avatars` (public) and `photos` (private, per user). The 128 neighbours come from an earlier project (paused, exported from the dashboard) through `import/import-neighbours.mjs`, which reads the two backups from `~/Downloads`; those backups and anything extracted from them hold e-mail addresses and stay out of the repo. The avatars are personal portraits drawn from each neighbour's photo, not a set to choose from. The old `NeighborhoodPage.jsx` and the Framer Wall read the earlier project through `the-neighbor.onrender.com/community`, which no longer answers.

### Fonts

- **NeighborFont** (proprietary) — served locally from `public/` as `.otf` files, declared via `@font-face` in `index.css`. The app bundles its own copies in `mobile/assets/fonts/`.
- **EB Garamond**, **Averia Libre** (card categories, as in the app), **Averia Serif Libre** (the asterisk under page titles), **New Amsterdam** and **Geist Mono** (being phased out) — loaded from Google Fonts via `<link>` in `index.html`

### CORS

`localhost:5173` must be in the allowed CORS origins for the Sanity project (sanity.io/manage → API → CORS Origins) for the frontend to fetch data in development. The mobile app is not a browser, so CORS doesn't apply to it.
