// Sets the Essais & Critiques articles' categories to the rubrique's list
// (shared/sections.js), as chosen on 2026-10-13 after reading them all. Each
// article's translation takes the same category in its own language.
//
//   node import/set-categories.mjs                        # dry run
//   SANITY_TOKEN=<token> node import/set-categories.mjs --write

import { createClient } from '@sanity/client'
import { RUBRIQUES } from '../shared/sections.js'

const WRITE = process.argv.includes('--write')
const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/set-categories.mjs --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

const [BOOKS, FILM, MUSIC, CROSSROADS] = RUBRIQUES.find((r) => r.categories).categories

// Document id ← category, French and English versions alike.
const CATEGORY = {
  'article-kolkhoze': BOOKS,
  'article-cyrano-de-bergerac': BOOKS,
  'article-les-nuits-blanches': BOOKS,
  'article-salammbo-flaubert-fr': BOOKS,
  'article-salammbo-flaubert-en': BOOKS,
  'article-la-mort-d-ivan-ilyitch': BOOKS,
  'article-the-death-of-ivan-ilyitch': BOOKS,
  'article-narcissus-and-goldmund-fr': BOOKS,
  'article-narcissus-and-goldmund-en': BOOKS,
  'article-the-world-of-yesterday': BOOKS,
  'article-mektoub-my-love-fr': FILM,
  'article-mektoub-my-love-en': FILM,
  'article-inherent-vice-fr': FILM,
  'article-inherent-vice-en': FILM,
  'article-apprivoiser-le-jazz': MUSIC,
  'article-the-dissonance-of-jazz': MUSIC,
  'article-vivaldi-mon-pere-et-moi': MUSIC,
  'article-vivaldi-my-dad-and-i': MUSIC,
  'article-the-hidden-apocalypse-in-kendrick-lamar-s--damn--': MUSIC,
  'article-etude-blue': MUSIC,
  'article-sur-nietzsche-chez-marty-mauser-et-alysa-liu': CROSSROADS,
  'article-nietzsche-through-marty-mauser-and-alysa-liu': CROSSROADS,
  'article-sur-l-alienation-de-l-artiste': CROSSROADS,
  'article-on-creative-alienation': CROSSROADS,
  'article-borsalino-mon-voisin-et-ma-casquette': CROSSROADS,
}

const articles = await client.fetch(
  `*[_type == "article" && section in ["literature-review", "the-arts"] && !(_id in path("drafts.**"))]{ _id, language, category }`,
)
const transaction = client.transaction()
let changes = 0
for (const { _id, language, category } of articles) {
  const wanted = CATEGORY[_id]?.[language]
  if (!wanted) {
    console.log(`  not in the table, left alone: ${_id} (${category})`)
    continue
  }
  if (wanted === category) continue
  console.log(`${_id.padEnd(62)} ${category} → ${wanted}`)
  transaction.patch(_id, (p) => p.set({ category: wanted }))
  changes++
}
const missing = Object.keys(CATEGORY).filter((id) => !articles.some((a) => a._id === id))
if (missing.length) console.log(`\nIn the table but not found: ${missing.join(', ')}`)

if (!WRITE) {
  console.log(`\nDry run: ${changes} categories to set. Add --write to save them.`)
} else if (changes) {
  await transaction.commit()
  console.log(`\nSet ${changes} categories.`)
}
