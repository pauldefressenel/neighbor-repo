// Pushes import/framer-content.json (from scrape-framer.mjs) into Sanity.
//
//   node import/import-framer.mjs                      # dry run — prints the plan, writes nothing
//   SANITY_TOKEN=… node import/import-framer.mjs --write
//   SANITY_TOKEN=… node import/import-framer.mjs --write --images   # also refresh existing images
//   node import/import-framer.mjs --only anchor        # restrict to one slug
//
// Framer is treated as the source of truth for everything it renders, including
// which entries are featured (its two homepages render exactly those). Fields
// Framer does not expose — audioFile, audioQuote, translationSlug — are carried
// over from the existing Sanity document so they survive the import.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))

const WRITE = process.argv.includes('--write')
const REFRESH_IMAGES = process.argv.includes('--images')
const ONLY = (() => {
  const i = process.argv.indexOf('--only')
  return i !== -1 ? process.argv[i + 1] : null
})()

const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/import-framer.mjs --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
})

// Matches the id scheme the original CSV import used, so entries update in
// place instead of being duplicated under an accented id.
const docId = (slug) =>
  'article-' + slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-')

// ── load ──────────────────────────────────────────────────────────────────────

let entries = JSON.parse(readFileSync(join(__dirname, 'framer-content.json'), 'utf-8'))
if (ONLY) entries = entries.filter((e) => e.slug === ONLY)
if (!entries.length) {
  console.error(ONLY ? `No scraped entry with slug "${ONLY}"` : 'framer-content.json is empty')
  process.exit(1)
}

const existing = await client.fetch(
  `*[_type == "article"]{ _id, "slug": slug.current, translationSlug, featured, audioFile, audioQuote, mainImage }`
)
const byId = new Map(existing.map((d) => [d._id, d]))

// ── translation pairing ───────────────────────────────────────────────────────

// Framer does not render the link between an article and its translation, so
// keep whatever Sanity already knows and derive the obvious -en/-fr pairs.
const slugs = new Set(entries.map((e) => e.slug))
function translationFor(entry) {
  const prior = byId.get(docId(entry.slug))?.translationSlug
  if (prior) return prior
  const m = entry.slug.match(/^(.*)-(en|fr)$/)
  if (m) {
    const other = `${m[1]}-${m[2] === 'en' ? 'fr' : 'en'}`
    if (slugs.has(other)) return other
  }
  return undefined
}

// ── image upload ──────────────────────────────────────────────────────────────

const uploaded = new Map()
async function imageFor(entry, prior) {
  if (prior?.mainImage && !REFRESH_IMAGES) return prior.mainImage
  if (!entry.imageUrl) return prior?.mainImage
  if (uploaded.has(entry.imageUrl)) return uploaded.get(entry.imageUrl)

  const res = await fetch(entry.imageUrl)
  if (!res.ok) throw new Error(`image HTTP ${res.status}`)
  const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {
    contentType: res.headers.get('content-type') || 'image/png',
    filename: entry.imageUrl.split('/').pop(),
  })
  const ref = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  uploaded.set(entry.imageUrl, ref)
  return ref
}

// ── plan ──────────────────────────────────────────────────────────────────────

const creates = entries.filter((e) => !byId.has(docId(e.slug)))
const updates = entries.filter((e) => byId.has(docId(e.slug)))
const orphans = existing.filter((d) => !entries.some((e) => docId(e.slug) === d._id))

console.log(`\nFramer entries: ${entries.length}   Sanity documents: ${existing.length}\n`)
console.log(`  create  ${String(creates.length).padStart(3)}`)
console.log(`  update  ${String(updates.length).padStart(3)}`)
console.log(`  leave   ${String(orphans.length).padStart(3)}  (in Sanity, not on Framer)\n`)

if (creates.length) {
  console.log('New entries:')
  for (const e of creates) console.log(`  + ${e.language}/${e.section.padEnd(18)} ${e.slug}`)
  console.log()
}
if (orphans.length) {
  console.log('Left untouched — no longer on Framer:')
  for (const d of orphans) console.log(`  · ${d.slug}  (${d._id})`)
  console.log()
}

const unpaired = entries.filter((e) => !translationFor(e))
if (unpaired.length) {
  console.log(`No translation link for ${unpaired.length} entr${unpaired.length === 1 ? 'y' : 'ies'} — set these by hand in Studio:`)
  for (const e of unpaired) console.log(`  ? ${e.language}  ${e.slug}`)
  console.log()
}

if (!WRITE) {
  console.log('Dry run — nothing written. Re-run with --write (and SANITY_TOKEN set) to apply.\n')
  process.exit(0)
}

// ── write ─────────────────────────────────────────────────────────────────────

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backup = join(__dirname, `backup-${stamp}.ndjson`)
const full = await client.fetch(`*[_type == "article"]`)
writeFileSync(backup, full.map((d) => JSON.stringify(d)).join('\n') + '\n')
console.log(`Backed up ${full.length} existing documents to ${backup}\n`)

let ok = 0
const failed = []
for (const e of entries) {
  const id = docId(e.slug)
  const prior = byId.get(id)
  process.stdout.write(`  ${e.slug.slice(0, 46).padEnd(48)}`)
  try {
    const doc = {
      _type: 'article',
      _id: id,
      title: e.title,
      slug: { _type: 'slug', current: e.slug },
      language: e.language,
      section: e.section,
      category: e.category,
      author: e.author,
      excerpt: e.excerpt,
      body: e.body,
      poems: e.poems,
      publishedAt: e.publishedAt,
    }

    const image = await imageFor(e, prior)
    if (image) doc.mainImage = image

    // Carry over anything Framer does not render.
    const translationSlug = translationFor(e)
    if (translationSlug) doc.translationSlug = translationSlug
    doc.featured = e.featured ?? prior?.featured ?? 'NO'
    if (prior?.audioFile) doc.audioFile = prior.audioFile
    if (prior?.audioQuote) doc.audioQuote = prior.audioQuote

    await client.createOrReplace(doc)
    console.log(prior ? 'updated' : 'created')
    ok++
  } catch (err) {
    console.log(`FAILED  ${err.message}`)
    failed.push(e.slug)
  }
  await new Promise((r) => setTimeout(r, 120))
}

console.log(`\nDone — ${ok} written, ${failed.length} failed.`)
if (failed.length) console.log(`Failed: ${failed.join(', ')}`)
console.log(`Rollback if needed:  cd studio && npx sanity dataset import ${backup} production --replace\n`)
