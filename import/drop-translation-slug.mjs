// Removes the `translationSlug` field from every article: the schema no
// longer has it (nothing read it; it named each article's translation by
// slug). The pairs are saved first to
// import/backup-translations-<timestamp>.ndjson, the only record of them.
//
//   node import/drop-translation-slug.mjs                        # dry run
//   SANITY_TOKEN=<token> node import/drop-translation-slug.mjs --write

import { writeFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

const WRITE = process.argv.includes('--write')
const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/drop-translation-slug.mjs --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

const linked = await client.fetch(
  `*[_type == "article" && defined(translationSlug)]{ _id, "slug": slug.current, translationSlug }`,
)
linked.forEach((a) => console.log(`  ${a.slug} → ${a.translationSlug}`))
if (!WRITE) {
  console.log(`\nDry run: ${linked.length} articles to clear. Add --write to save the pairs and clear them.`)
  process.exit(0)
}
if (!linked.length) process.exit(0)

const backup = `import/backup-translations-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`
writeFileSync(backup, linked.map((a) => JSON.stringify(a)).join('\n') + '\n')
console.log(`\nSaved the pairs to ${backup}`)

const transaction = client.transaction()
linked.forEach(({ _id }) => transaction.patch(_id, (p) => p.unset(['translationSlug'])))
await transaction.commit()
console.log(`Cleared ${linked.length} articles.`)
