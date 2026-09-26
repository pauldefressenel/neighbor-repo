# The Neighbor

Source for [theneighborr.com](https://www.theneighborr.com), a bilingual literary
magazine. A Vite + React front end reads from a Sanity dataset; the Sanity Studio
lives in `studio/` and deploys separately to its own subdomain.

## Run it

```bash
npm install
npm run dev            # site → http://localhost:5173

cd studio && npm install
npm run dev            # studio → http://localhost:3333
```

`localhost:5173` must be an allowed CORS origin on the Sanity project
(sanity.io/manage → API → CORS origins).

## Layout

| Path | What |
|---|---|
| `src/` | Site. Routes are `/:lang/:section/:slug` with `lang` = `en` \| `fr`. |
| `studio/` | Sanity Studio v3. Schema in `studio/schemas/`, sidebar in `studio/structure.js`. |
| `import/` | One-off tooling: the Framer scraper/importer that seeded the dataset, and the About page seed. |
| `public/portraits/` | Sprite frames for the seven animated portraits. |

Content types: `article` (all sections, both languages, with `featured` driving
each language's homepage) and `aboutPage` (one document per language).

## Deploy

Two Vercel projects are imported from this one repository (auto-deploy on every
push to `main`):

| Project | Root directory | Serves |
|---|---|---|
| `neighbor-frontend` | `/` (framework Vite) | `react.theneighborr.com` |
| `neighbor-studio` | `studio/` (`sanity build`, SPA) | `cms.theneighborr.com` |

Both projects run `scripts/vercel-build.mjs` when their Root Directory is the
repo root: it builds the Studio when the project's production hostname contains
`studio` or `cms` (or `NEIGHBOR_BUILD=studio` is set) and the site otherwise, so
the Studio project works even without the Root Directory setting.

`vercel.json` at the root carries the SPA rewrite, immutable caching for
`/assets` and `/portraits`, and permanent redirects from every URL the old Framer
site published (the six slugs with accented or curly-quote characters appear both
raw and percent-encoded). `npm run build` also writes `dist/sitemap.xml` from the
Sanity dataset (`scripts/sitemap.mjs`); `public/robots.txt` points at it.

Sanity CORS origins (sanity.io/manage → API → CORS origins) must include
`https://react.theneighborr.com`, `https://*.vercel.app`
(previews) and `https://cms.theneighborr.com` with credentials allowed, otherwise
the Studio cannot log in and the site cannot fetch content.
