// Sets each article's main image to its new vignette. The vignettes come
// numbered per rubrique, 1 being the oldest French article; the table below
// names them. Each French article's English translation gets the same
// drawing. English-only articles are not covered.
//
//   node import/assign-vignettes.mjs <vignettes dir>                    # dry run
//   SANITY_TOKEN=<token> node import/assign-vignettes.mjs <dir> --write
//
// Every --write first saves the articles' previous mainImage values to
// import/backup-vignettes-<timestamp>.ndjson.

import { createReadStream, existsSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createClient } from '@sanity/client'

// French slug ← file, in publication order. Les Nuits blanches and the
// Nietzsche essay share a date; the drawings settle it (9 is the sumo).
const VIGNETTES = {
  'essais-critiques': [
    'narcissus-and-goldmund-fr',
    'inherent-vice-fr',
    'sur-l-aliénation-de-l-artiste',
    'apprivoiser-le-jazz',
    'la-mort-d-ivan-ilyitch',
    'vivaldi-mon-père-et-moi',
    'mektoub-my-love-fr',
    'salammbô-flaubert-fr',
    'sur-nietzsche-chez-marty-mauser-et-alysa-liu',
    'les-nuits-blanches',
    'cyrano-de-bergerac',
    'borsalino-mon-voisin-et-ma-casquette',
    'kolkhoze',
  ],
  'prose-poesie': [
    'la-grande-nausée',
    'shibuya-dancing-fr',
    'eloge-de-la-mauvaise-foi',
    'la-chute-et-l-envol',
  ],
}

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const DIR = args.find((a) => !a.startsWith('--'))
if (!DIR) {
  console.error('Usage: node import/assign-vignettes.mjs <vignettes dir> [--write]')
  process.exit(1)
}
const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/assign-vignettes.mjs <dir> --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

// Some translation links use an unaccented spelling of the other slug
// (salammbo-flaubert-en for salammbô-flaubert-en), so slugs are compared
// without accents.
const bare = (s) => (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Every article, published and draft copies alike.
const articles = await client.fetch(
  `*[_type == "article"]{ _id, "slug": slug.current, translationSlug, mainImage }`,
  {},
  { perspective: 'raw' },
)

// Each French article and its translation.
const plan = []
for (const [folder, slugs] of Object.entries(VIGNETTES)) {
  for (const [i, slug] of slugs.entries()) {
    const file = resolve(join(DIR, folder, `${i + 1}.png`))
    if (!existsSync(file)) throw new Error(`missing ${file}`)
    const fr = articles.find((a) => a.slug === slug)
    if (!fr) throw new Error(`no article ${slug}`)
    const pair = new Set([bare(slug), bare(fr.translationSlug)].filter(Boolean))
    const docs = articles.filter((a) => pair.has(bare(a.slug)))
    plan.push({ file, label: `${folder}/${i + 1}.png`, docs })
  }
}

for (const { label, docs } of plan) {
  console.log(`${label.padEnd(22)} → ${docs.map((d) => d._id.replace(/^article-/, '')).join(', ')}`)
}
const total = plan.reduce((n, p) => n + p.docs.length, 0)
console.log(`\n${plan.length} vignettes, ${total} documents`)
if (!WRITE) {
  console.log('Dry run: nothing written. Add --write to apply.')
  process.exit(0)
}

const backup = `import/backup-vignettes-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`
writeFileSync(backup, plan.flatMap((p) => p.docs.map((d) => JSON.stringify({ _id: d._id, mainImage: d.mainImage ?? null }))).join('\n') + '\n')
console.log(`Backed up previous images to ${backup}`)

for (const { file, label, docs } of plan) {
  const asset = await client.assets.upload('image', createReadStream(file), { filename: `${docs[0].slug}.png` })
  // A fresh image: any crop or hotspot was set for the old drawing.
  const mainImage = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  const tx = client.transaction()
  docs.forEach((d) => tx.patch(d._id, { set: { mainImage } }))
  await tx.commit()
  console.log(`${label} → ${docs.length} documents`)
}
