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

Two Vercel projects from this one repository:

- **Site** — root directory `/`, framework Vite. `vercel.json` carries the SPA
  rewrite and permanent redirects from every URL the old Framer site published.
- **Studio** — root directory `studio/`, built with `sanity build`, served as an
  SPA. Point the CMS subdomain at this project and add that origin to Sanity's
  CORS list with credentials allowed.
