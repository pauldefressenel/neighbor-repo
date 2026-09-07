// Scrapes the published Framer site (theneighborr.com) into a normalised JSON
// file that import-framer.mjs can push to Sanity.
//
//   node import/scrape-framer.mjs            # fetch from the network
//   node import/scrape-framer.mjs --cache d  # reuse previously fetched HTML in d/
//
// Writes import/framer-content.json. Needs no Sanity token — run it, eyeball the
// report, then run the importer.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ORIGIN = 'https://www.theneighborr.com'

// Framer serves a content-less shell to unfamiliar user agents.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
const SHELL_BYTES = 25000

// Site masthead image, present on every page — never an entry's own image.
const MASTHEAD = 'RJmEMrB9aqvxFYdXVe7sr7Y'

// Framer style presets, which are stable per text role across the whole site.
const P = {
  entryTitle: 'framer-styles-preset-3pk5i6',
  entryMeta: 'framer-styles-preset-m706v7',   // author, then date
  prose: 'framer-styles-preset-18e349c',
  poemTitle: 'framer-styles-preset-1j5jw2j',
  poemLine: 'framer-styles-preset-cw51ut',
  cardCategory: 'framer-styles-preset-d4arxf',
  cardTitle: 'framer-styles-preset-q5csc6',
  cardExcerpt: 'framer-styles-preset-1k2mfzs',
  cardAuthor: 'framer-styles-preset-1pf28fh',
}

// Framer section slug → Sanity section value.
const SECTIONS = {
  fiction: 'fiction-poetry',
  literature: 'literature-review',
  arts: 'the-arts',
  portraits: 'portraits',
}

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  janv: 1, févr: 2, mars: 3, avr: 4, mai: 5, juin: 6,
  juil: 7, août: 8, sept: 9, déc: 12,
}

const warnings = []
const warn = (slug, msg) => warnings.push(`${slug}: ${msg}`)

// ── fetching ──────────────────────────────────────────────────────────────────

const cacheDir = (() => {
  const i = process.argv.indexOf('--cache')
  return i !== -1 ? process.argv[i + 1] : join(__dirname, '.framer-cache')
})()
mkdirSync(cacheDir, { recursive: true })

