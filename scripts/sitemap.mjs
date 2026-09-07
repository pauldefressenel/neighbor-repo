// Writes dist/sitemap.xml after `vite build`: the static routes for both
// languages plus every article in Sanity. Framer served a sitemap, so the
// cutover shouldn't lose one. A Sanity outage degrades to static routes only
// rather than failing the deploy.
import { writeFileSync, existsSync } from 'node:fs'
import { createClient } from '@sanity/client'

const ORIGIN = 'https://www.theneighborr.com'
const LANGS = ['en', 'fr']
const SECTIONS = ['fiction-poetry', 'literature-review', 'the-arts', 'portraits']

if (!existsSync('dist')) {
  console.error('sitemap: dist/ not found — run vite build first')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const urls = []
for (const lang of LANGS) {
  urls.push(`/${lang}`, `/${lang}/about`, `/${lang}/neighborhood`)
  for (const section of SECTIONS) urls.push(`/${lang}/${section}`)
}

let articles = []
try {
  articles = await client.fetch(
    `*[_type == "article" && defined(slug.current)]{ language, section, "slug": slug.current, publishedAt, _updatedAt }`
  )
} catch (err) {
  console.warn(`sitemap: could not fetch articles (${err.message}); writing static routes only`)
}

const entries = urls.map((path) => ({ loc: path }))
for (const a of articles) {
  if (!LANGS.includes(a.language) || !SECTIONS.includes(a.section)) continue
  entries.push({ loc: `/${a.language}/${a.section}/${a.slug}`, lastmod: a._updatedAt || a.publishedAt })
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(({ loc, lastmod }) =>
    `  <url><loc>${escape(ORIGIN + encodeURI(loc))}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
  ),
  '</urlset>',
  '',
].join('\n')

writeFileSync('dist/sitemap.xml', xml)
console.log(`sitemap: ${entries.length} urls (${articles.length} articles)`)
