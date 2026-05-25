import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'
import { parse } from 'csv-parse/sync'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TOKEN = process.env.SANITY_TOKEN
if (!TOKEN) {
  console.error('Usage: SANITY_TOKEN=<token> node import/import.mjs')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
})

const SECTION_MAP = {
  'Fiction - English':    { section: 'fiction-poetry',   language: 'en' },
  'Fiction - French':     { section: 'fiction-poetry',   language: 'fr' },
  'Literature - English': { section: 'literature-review', language: 'en' },
  'Literature - French':  { section: 'literature-review', language: 'fr' },
  'Arts - English':       { section: 'the-arts',          language: 'en' },
  'Arts - French':        { section: 'the-arts',          language: 'fr' },
}

// ── HTML → Portable Text ──────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&hellip;/g, '…')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&icirc;/g, 'î')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&oe;/g, 'œ')
    .replace(/&OE;/g, 'Œ')
}

// Parse inline marks (em, strong, i, b) within a paragraph's inner HTML.
// Returns an array of Sanity span objects.
function parseSpans(html) {
  // Replace <br> with newline character
  html = html.replace(/<br\s*\/?>/gi, '\n')

  const spans = []
  const markStack = []

  // Tokenise into tags and text runs
  const tokenRe = /(<\/?(em|strong|b|i)\b[^>]*>)|([^<]+|<(?!\/?(?:em|strong|b|i)\b)[^>]*>)/gi
  let m
  while ((m = tokenRe.exec(html)) !== null) {
    if (m[1]) {
      // It's a mark tag
      const tag = m[1].replace(/\s+.*/, '').toLowerCase()
      const mark = (tag === '<em>' || tag === '<i>') ? 'em' : 'strong'
      const closing = m[1].startsWith('</')
      if (!closing) {
        markStack.push(mark)
      } else {
        const idx = markStack.lastIndexOf(mark)
        if (idx !== -1) markStack.splice(idx, 1)
      }
    } else if (m[3]) {
      // Text or unrecognised tag — strip any remaining tags and decode
      const text = decodeEntities(m[3].replace(/<[^>]+>/g, ''))
      if (text) {
        spans.push({
          _type: 'span',
          _key: uid(),
          text,
          marks: [...markStack],
        })
      }
    }
  }

  return spans.length ? spans : [{ _type: 'span', _key: uid(), text: '', marks: [] }]
}

// Convert an HTML string (sequence of <p> tags) to a Portable Text block array.
function htmlToBlocks(html) {
  if (!html?.trim()) return []

  const blocks = []
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = pRe.exec(html)) !== null) {
    const inner = m[1]
    // Skip paragraphs that are purely whitespace / bare <br>
    const stripped = inner.replace(/<br\s*\/?>/gi, '').replace(/<[^>]+>/g, '').trim()
    if (!stripped) continue

    blocks.push({
      _type: 'block',
      _key: uid(),
      style: 'normal',
      markDefs: [],
      children: parseSpans(inner),
    })
  }
  return blocks
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractSlug(path) {
  if (!path?.trim()) return undefined
  return path.split('/').pop() || undefined
}

function buildPoems(row) {
  const poems = []

  // Single untitled poem (column "Poem")
  const single = row['Poem']
  if (single?.trim()) {
    poems.push({
      _type: 'poem',
      _key: uid(),
      poemTitle: '',
      poemContent: htmlToBlocks(single),
    })
  }

  // Named poems (Title 1..3 / Poem 1..3)
  for (let i = 1; i <= 3; i++) {
    const title = row[`Title ${i}`]?.trim() ?? ''
    const content = row[`Poem ${i}`]?.trim() ?? ''
    if (title || content) {
      poems.push({
        _type: 'poem',
        _key: uid(),
        poemTitle: title,
        poemContent: htmlToBlocks(content),
      })
    }
  }

  return poems
}

async function uploadImage(url) {
  if (!url?.trim()) return null
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const ct = res.headers.get('content-type') || 'image/jpeg'
  const buffer = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buffer, { contentType: ct })
}

// ── Main ──────────────────────────────────────────────────────────────────────

const csvPath = join(__dirname, 'Articles.csv')
const rows = parse(readFileSync(csvPath, 'utf-8'), {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
})

console.log(`\nImporting ${rows.length} articles into Sanity...\n`)

let ok = 0, fail = 0
for (const row of rows) {
  const slug = row['Slug']
  const sectionInfo = SECTION_MAP[row['Section']]
  if (!sectionInfo) {
    console.warn(`⚠  "${slug}" — unknown section "${row['Section']}", skipped`)
    fail++
    continue
  }

  process.stdout.write(`  ${slug.padEnd(46)} `)

  try {
    // 1. Upload image
    let mainImage
    if (row['Image']?.trim()) {
      const asset = await uploadImage(row['Image'])
      if (asset) mainImage = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    }

    // 2. Build document
    const safeId = slug.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-')

    const doc = {
      _type: 'article',
      _id: `article-${safeId}`,
      title: row['Title'],
      slug: { _type: 'slug', current: slug },
      language: sectionInfo.language,
      section: sectionInfo.section,
      category: row['Category'],
      author: row['Author'],
      excerpt: row['Description'],
      body: htmlToBlocks(row['Text']),
      poems: buildPoems(row),
      publishedAt: row['Date'] || undefined,
      featured: row['Latest'] || 'NO',
    }

    const translationSlug = extractSlug(row['Traduction'])
    if (translationSlug) doc.translationSlug = translationSlug

    const audioFile = row['Audio File']?.trim()
    if (audioFile) doc.audioFile = audioFile

    const audioQuote = row['Audio Quote']?.trim()
    if (audioQuote) doc.audioQuote = audioQuote

    if (mainImage) doc.mainImage = mainImage

    // 3. Upsert
    await client.createOrReplace(doc)
    console.log('✓')
    ok++
  } catch (err) {
    console.log(`✗  ${err.message}`)
    fail++
  }

  // Small pause to stay within Sanity rate limits
  await new Promise(r => setTimeout(r, 150))
}

console.log(`\nDone — ${ok} imported, ${fail} failed.\n`)