const cacheKey = (path) => (path.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home') + '.html'

async function getPage(path) {
  const file = join(cacheDir, cacheKey(path))
  if (existsSync(file) && readFileSync(file).length >= SHELL_BYTES) {
    return readFileSync(file, 'utf-8')
  }
  const res = await fetch(ORIGIN + path, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`)
  const html = await res.text()
  if (html.length < SHELL_BYTES) {
    throw new Error(`got a ${html.length}-byte shell for ${path} — Framer did not server-render it`)
  }
  writeFileSync(file, html)
  await new Promise((r) => setTimeout(r, 250))
  return html
}

// ── breakpoint de-duplication ─────────────────────────────────────────────────

// Framer emits the same content once per responsive breakpoint, as N identical
// consecutive runs. Find the shortest run that tiles the whole sequence.
function firstCycle(items, keyOf = (x) => x) {
  const n = items.length
  if (n === 0) return items
  for (let len = 1; len <= n / 2; len++) {
    if (n % len !== 0) continue
    let periodic = true
    for (let i = len; i < n && periodic; i++) {
      if (keyOf(items[i]) !== keyOf(items[i - len])) periodic = false
    }
    if (periodic) return items.slice(0, len)
  }
  return items
}

// ── HTML → Portable Text ──────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)

// Body paragraphs only ever carry <em> and <br>, so a shallow walk is enough.
function spansFrom($, el) {
  const spans = []
  const walk = (node, marks) => {
    $(node).contents().each((_, child) => {
      if (child.type === 'text') {
        const text = child.data.replace(/ /g, ' ')
        if (text) spans.push({ _type: 'span', _key: uid(), text, marks: [...marks] })
      } else if (child.type === 'tag') {
        const tag = child.tagName.toLowerCase()
        if (tag === 'br') {
          spans.push({ _type: 'span', _key: uid(), text: '\n', marks: [...marks] })
        } else if (tag === 'em' || tag === 'i') {
          walk(child, [...marks, 'em'])
        } else if (tag === 'strong' || tag === 'b') {
          walk(child, [...marks, 'strong'])
        } else {
          walk(child, marks)
        }
      }
    })
  }
  walk(el, [])

  // Merge neighbouring spans that share the same marks.
  const merged = []
  for (const s of spans) {
    const prev = merged[merged.length - 1]
    if (prev && prev.marks.join() === s.marks.join()) prev.text += s.text
    else merged.push(s)
  }
  return merged.filter((s) => s.text.trim() || s.text.includes('\n'))
}

const block = ($, el) => ({
  _type: 'block',
  _key: uid(),
  style: 'normal',
  markDefs: [],
  children: spansFrom($, el),
})

// ── parsing ───────────────────────────────────────────────────────────────────

function parseDate(raw, slug) {
  if (!raw) return undefined
  const m = raw.match(/^(?:(\d{1,2})\s+)?([A-Za-zÀ-ÿ]+)\.?\s+(?:(\d{1,2}),\s*)?(\d{4})$/)
  if (!m) { warn(slug, `unparseable date "${raw}"`); return undefined }
  const [, dayFirst, monthRaw, dayAfter, year] = m
  const month = MONTHS[monthRaw.toLowerCase().replace(/\.$/, '')]
  const day = dayFirst || dayAfter
  if (!month || !day) { warn(slug, `unparseable date "${raw}"`); return undefined }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`
}

// Section listing pages carry the fields the entry pages omit: category and excerpt.
async function parseSectionPage(framerSection, lang) {
  const html = await getPage(`/sections/${framerSection}/${lang}`)
  const $ = cheerio.load(html)
  const cards = []
  $('a[href*="/entries/"]').each((_, a) => {
    const href = $(a).attr('href') || ''
    const m = href.match(/\/entries\/(?:articles|portraits)\/([^"/?#]+)/)
    if (!m) return
    const pick = (cls) => $(a).find(`p.${cls}`).first().text().trim()
    // The card thumbnail is the entry's main image. Entry pages only expose it
    // via og:image, and portrait pages not at all, so take it from the card.
    const cardImage = $(a).find('img').map((_, e) => $(e).attr('src')).get()
      .find((s) => s && s.includes('framerusercontent') && !s.includes(MASTHEAD))
    cards.push({
      slug: decodeURIComponent(m[1]),
      category: pick(P.cardCategory),
      title: pick(P.cardTitle),
      excerpt: pick(P.cardExcerpt),
      author: pick(P.cardAuthor),
      imageUrl: cardImage ? cardImage.split('?')[0] : undefined,
      section: SECTIONS[framerSection],
      language: lang,
      isPortrait: href.includes('/entries/portraits/'),
    })
  })
  // Each card repeats once per breakpoint.
  return firstCycle(cards, (c) => c.slug)
}

async function parseEntryPage(card) {
  const kind = card.isPortrait ? 'portraits' : 'articles'
  const html = await getPage(`/entries/${kind}/${encodeURIComponent(card.slug)}`)
  const $ = cheerio.load(html)

  const title = firstCycle($(`p.${P.entryTitle}`).map((_, e) => $(e).text().trim()).get())[0]
  const meta = firstCycle($(`p.${P.entryMeta}`).map((_, e) => $(e).text().trim()).get())
  const [author, dateRaw] = meta

  // Walk prose, poem titles and poem lines together so their order is preserved.
  const nodes = []
  $(`p.${P.prose}, p.${P.poemTitle}, p.${P.poemLine}`).each((_, el) => {
    const cls = $(el).attr('class') || ''
    const role = cls.includes(P.poemTitle) ? 'poemTitle' : cls.includes(P.poemLine) ? 'poemLine' : 'prose'
    nodes.push({ role, el, text: $(el).text().trim() })
  })
  const content = firstCycle(nodes, (n) => n.role + ' ' + n.text)

  const body = content.filter((n) => n.role === 'prose' && n.text).map((n) => block($, n.el))

  const poems = []
  for (const n of content) {
    if (n.role === 'poemTitle') {
      poems.push({ _type: 'poem', _key: uid(), poemTitle: n.text, poemContent: [] })
    } else if (n.role === 'poemLine') {
      if (!poems.length) poems.push({ _type: 'poem', _key: uid(), poemTitle: '', poemContent: [] })
      poems[poems.length - 1].poemContent.push(block($, n.el))
    }
  }

  // Prefer the card thumbnail; fall back to og:image (articles only carry that).
  const og = $('meta[property="og:image"]').attr('content')
  const imageUrl = card.imageUrl || (og ? og.split('?')[0] : undefined)
  const excerpt = card.excerpt || $('meta[property="og:description"]').attr('content') || ''

  if (!title) warn(card.slug, 'no title found')
  if (!author) warn(card.slug, 'no author found')
  if (!excerpt) warn(card.slug, 'no excerpt found')
  if (!imageUrl) warn(card.slug, 'no image on the page')
  if (!body.length && !poems.length) warn(card.slug, 'no body and no poems')

  return {
    slug: card.slug,
    language: card.language,
    section: card.section,
    category: card.category,
    title: title || card.title,
    author: author || card.author,
    excerpt,
    publishedAt: parseDate(dateRaw, card.slug),
    imageUrl,
    body,
    poems,
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

const cards = []
for (const framerSection of Object.keys(SECTIONS)) {
  for (const lang of ['en', 'fr']) {
    const found = await parseSectionPage(framerSection, lang)
    console.log(`  /sections/${framerSection}/${lang}`.padEnd(34) + `${found.length} entries`)
    cards.push(...found)
  }
}

// Each homepage renders exactly the entries flagged as featured for that
// language, so the homepages are the source of truth for the `featured` field.
const featured = new Map()
for (const [path, lang, value] of [['/', 'en', 'English'], ['/home/fr', 'fr', 'French']]) {
  const $ = cheerio.load(await getPage(path))
  const slugs = []
  $('a[href*="/entries/"]').each((_, a) => {
    const m = ($(a).attr('href') || '').match(/\/entries\/(?:articles|portraits)\/([^"/?#]+)/)
    if (!m) return
    const slug = decodeURIComponent(m[1])
    if (!slugs.includes(slug)) slugs.push(slug)
  })
  console.log(`  ${path.padEnd(32)}${slugs.length} featured (${lang})`)
  for (const s of slugs) featured.set(s, value)
}

const bySlug = new Map()
for (const c of cards) {
  if (bySlug.has(c.slug)) warn(c.slug, `listed under two sections — keeping ${bySlug.get(c.slug).section}`)
  else bySlug.set(c.slug, c)
}

console.log(`\nFetching ${bySlug.size} entry pages…`)
const entries = []
for (const card of bySlug.values()) {
  const entry = await parseEntryPage(card)
  entry.featured = featured.get(entry.slug) || 'NO'
  entries.push(entry)
  process.stdout.write(`\r  ${entries.length}/${bySlug.size}`)
}
console.log('\n')

const out = join(__dirname, 'framer-content.json')
writeFileSync(out, JSON.stringify(entries, null, 2))

const tally = entries.reduce((acc, e) => {
  const k = `${e.language}/${e.section}`
  acc[k] = (acc[k] || 0) + 1
  return acc
}, {})
console.log('Scraped:')
for (const [k, v] of Object.entries(tally).sort()) console.log(`  ${k.padEnd(24)} ${v}`)
console.log(`  ${'—'.repeat(24)} ${entries.length} total`)
console.log(`  with body   ${entries.filter((e) => e.body.length).length}`)
console.log(`  with poems  ${entries.filter((e) => e.poems.length).length}`)
console.log(`  with image  ${entries.filter((e) => e.imageUrl).length}`)
console.log(`  featured    ${entries.filter((e) => e.featured !== 'NO').length}`)

for (const slug of featured.keys()) {
  if (!bySlug.has(slug)) warn(slug, 'featured on a homepage but not listed in any section')
}

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`)
  for (const w of warnings) console.log(`  ⚠  ${w}`)
}
console.log(`\nWrote ${out}`)
