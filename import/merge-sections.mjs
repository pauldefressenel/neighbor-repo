// Moves the articles of the old `the-arts` section into `literature-review`,
// Essais & Critiques' one value (shared/sections.js): the two were shown as
// one rubrique already, and the Studio's Rubrique field now names only the
// three rubriques. Drafts included. Nothing changes on the site or the app.
//
//   node import/merge-sections.mjs                        # dry run
//   SANITY_TOKEN=<token> node import/merge-sections.mjs --write

import { createClient } from '@sanity/client'

const WRITE = process.argv.includes('--write')
const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/merge-sections.mjs --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

const ids = await client.fetch(`*[_type == "article" && section == "the-arts"]._id`)
ids.forEach((id) => console.log(`  ${id}`))
if (!WRITE) {
  console.log(`\nDry run: ${ids.length} articles to move from the-arts to literature-review. Add --write to move them.`)
} else if (ids.length) {
  const transaction = client.transaction()
  ids.forEach((id) => transaction.patch(id, (p) => p.set({ section: 'literature-review' })))
  await transaction.commit()
  console.log(`\nMoved ${ids.length} articles.`)
}
